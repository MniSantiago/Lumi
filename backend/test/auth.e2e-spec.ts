import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import request from 'supertest';

import { MailService } from '../src/mail/mail.service.js';
import type { MailContent } from '../src/mail/templates.js';

process.env.DATABASE_URL ??= 'postgres://lumi:lumi@localhost:5432/lumi_test';
process.env.NODE_ENV = 'test';

/** Guarda los correos en vez de enviarlos, para leer los códigos. */
class FakeMail {
  sent: { to: string; mail: MailContent }[] = [];
  async send(to: string, mail: MailContent) {
    this.sent.push({ to, mail });
  }
  lastCode(to: string) {
    const last = [...this.sent]
      .reverse()
      .find((m) => m.to === to && /\d{6}/.test(m.mail.subject));
    return last?.mail.subject.match(/\d{6}/)?.[0] ?? '';
  }
}

describe('Cuentas (e2e)', () => {
  let app: NestExpressApplication;
  let pool: pg.Pool;
  const mail = new FakeMail();
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: './drizzle' });
    await db.execute(
      sql`truncate users, refresh_tokens, email_codes, waitlist_entries cascade`,
    );

    const { AppModule } = await import('../src/app.module.js');
    const { configureApp } = await import('../src/setup.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService)
      .useValue(mail)
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await pool?.end();
  });

  const register = (email: string, password = 'contraseña-larga') =>
    http()
      .post('/auth/register')
      .send({ email, password, name: 'Santi', lumiName: 'Chispa' });

  it('registra, envía el código y verifica el correo', async () => {
    const res = await register(' Santi@Correo.com ').expect(200);
    expect(res.body.user).toMatchObject({
      email: 'santi@correo.com',
      name: 'Santi',
      lumiName: 'Chispa',
      emailVerified: false,
    });
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();

    const token = res.body.accessToken;
    await http()
      .post('/auth/verify-email')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: '000000' })
      .expect(400);
    const code = mail.lastCode('santi@correo.com');
    expect(code).toMatch(/^\d{6}$/);
    const verified = await http()
      .post('/auth/verify-email')
      .set('Authorization', `Bearer ${token}`)
      .send({ code })
      .expect(200);
    expect(verified.body.emailVerified).toBe(true);
  });

  it('no deja registrar el mismo correo dos veces', async () => {
    await register('doble@correo.com').expect(200);
    await register('DOBLE@correo.com').expect(409);
  });

  it('valida la entrada con mensajes en español', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ email: 'no-es-correo', password: 'corta' })
      .expect(400);
    expect(res.body.message).toEqual(
      expect.arrayContaining([
        'Ese correo no parece completo',
        'La contraseña necesita al menos 8 caracteres',
      ]),
    );
  });

  it('entra con la contraseña buena y rechaza la mala sin decir cuál falla', async () => {
    await register('login@correo.com').expect(200);
    await http()
      .post('/auth/login')
      .send({ email: 'login@correo.com', password: 'contraseña-larga' })
      .expect(200);
    const bad = await http()
      .post('/auth/login')
      .send({ email: 'login@correo.com', password: 'otra-cosa' })
      .expect(401);
    const missing = await http()
      .post('/auth/login')
      .send({ email: 'nadie@correo.com', password: 'otra-cosa' })
      .expect(401);
    expect(bad.body.message).toBe(missing.body.message);
  });

  it('rota el token de refresco y detecta la reutilización', async () => {
    const { body: first } = await register('refresh@correo.com').expect(200);
    const { body: second } = await http()
      .post('/auth/refresh')
      .send({ refreshToken: first.refreshToken })
      .expect(200);
    expect(second.refreshToken).not.toBe(first.refreshToken);
    // Reutilizar el viejo cierra todas las sesiones, también la nueva.
    await http()
      .post('/auth/refresh')
      .send({ refreshToken: first.refreshToken })
      .expect(401);
    await http()
      .post('/auth/refresh')
      .send({ refreshToken: second.refreshToken })
      .expect(401);
  });

  it('cierra sesión', async () => {
    const { body } = await register('logout@correo.com').expect(200);
    await http()
      .post('/auth/logout')
      .send({ refreshToken: body.refreshToken })
      .expect(204);
    await http()
      .post('/auth/refresh')
      .send({ refreshToken: body.refreshToken })
      .expect(401);
  });

  it('recupera la contraseña con un código', async () => {
    const { body } = await register('olvido@correo.com').expect(200);
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'olvido@correo.com' })
      .expect(204);
    // Un correo que no existe responde igual.
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'fantasma@correo.com' })
      .expect(204);
    const code = mail.lastCode('olvido@correo.com');

    await http()
      .post('/auth/reset-password')
      .send({ email: 'olvido@correo.com', code, password: 'nueva-contraseña' })
      .expect(204);
    // El código no sirve dos veces y las sesiones anteriores se cierran.
    await http()
      .post('/auth/reset-password')
      .send({ email: 'olvido@correo.com', code, password: 'otra-mas-nueva' })
      .expect(400);
    await http()
      .post('/auth/refresh')
      .send({ refreshToken: body.refreshToken })
      .expect(401);
    await http()
      .post('/auth/login')
      .send({ email: 'olvido@correo.com', password: 'nueva-contraseña' })
      .expect(200);
    expect(
      mail.sent.some(
        (m) =>
          m.to === 'olvido@correo.com' &&
          m.mail.subject.includes('ha cambiado'),
      ),
    ).toBe(true);
  });

  it('bloquea el código tras 5 intentos fallidos', async () => {
    await register('intentos@correo.com').expect(200);
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'intentos@correo.com' })
      .expect(204);
    const code = mail.lastCode('intentos@correo.com');
    const wrong = code === '111111' ? '222222' : '111111';
    for (let i = 0; i < 5; i++) {
      await http()
        .post('/auth/reset-password')
        .send({
          email: 'intentos@correo.com',
          code: wrong,
          password: 'nueva-contraseña',
        })
        .expect(400);
    }
    await http()
      .post('/auth/reset-password')
      .send({
        email: 'intentos@correo.com',
        code,
        password: 'nueva-contraseña',
      })
      .expect(400);
  });

  it('lee y actualiza el perfil, y cambia la contraseña', async () => {
    const { body } = await register('perfil@correo.com').expect(200);
    const auth = { Authorization: `Bearer ${body.accessToken}` };
    await http().get('/me').expect(401);
    const me = await http().get('/me').set(auth).expect(200);
    expect(me.body.email).toBe('perfil@correo.com');

    const updated = await http()
      .patch('/me')
      .set(auth)
      .send({ name: 'Santiago', lumiName: '' })
      .expect(200);
    expect(updated.body).toMatchObject({ name: 'Santiago', lumiName: 'Lumi' });

    await http()
      .post('/me/password')
      .set(auth)
      .send({ currentPassword: 'mal', newPassword: 'nueva-contraseña' })
      .expect(400);
    const changed = await http()
      .post('/me/password')
      .set(auth)
      .send({
        currentPassword: 'contraseña-larga',
        newPassword: 'nueva-contraseña',
      })
      .expect(200);
    expect(changed.body.refreshToken).toBeTruthy();
    await http()
      .post('/auth/refresh')
      .send({ refreshToken: body.refreshToken })
      .expect(401);
  });

  it('elimina la cuenta con su contraseña', async () => {
    const { body } = await register('borrar@correo.com').expect(200);
    const auth = { Authorization: `Bearer ${body.accessToken}` };
    await http()
      .post('/me/delete')
      .set(auth)
      .send({ password: 'mal' })
      .expect(400);
    await http()
      .post('/me/delete')
      .set(auth)
      .send({ password: 'contraseña-larga' })
      .expect(204);
    await http().get('/me').set(auth).expect(401);
    await http()
      .post('/auth/login')
      .send({ email: 'borrar@correo.com', password: 'contraseña-larga' })
      .expect(401);
    // Se puede volver a registrar con el mismo correo.
    await register('borrar@correo.com').expect(200);
  });

  it('apunta a la lista de espera sin duplicar', async () => {
    const entry = {
      email: 'Espera@Correo.com',
      app: 'tiktok',
      utm_source: 'tiktok',
      utm_campaign: 'escudo',
    };
    await http().post('/waitlist').send(entry).expect(204);
    await http().post('/waitlist').send(entry).expect(204);
    const { rows } = await pool.query(
      'select email, utm_campaign from waitlist_entries',
    );
    expect(rows).toEqual([
      { email: 'espera@correo.com', utm_campaign: 'escudo' },
    ]);
  });

  it('guarda y devuelve el progreso de la cuenta', async () => {
    const { body } = await register('progreso@correo.com').expect(200);
    const auth = { Authorization: `Bearer ${body.accessToken}` };
    await http().get('/me/progress').expect(401);
    const empty = await http().get('/me/progress').set(auth).expect(200);
    expect(empty.body).toEqual({ data: null, updatedAt: null });

    const data = {
      schema: 1,
      game: { sparks: 12, days: { '2026-09-28': { lit: 3 } } },
    };
    const saved = await http()
      .put('/me/progress')
      .set(auth)
      .send({ data })
      .expect(200);
    expect(saved.body.data).toEqual(data);
    expect(saved.body.updatedAt).toBeTruthy();

    const next = { ...data, game: { ...data.game, sparks: 20 } };
    await http().put('/me/progress').set(auth).send({ data: next }).expect(200);
    const read = await http().get('/me/progress').set(auth).expect(200);
    expect(read.body.data.game.sparks).toBe(20);

    await http().put('/me/progress').set(auth).send({ data: 'no' }).expect(400);
    // Cabe más de 100 kB (límite por defecto de Express).
    const big = { schema: 1, blob: 'x'.repeat(200 * 1024) };
    await http().put('/me/progress').set(auth).send({ data: big }).expect(200);
    const huge = { schema: 1, blob: 'x'.repeat(600 * 1024) };
    await http().put('/me/progress').set(auth).send({ data: huge }).expect(413);
  });

  it('responde al health check', async () => {
    await http().get('/health').expect(200, { status: 'ok' });
  });
});
