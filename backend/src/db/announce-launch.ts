/**
 * Aviso de lanzamiento a toda la lista de espera, cada persona en su idioma y
 * con su enlace de baja. Sin --send solo simula: cuenta por idioma y enseña el
 * asunto de cada uno (no envía nada).
 *
 * Uso (con las variables de producción):
 *   APP_STORE_URL=https://apps.apple.com/app/id… node dist/db/announce-launch.js           # simulación
 *   APP_STORE_URL=… node dist/db/announce-launch.js --send                                   # envía
 *   APP_STORE_URL=… node dist/db/announce-launch.js --send --skip 120                        # retoma tras un corte
 */
import { asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { Resend } from 'resend';

import { langFrom, withLang, type Lang } from '../i18n.js';
import { launchMail } from '../mail/templates.js';
import { unsubscribeUrl } from '../waitlist/unsubscribe.js';
import * as schema from './schema.js';

const need = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${key}`);
  return value;
};

const send = process.argv.includes('--send');
const skipAt = process.argv.indexOf('--skip');
const skip = skipAt > 0 ? Number(process.argv[skipAt + 1]) || 0 : 0;

const appStoreUrl = need('APP_STORE_URL');
const publicUrl = need('PUBLIC_URL').replace(/\/$/, '');
const secret = need('JWT_SECRET');
const pool = new pg.Pool({ connectionString: need('DATABASE_URL'), max: 1 });
const resend = send ? new Resend(need('RESEND_API_KEY')) : null;
const from = send ? need('MAIL_FROM') : '';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

try {
  const db = drizzle(pool, { schema });
  const rows = await db
    .select()
    .from(schema.waitlistEntries)
    .orderBy(asc(schema.waitlistEntries.createdAt));
  const perLang = new Map<Lang, number>();
  let sent = 0;
  for (const [i, row] of rows.entries()) {
    const lang = langFrom(row.lang ?? undefined);
    perLang.set(lang, (perLang.get(lang) ?? 0) + 1);
    if (i < skip) continue;
    const mail = withLang(lang, () =>
      launchMail(appStoreUrl, unsubscribeUrl(publicUrl, row.email, secret)),
    );
    if (!resend) {
      if (perLang.get(lang) === 1) console.log(`[${lang}] ${mail.subject}`);
      continue;
    }
    const { error } = await resend.emails.send({
      from,
      to: row.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.headers,
    });
    if (error) {
      console.error(
        `Fallo en ${i} (${row.email}): ${error.message}. Para seguir: --skip ${i}`,
      );
      process.exitCode = 1;
      break;
    }
    sent += 1;
    // Resend permite unas pocas peticiones por segundo.
    await wait(600);
  }
  console.log(
    `${rows.length} en la lista (${[...perLang].map(([l, n]) => `${l}: ${n}`).join(', ')}). ${
      send
        ? `Enviados: ${sent}.`
        : 'Simulación: no se ha enviado nada (usa --send).'
    }`,
  );
} finally {
  await pool.end();
}
