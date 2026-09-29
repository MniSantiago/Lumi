import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { ProgressController } from './progress.controller.js';

@Module({ imports: [AuthModule], controllers: [ProgressController] })
export class ProgressModule {}
