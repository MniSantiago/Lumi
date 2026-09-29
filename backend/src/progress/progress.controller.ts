import {
  Body,
  Controller,
  Get,
  Inject,
  PayloadTooLargeException,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { eq, sql } from 'drizzle-orm';

import { CurrentUserId, JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { DB, type Database } from '../db/database.module.js';
import { progress, users } from '../db/schema.js';

/** Tope de la copia guardada. Un año de días ocupa bastante menos. */
const MAX_BYTES = 512 * 1024;

export class SaveProgressDto {
  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Progreso de la app tal cual (el servidor no lo interpreta)',
  })
  @IsObject()
  data: Record<string, unknown>;
}

export class ProgressDto {
  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true })
  data: Record<string, unknown> | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: string | null;
}

/**
 * Copia del progreso de la cuenta. El servidor no interpreta su contenido:
 * lo guarda y lo devuelve. Gana la última escritura.
 */
@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me/progress')
export class ProgressController {
  constructor(@Inject(DB) private readonly db: Database) {}

  @Get()
  @ApiOkResponse({ type: ProgressDto })
  async getProgress(@CurrentUserId() userId: string): Promise<ProgressDto> {
    const row = await this.db.query.progress.findFirst({
      where: eq(progress.userId, userId),
    });
    return {
      data: row?.data ?? null,
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }

  @Put()
  @ApiOkResponse({ type: ProgressDto })
  async saveProgress(
    @CurrentUserId() userId: string,
    @Body() dto: SaveProgressDto,
  ): Promise<ProgressDto> {
    if (Buffer.byteLength(JSON.stringify(dto.data)) > MAX_BYTES) {
      throw new PayloadTooLargeException('El progreso es demasiado grande');
    }
    // Un token de acceso aún vigente de una cuenta recién borrada: 401, no un 500 por la clave ajena.
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });
    if (!user) throw new UnauthorizedException();
    const [row] = await this.db
      .insert(progress)
      .values({ userId, data: dto.data })
      .onConflictDoUpdate({
        target: progress.userId,
        set: { data: dto.data, updatedAt: sql`now()` },
      })
      .returning();
    return { data: row.data, updatedAt: row.updatedAt.toISOString() };
  }
}
