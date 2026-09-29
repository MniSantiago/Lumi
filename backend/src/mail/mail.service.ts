import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import type { Env } from '../config/env.js';
import type { MailContent } from './templates.js';

/**
 * Envío de correos con Resend. Sin `RESEND_API_KEY` (desarrollo y tests) no
 * envía nada: escribe el correo en el log para poder copiar el código.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    const key = config.get('RESEND_API_KEY', { infer: true });
    this.resend = key ? new Resend(key) : null;
    this.from = config.get('MAIL_FROM', { infer: true });
  }

  async send(to: string, mail: MailContent): Promise<void> {
    if (!this.resend) {
      this.logger.log(
        `[correo sin enviar] Para: ${to} · ${mail.subject}\n${mail.text}`,
      );
      return;
    }
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.headers,
    });
    // No rompemos la petición del usuario por un fallo de correo: queda en el log.
    if (error)
      this.logger.error(
        `Resend no ha podido enviar "${mail.subject}": ${error.message}`,
      );
  }
}
