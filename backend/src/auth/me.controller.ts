import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service.js';
import {
  AuthSessionDto,
  ChangePasswordDto,
  DeleteAccountDto,
  UpdateMeDto,
  UserDto,
} from './dto.js';
import { CurrentUserId, JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  @ApiOkResponse({ type: UserDto })
  getMe(@CurrentUserId() userId: string) {
    return this.auth.getMe(userId);
  }

  @Patch()
  @ApiOkResponse({ type: UserDto })
  updateMe(@CurrentUserId() userId: string, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(userId, dto);
  }

  @Post('password')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: AuthSessionDto,
    description: 'Cierra las demás sesiones y devuelve una nueva',
  })
  changePassword(
    @CurrentUserId() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  /** POST en vez de DELETE con cuerpo, que algunos clientes y proxies no llevan bien. */
  @Post('delete')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Cuenta y datos borrados' })
  deleteAccount(
    @CurrentUserId() userId: string,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.auth.deleteAccount(userId, dto.password);
  }
}
