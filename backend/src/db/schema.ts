import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Siempre en minúsculas y sin espacios (ver `normalizeEmail`). */
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull().default(''),
    lumiName: text('lumi_name').notNull().default('Lumi'),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [uniqueIndex('users_email_key').on(t.email)],
);

/** Tokens de refresco opacos. Solo se guarda su hash; se rotan en cada uso. */
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex('refresh_tokens_hash_key').on(t.tokenHash),
    index('refresh_tokens_user_idx').on(t.userId),
  ],
);

export const emailCodePurpose = pgEnum('email_code_purpose', [
  'verify_email',
  'reset_password',
]);

/** Códigos de 6 cifras enviados por correo (verificar el correo y cambiar la contraseña). */
export const emailCodes = pgTable(
  'email_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    purpose: emailCodePurpose('purpose').notNull(),
    codeHash: text('code_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index('email_codes_user_purpose_idx')
      .on(t.userId, t.purpose)
      .where(sql`${t.consumedAt} is null`),
  ],
);

/** Lista de espera de la landing. */
export const waitlistEntries = pgTable(
  'waitlist_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    app: text('app'),
    form: text('form'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    ref: text('ref'),
    referrer: text('referrer'),
    lang: text('lang'),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('waitlist_entries_email_key').on(t.email)],
);

/** Copia del progreso de la app (juego y ajustes), para no perderlo al cambiar de iPhone. */
export const progress = pgTable('progress', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type EmailCodePurpose = (typeof emailCodePurpose.enumValues)[number];
