import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** 8+ caracteres. Sin reglas raras de símbolos: la longitud es lo que más protege. */
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export class RegisterDto {
  @ApiProperty({ example: 'tu@correo.com' })
  @Transform(trim)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  @MaxLength(254)
  email: string;

  @ApiProperty({ minLength: PASSWORD_MIN, maxLength: PASSWORD_MAX })
  @IsString()
  @MinLength(PASSWORD_MIN, {
    message: `La contraseña necesita al menos ${PASSWORD_MIN} caracteres`,
  })
  @MaxLength(PASSWORD_MAX)
  password: string;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  name?: string;

  @ApiPropertyOptional({ maxLength: 24 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(24)
  lumiName?: string;
}

export class LoginDto {
  @ApiProperty()
  @Transform(trim)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  email: string;

  @ApiProperty()
  @IsString()
  @MaxLength(PASSWORD_MAX)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  refreshToken: string;
}

export class CodeDto {
  @ApiProperty({ example: '123456', pattern: '^\\d{6}$' })
  @Transform(trim)
  @Matches(/^\d{6}$/, { message: 'El código tiene 6 cifras' })
  code: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @Transform(trim)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @Transform(trim)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  email: string;

  @ApiProperty({ example: '123456', pattern: '^\\d{6}$' })
  @Transform(trim)
  @Matches(/^\d{6}$/, { message: 'El código tiene 6 cifras' })
  code: string;

  @ApiProperty({ minLength: PASSWORD_MIN, maxLength: PASSWORD_MAX })
  @IsString()
  @MinLength(PASSWORD_MIN, {
    message: `La contraseña necesita al menos ${PASSWORD_MIN} caracteres`,
  })
  @MaxLength(PASSWORD_MAX)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MaxLength(PASSWORD_MAX)
  currentPassword: string;

  @ApiProperty({ minLength: PASSWORD_MIN, maxLength: PASSWORD_MAX })
  @IsString()
  @MinLength(PASSWORD_MIN, {
    message: `La contraseña necesita al menos ${PASSWORD_MIN} caracteres`,
  })
  @MaxLength(PASSWORD_MAX)
  newPassword: string;
}

export class DeleteAccountDto {
  @ApiProperty({ description: 'Contraseña actual, para confirmar' })
  @IsString()
  @MaxLength(PASSWORD_MAX)
  password: string;
}

export class UpdateMeDto {
  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  name?: string;

  @ApiPropertyOptional({ maxLength: 24 })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(24)
  lumiName?: string;
}

export class UserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lumiName: string;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}

export class AuthSessionDto {
  @ApiProperty({ description: 'JWT de acceso. Caduca en 15 minutos.' })
  accessToken: string;

  @ApiProperty({
    description:
      'Token de refresco opaco. Caduca en 30 días y se rota en cada uso.',
  })
  refreshToken: string;

  @ApiProperty({ description: 'Segundos hasta que caduca el token de acceso.' })
  expiresIn: number;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}

export class ExportDto {
  @ApiProperty({ format: 'date-time' })
  exportedAt: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'Copia del progreso guardada en la cuenta',
  })
  progress: Record<string, unknown> | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  progressUpdatedAt: string | null;
}
