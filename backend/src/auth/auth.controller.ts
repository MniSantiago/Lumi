import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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
  CodeDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
  UserDto,
} from './dto.js';
import { CurrentUserId, JwtAuthGuard } from './jwt-auth.guard.js';

/** Límite más estricto en lo que se puede usar para adivinar contraseñas o códigos. */
const STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle(STRICT)
  @ApiOkResponse({ type: AuthSessionDto })
  @HttpCode(HttpStatus.OK)
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthSessionDto })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthSessionDto })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle(STRICT)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto })
  verifyEmail(@CurrentUserId() userId: string, @Body() dto: CodeDto) {
    return this.auth.verifyEmail(userId, dto.code);
  }

  @Post('verify-email/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  resendVerification(@CurrentUserId() userId: string) {
    return this.auth.resendVerification(userId);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Responde igual exista o no el correo' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle(STRICT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.email, dto.code, dto.password);
  }
}
