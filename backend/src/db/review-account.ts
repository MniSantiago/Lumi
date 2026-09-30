/**
 * Crea (o pone al día) la cuenta de prueba para la revisión de Apple, ya con el
 * correo verificado, para no depender de recibir el código.
 *
 * Uso: REVIEW_EMAIL=review@… REVIEW_PASSWORD=… node dist/db/review-account.js
 * (en local: npm run review:account). Si la cuenta existe, cambia la contraseña
 * y cierra sus sesiones.
 */
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { hashPassword, normalizeEmail } from '../auth/crypto.js';
import * as schema from './schema.js';

const url = process.env.DATABASE_URL;
const email = normalizeEmail(process.env.REVIEW_EMAIL ?? '');
const password = process.env.REVIEW_PASSWORD ?? '';
if (!url) throw new Error('Falta la variable de entorno DATABASE_URL');
if (!email.includes('@')) throw new Error('Falta REVIEW_EMAIL');
if (password.length < 8)
  throw new Error('REVIEW_PASSWORD necesita al menos 8 caracteres');

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  const db = drizzle(pool, { schema });
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      name: 'App Review',
      lumiName: 'Lampi',
      emailVerifiedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { passwordHash, emailVerifiedAt: now },
    })
    .returning({ id: schema.users.id });
  await db
    .delete(schema.refreshTokens)
    .where(eq(schema.refreshTokens.userId, user.id));
  console.log(`Cuenta de revisión lista: ${email}`);
} finally {
  await pool.end();
}
