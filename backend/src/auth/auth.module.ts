import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import type { Env } from '../config/env.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { MeController } from './me.controller.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: { issuer: 'lumi', audience: 'lumi-app' },
        verifyOptions: { issuer: 'lumi', audience: 'lumi-app' },
      }),
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
