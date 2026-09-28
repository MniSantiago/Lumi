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

const clip = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().slice(0, 200) : value;

/** Lo que manda `landing/main.js`. Todo menos el correo es opcional. */
export class JoinWaitlistDto {
  @ApiProperty()
  @Transform(clip)
  @IsEmail({}, { message: 'Ese correo no parece completo' })
  @MaxLength(254)
  email: string;

  @ApiPropertyOptional({ description: 'App que más le roba tiempo' })
  @IsOptional()
  @Transform(clip)
  @IsString()
  app?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  form?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_source?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_medium?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_campaign?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  utm_content?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  ref?: string;
  @ApiPropertyOptional() @IsOptional() @Transform(clip) @IsString() referrer?:
    string | null;
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(clip)
  @IsString()
  lang?: string;
}

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(@Inject(DB) private readonly db: Database) {}

  /** Apuntarse dos veces no es un error: responde igual y no duplica. */
  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async joinWaitlist(@Body() dto: JoinWaitlistDto): Promise<void> {
    await this.db
      .insert(waitlistEntries)
      .values({
        email: normalizeEmail(dto.email),
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
      .onConflictDoNothing({ target: waitlistEntries.email });
  }
}
