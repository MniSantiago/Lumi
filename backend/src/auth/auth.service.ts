import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq, gt, isNull } from 'drizzle-orm';

import { DB, type Database } from '../db/database.module.js';
import {
  emailCodes,
  refreshTokens,
  users,
  type EmailCodePurpose,
  type User,
} from '../db/schema.js';
import { MailService } from '../mail/mail.service.js';
import {
  accountDeletedMail,
  passwordChangedMail,
  resetPasswordMail,
  verifyEmailMail,
} from '../mail/templates.js';
import {
  hashPassword,
  normalizeEmail,
  randomCode,
  randomToken,
  sha256,
  verifyPassword,
} from './crypto.js';
import type { AuthSessionDto, RegisterDto, UserDto } from './dto.js';

export const ACCESS_TOKEN_TTL_S = 15 * 60;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const CODE_TTL_MS = 15 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;

/** Hash de relleno para que "ese correo no existe" tarde lo mismo que "contraseña mal". */
const DUMMY_HASH = hashPassword('lumi-no-existe');

export type AccessPayload = { sub: string };

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  /* ───────── Sesión ───────── */

  async register(dto: RegisterDto): Promise<AuthSessionDto> {
    const email = normalizeEmail(dto.email);
    const passwordHash = await hashPassword(dto.password);
    const [user] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: dto.name ?? '',
        lumiName: dto.lumiName || 'Lumi',
      })
      .onConflictDoNothing({ target: users.email })
      .returning();
    if (!user)
      throw new ConflictException(
        'Ya hay una cuenta con ese correo. Prueba a entrar.',
      );

    await this.sendCode(user, 'verify_email');
    return this.createSession(user);
  }

  async login(emailInput: string, password: string): Promise<AuthSessionDto> {
    const user = await this.findByEmail(emailInput);
    const ok = await verifyPassword(
      password,
      user?.passwordHash ?? (await DUMMY_HASH),
    );
    if (!user || !ok)
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    return this.createSession(user);
  }

  /** Rota el token: el usado se revoca y se entrega uno nuevo. Si alguien reutiliza uno ya revocado, se cierran todas las sesiones. */
  async refresh(token: string): Promise<AuthSessionDto> {
    const row = await this.db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.tokenHash, sha256(token)),
    });
    if (!row || row.expiresAt <= new Date())
      throw new UnauthorizedException('La sesión ha caducado');
    if (row.revokedAt) {
      await this.revokeAllSessions(row.userId);
      throw new UnauthorizedException('La sesión ha caducado');
    }
    const [revoked] = await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.id, row.id), isNull(refreshTokens.revokedAt)))
      .returning({ id: refreshTokens.id });
    // Dos refrescos a la vez con el mismo token: solo gana uno.
    if (!revoked) throw new UnauthorizedException('La sesión ha caducado');

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, row.userId),
    });
    if (!user) throw new UnauthorizedException('La sesión ha caducado');
    return this.createSession(user);
  }

  async logout(token: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.tokenHash, sha256(token)),
          isNull(refreshTokens.revokedAt),
        ),
      );
  }

  /* ───────── Verificar el correo ───────── */

  async resendVerification(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user.emailVerifiedAt) return;
    await this.sendCode(user, 'verify_email');
  }

  async verifyEmail(userId: string, code: string): Promise<UserDto> {
    const user = await this.getUser(userId);
    if (user.emailVerifiedAt) return toUserDto(user);
    await this.consumeCode(user.id, 'verify_email', code);
    const [updated] = await this.db
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    return toUserDto(updated);
  }

  /* ───────── Contraseña ───────── */

  /** Nunca dice si el correo existe: responde igual siempre. */
  async forgotPassword(emailInput: string): Promise<void> {
    const user = await this.findByEmail(emailInput);
    if (user) await this.sendCode(user, 'reset_password');
  }

  async resetPassword(
    emailInput: string,
    code: string,
    password: string,
  ): Promise<void> {
    const user = await this.findByEmail(emailInput);
    if (!user)
      throw new BadRequestException('El código no es válido o ha caducado');
    await this.consumeCode(user.id, 'reset_password', code);
    await this.setPassword(user, password);
    // Si ha recibido el código, el correo es suyo.
    if (!user.emailVerifiedAt) {
      await this.db
        .update(users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(users.id, user.id));
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<AuthSessionDto> {
    const user = await this.getUser(userId);
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw new BadRequestException('La contraseña actual no es correcta');
    }
    await this.setPassword(user, newPassword);
    // Se cierran las demás sesiones; este dispositivo sigue dentro con una nueva.
    return this.createSession(user);
  }

  /* ───────── Cuenta ───────── */

  async getMe(userId: string): Promise<UserDto> {
    return toUserDto(await this.getUser(userId));
  }

  async updateMe(
    userId: string,
    patch: { name?: string; lumiName?: string },
  ): Promise<UserDto> {
    const set: Partial<Pick<User, 'name' | 'lumiName'>> = {};
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.lumiName !== undefined) set.lumiName = patch.lumiName || 'Lumi';
    if (Object.keys(set).length === 0) return this.getMe(userId);
    const [user] = await this.db
      .update(users)
      .set(set)
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new UnauthorizedException();
    return toUserDto(user);
  }

  /** Borra la cuenta y todo lo suyo (tokens y códigos caen en cascada). Lo exige Apple (guía 5.1.1(v)). */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!(await verifyPassword(password, user.passwordHash))) {
      throw new BadRequestException('La contraseña no es correcta');
    }
    await this.db.delete(users).where(eq(users.id, user.id));
    await this.mail.send(user.email, accountDeletedMail(user.name));
  }

  /* ───────── Internos ───────── */

  private findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(users.email, normalizeEmail(email)),
    });
  }

  private async getUser(userId: string): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  private async createSession(user: User): Promise<AuthSessionDto> {
    const refreshToken = randomToken();
    await this.db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    const accessToken = await this.jwt.signAsync(
      { sub: user.id } satisfies AccessPayload,
      {
        expiresIn: ACCESS_TOKEN_TTL_S,
      },
    );
    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_S,
      user: toUserDto(user),
    };
  }

  private async revokeAllSessions(userId: string) {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }

  private async setPassword(user: User, password: string) {
    await this.db
      .update(users)
      .set({ passwordHash: await hashPassword(password) })
      .where(eq(users.id, user.id));
    await this.revokeAllSessions(user.id);
    await this.mail.send(user.email, passwordChangedMail(user.name));
  }

  /** Invalida los códigos anteriores del mismo tipo y envía uno nuevo. */
  private async sendCode(user: User, purpose: EmailCodePurpose) {
    const code = randomCode();
    await this.db.transaction(async (tx) => {
      await tx
        .update(emailCodes)
        .set({ consumedAt: new Date() })
        .where(
          and(
            eq(emailCodes.userId, user.id),
            eq(emailCodes.purpose, purpose),
            isNull(emailCodes.consumedAt),
          ),
        );
      await tx.insert(emailCodes).values({
        userId: user.id,
        purpose,
        codeHash: sha256(`${user.id}:${code}`),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      });
    });
    const mail =
      purpose === 'verify_email'
        ? verifyEmailMail(code, user.name)
        : resetPasswordMail(code, user.name);
    await this.mail.send(user.email, mail);
  }

  private async consumeCode(
    userId: string,
    purpose: EmailCodePurpose,
    code: string,
  ) {
    const invalid = new BadRequestException(
      'El código no es válido o ha caducado',
    );
    const row = await this.db.query.emailCodes.findFirst({
      where: and(
        eq(emailCodes.userId, userId),
        eq(emailCodes.purpose, purpose),
        isNull(emailCodes.consumedAt),
        gt(emailCodes.expiresAt, new Date()),
      ),
    });
    if (!row || row.attempts >= CODE_MAX_ATTEMPTS) throw invalid;
    if (row.codeHash !== sha256(`${userId}:${code}`)) {
      await this.db
        .update(emailCodes)
        .set({ attempts: row.attempts + 1 })
        .where(eq(emailCodes.id, row.id));
      throw invalid;
    }
    const [consumed] = await this.db
      .update(emailCodes)
      .set({ consumedAt: new Date() })
      .where(and(eq(emailCodes.id, row.id), isNull(emailCodes.consumedAt)))
      .returning({ id: emailCodes.id });
    if (!consumed) throw invalid;
  }
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    lumiName: user.lumiName,
    emailVerified: !!user.emailVerifiedAt,
    createdAt: user.createdAt.toISOString(),
  };
}
