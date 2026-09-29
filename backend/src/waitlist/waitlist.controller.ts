import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

import { normalizeEmail } from '../auth/crypto.js';
import { DB, type Database } from '../db/database.module.js';
import { waitlistEntries } from '../db/schema.js';
import { MailService } from '../mail/mail.service.js';
import { waitlistWelcomeMail } from '../mail/templates.js';

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
  ) {}

  /** Apuntarse dos veces no es un error: responde igual, no duplica y solo manda el correo la primera vez. */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async joinWaitlist(@Body() dto: JoinWaitlistDto): Promise<void> {
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
    if (inserted.length > 0) await this.mail.send(email, waitlistWelcomeMail());
  }
}
