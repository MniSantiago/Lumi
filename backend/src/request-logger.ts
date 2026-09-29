import { randomUUID } from 'node:crypto';
import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');
const VALID_ID = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Una línea por petición (método, ruta sin query, estado y duración) con un
 * `X-Request-Id` que también se devuelve: con él se encuentra una petición
 * concreta en los logs cuando alguien escribe a soporte. Nunca registra
 * cuerpos, cabeceras ni la query (puede haber correos o tokens).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health') return next();
  const incoming = req.header('x-request-id');
  const id = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', id);
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const line = {
      id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms: Math.round(ms),
    };
    if (res.statusCode >= 500) logger.error(line);
    else if (process.env.NODE_ENV !== 'test') logger.log(line);
  });
  next();
}
