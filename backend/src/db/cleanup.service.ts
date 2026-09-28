import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { lt, or } from 'drizzle-orm';

import { DB, type Database } from './database.module.js';
import { emailCodes, refreshTokens } from './schema.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Limpieza diaria: tokens de refresco caducados y códigos por correo viejos.
 * Los tokens revocados se guardan hasta que caducan, porque sirven para
 * detectar que alguien reutiliza uno robado.
 */
@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(@Inject(DB) private readonly db: Database) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async run(now = new Date()) {
    const dayAgo = new Date(now.getTime() - DAY_MS);
    const tokens = await this.db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, now))
      .returning({ id: refreshTokens.id });
    const codes = await this.db
      .delete(emailCodes)
      .where(
        or(lt(emailCodes.expiresAt, dayAgo), lt(emailCodes.consumedAt, dayAgo)),
      )
      .returning({ id: emailCodes.id });
    this.logger.log(
      `Limpieza: ${tokens.length} tokens y ${codes.length} códigos borrados`,
    );
    return { tokens: tokens.length, codes: codes.length };
  }
}
