/**
 * Exporta la lista de espera a CSV (salida estándar), para el aviso de
 * lanzamiento: correo, idioma (el de la web al apuntarse), app que más le roba
 * tiempo, origen y fecha. Las filas de quien se dio de baja ya no están.
 *
 * Uso: node dist/db/export-waitlist.js > lista.csv   (en local: npm run waitlist:export)
 */
import { asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import { langFrom } from '../i18n.js';
import * as schema from './schema.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta la variable de entorno DATABASE_URL');

/** Comillas solo si hace falta; también neutraliza fórmulas al abrirlo en una hoja de cálculo. */
function csvCell(value: string | null | undefined): string {
  let v = value ?? '';
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  const db = drizzle(pool, { schema });
  const rows = await db
    .select()
    .from(schema.waitlistEntries)
    .orderBy(asc(schema.waitlistEntries.createdAt));
  const header = [
    'email',
    'lang',
    'app',
    'utm_source',
    'utm_campaign',
    'ref',
    'created_at',
  ];
  const lines = rows.map((r) =>
    [
      r.email,
      // El idioma normalizado a los de Lampi (es, en, zh, hi, fr); sin dato, español.
      langFrom(r.lang ?? undefined),
      r.app,
      r.utmSource,
      r.utmCampaign,
      r.ref,
      r.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(','),
  );
  process.stdout.write([header.join(','), ...lines].join('\n') + '\n');
  console.error(`${rows.length} entradas`);
} finally {
  await pool.end();
}
