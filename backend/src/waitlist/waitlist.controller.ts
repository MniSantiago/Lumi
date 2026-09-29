import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiExcludeEndpoint,
  ApiNoContentResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { eq } from 'drizzle-orm';
import type { Request } from 'express';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

import { normalizeEmail } from '../auth/crypto.js';
import { DB, type Database } from '../db/database.module.js';
import { waitlistEntries } from '../db/schema.js';
import { MailService } from '../mail/mail.service.js';
import { waitlistWelcomeMail } from '../mail/templates.js';
import type { Env } from '../config/env.js';
import {
  isValidUnsubscribeToken,
  unsubscribePage,
  unsubscribeUrl,
} from './unsubscribe.js';

const clip = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().slice(0, 200) : value;

/** Lo que manda `landing/main.js`. Todo menos el correo es opcional. */
export class JoinWaitlistDto {
  @ApiProperty()
  @Transform(clip)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({
    description: 'App que más le roba tiempo',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @Transform(clip)
  @IsString()
  app?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  form?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_source?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_medium?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_campaign?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_content?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  ref?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  referrer?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @Transform(clip)
  @IsString()
  lang?: string | null;
}

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly mail: MailService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Base de los enlaces de los correos: PUBLIC_URL o, si no está, la de esta petición. */
  private publicUrl(req: Request) {
    return (
      this.config.get('PUBLIC_URL', { infer: true }) ||
      `${req.protocol}://${req.get('host')}`
    );
  }

  /** Apuntarse dos veces no es un error: responde igual, no duplica y solo manda el correo la primera vez. */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async joinWaitlist(
    @Body() dto: JoinWaitlistDto,
    @Req() req: Request,
  ): Promise<void> {
    const email = normalizeEmail(dto.email);
    const inserted = await this.db
      .insert(waitlistEntries)
      .values({
        email,
        app: dto.app ?? null,
        form: dto.form ?? null,
        utmSource: dto.utm_source ?? null,
        utmMedium: dto.utm_medium ?? null,
        utmCampaign: dto.utm_campaign ?? null,
        utmContent: dto.utm_content ?? null,
        ref: dto.ref ?? null,
        referrer: dto.referrer ?? null,
        lang: dto.lang ?? null,
      })
      .onConflictDoNothing({ target: waitlistEntries.email })
      .returning({ id: waitlistEntries.id });
    if (inserted.length > 0) {
      const secret = this.config.get('JWT_SECRET', { infer: true });
      await this.mail.send(
        email,
        waitlistWelcomeMail(unsubscribeUrl(this.publicUrl(req), email, secret)),
      );
    }
  }

  /** Enlace del correo: pide confirmación (abrir el enlace no borra nada; los antivirus del correo lo abren solos). */
  @Get('unsubscribe')
  @ApiExcludeEndpoint()
  @Header('Content-Type', 'text/html; charset=utf-8')
  unsubscribeForm(
    @Query('email') email = '',
    @Query('token') token = '',
  ): string {
    const secret = this.config.get('JWT_SECRET', { infer: true });
    return isValidUnsubscribeToken(email, token, secret)
      ? unsubscribePage('confirm', { email, token })
      : unsubscribePage('invalid');
  }

  /** Confirmación del formulario o baja en un clic desde el cliente de correo (List-Unsubscribe-Post). */
  @Post('unsubscribe')
  @ApiExcludeEndpoint()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/html; charset=utf-8')
  async unsubscribe(
    @Query() query: Record<string, string | undefined>,
    @Body() body: Record<string, string | undefined>,
  ): Promise<string> {
    const email = String(body?.email ?? query.email ?? '');
    const token = String(body?.token ?? query.token ?? '');
    const secret = this.config.get('JWT_SECRET', { infer: true });
    if (!isValidUnsubscribeToken(email, token, secret))
      return unsubscribePage('invalid');
    await this.db
      .delete(waitlistEntries)
      .where(eq(waitlistEntries.email, email));
    return unsubscribePage('done');
  }
}
