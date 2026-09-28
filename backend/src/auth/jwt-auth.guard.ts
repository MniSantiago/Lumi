import {
  createParamDecorator,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import type { AccessPayload } from './auth.service.js';

type AuthedRequest = Request & { userId?: string };

/** Exige `Authorization: Bearer <accessToken>` válido y deja el id del usuario en la petición. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException();
    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token);
      req.userId = payload.sub;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const id = ctx.switchToHttp().getRequest<AuthedRequest>().userId;
    if (!id) throw new UnauthorizedException();
    return id;
  },
);
