import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { sql } from 'drizzle-orm';

import { DB, type Database } from './db/database.module.js';

/** Para el balanceador o la plataforma de despliegue: comprueba también la base de datos. */
@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(@Inject(DB) private readonly db: Database) {}

  @Get()
  @ApiOkResponse({
    schema: { properties: { status: { type: 'string', example: 'ok' } } },
  })
  async healthCheck() {
    await this.db.execute(sql`select 1`);
    return { status: 'ok' };
  }
}
