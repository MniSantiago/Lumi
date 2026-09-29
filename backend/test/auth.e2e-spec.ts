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
  /** El código de recuperación se envía sin esperar: hay que darle un momento. */
  async waitForCode(to: string, after = 0) {
    for (let i = 0; i < 50; i++) {
      const found = this.sent
        .slice(after)
        .some((m) => m.to === to && /\d{6}/.test(m.mail.subject));
      if (found) return this.lastCode(to);
      await new Promise((r) => setTimeout(r, 20));
    }
    return '';
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

  it('pausa una cuenta tras 10 logins fallidos, aunque cambie la IP', async () => {
    await register('bloqueo@correo.com').expect(200);
    for (let i = 0; i < 10; i++) {
      await http()
        .post('/auth/login')
        .send({ email: 'bloqueo@correo.com', password: 'mal-mal-mal' })
        .expect(401);
    }
    const res = await http()
      .post('/auth/login')
      .send({ email: 'Bloqueo@correo.com', password: 'contraseña-larga' })
      .expect(429);
    expect(res.body.message).toMatch(/Demasiados intentos/);
    // Recuperar la contraseña la desbloquea.
    const before = mail.sent.length;
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'bloqueo@correo.com' })
      .expect(204);
    const code = await mail.waitForCode('bloqueo@correo.com', before);
    await http()
      .post('/auth/reset-password')
      .send({ email: 'bloqueo@correo.com', code, password: 'otra-contraseña' })
      .expect(204);
    await http()
      .post('/auth/login')
      .send({ email: 'bloqueo@correo.com', password: 'otra-contraseña' })
      .expect(200);
  }, 20_000);

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
    const before = mail.sent.length;
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'olvido@correo.com' })
      .expect(204);
    // Un correo que no existe responde igual.
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'fantasma@correo.com' })
      .expect(204);
    const code = await mail.waitForCode('olvido@correo.com', before);

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
    const before = mail.sent.length;
    await http()
      .post('/auth/forgot-password')
      .send({ email: 'intentos@correo.com' })
      .expect(204);
    const code = await mail.waitForCode('intentos@correo.com', before);
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

  it('se da de baja de la lista de espera con el enlace del correo', async () => {
    await http()
      .post('/waitlist')
      .set('Accept-Language', 'fr')
      .send({ email: 'baja@correo.com' })
      .expect(204);
    const welcome = mail.sent
      .filter((m) => m.to === 'baja@correo.com')
      .at(-1)!.mail;
    expect(welcome.subject).toBe('Tu es sur la liste de Lumi ! ✨');
    const link = welcome.text.match(/https?:\/\/\S+/)![0];
    expect(welcome.headers?.['List-Unsubscribe']).toBe(`<${link}>`);
    const url = new URL(link);
    const path = `${url.pathname}${url.search}`;

    // Abrir el enlace solo pide confirmación: no borra nada.
    const page = await http()
      .get(path)
      .set('Accept-Language', 'fr')
      .expect(200);
    expect(page.headers['content-type']).toContain('text/html');
    expect(page.text).toContain('On te retire de la liste ?');
    const count = async () =>
      (
        await pool.query(
          "select count(*)::int as n from waitlist_entries where email = 'baja@correo.com'",
        )
      ).rows[0].n;
    expect(await count()).toBe(1);

    // Con un token cambiado, nada.
    await http()
      .post(path.replace(/token=[^&]+/, 'token=falso'))
      .expect(200);
    expect(await count()).toBe(1);

    // El botón del formulario (o el clic único del cliente de correo) la borra.
    const done = await http()
      .post('/waitlist/unsubscribe')
      .type('form')
      .send({
        email: url.searchParams.get('email'),
        token: url.searchParams.get('token'),
      })
      .expect(200);
    expect(done.text).toContain('Ya no estás en la lista');
    expect(await count()).toBe(0);
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

    const exported = await http().get('/me/export').set(auth).expect(200);
    expect(exported.body.user.email).toBe('progreso@correo.com');
    expect(exported.body.progress.game.sparks).toBe(20);
    expect(exported.body.user).not.toHaveProperty('passwordHash');

    await http().put('/me/progress').set(auth).send({ data: 'no' }).expect(400);
    // Cabe más de 100 kB (límite por defecto de Express).
    const big = { schema: 1, blob: 'x'.repeat(200 * 1024) };
    await http().put('/me/progress').set(auth).send({ data: big }).expect(200);
    const huge = { schema: 1, blob: 'x'.repeat(600 * 1024) };
    await http().put('/me/progress').set(auth).send({ data: huge }).expect(413);
  });

  it('limpia tokens caducados y códigos viejos', async () => {
    const { CleanupService } = await import('../src/db/cleanup.service.js');
    await register('limpieza@correo.com').expect(200);
    const future = new Date(Date.now() + 40 * 24 * 60 * 60 * 1000);
    const result = await app.get(CleanupService).run(future);
    expect(result.tokens).toBeGreaterThan(0);
    expect(result.codes).toBeGreaterThan(0);
    const { rows } = await pool.query(
      'select count(*)::int as n from refresh_tokens where expires_at < $1',
      [future],
    );
    expect(rows[0].n).toBe(0);
  });

  it('devuelve un X-Request-Id (el que llega, si es válido)', async () => {
    const own = await http()
      .get('/me')
      .set('X-Request-Id', 'soporte-12345678')
      .expect(401);
    expect(own.headers['x-request-id']).toBe('soporte-12345678');
    const generated = await http()
      .get('/me')
      .set('X-Request-Id', 'no válido!')
      .expect(401);
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('responde en el idioma de la app (Accept-Language)', async () => {
    await register('idiomas@correo.com').expect(200);
    const wrong = await http()
      .post('/auth/login')
      .set('Accept-Language', 'fr-FR,fr;q=0.9')
      .send({ email: 'idiomas@correo.com', password: 'no-es-esta' })
      .expect(401);
    expect(wrong.body.message).toBe('E-mail ou mot de passe incorrect');
    expect(wrong.headers['content-language']).toBe('fr');

    const invalid = await http()
      .post('/auth/register')
      .set('Accept-Language', 'zh')
      .send({ email: 'no-es-un-correo', password: 'corta' })
      .expect(400);
    expect(invalid.body.message).toContain('这个邮箱地址好像不完整');

    const english = await http()
      .post('/auth/register')
      .set('Accept-Language', 'en')
      .send({ email: 'english@correo.com', password: 'contraseña-larga' })
      .expect(200);
    expect(english.body.user.email).toBe('english@correo.com');
    expect(mail.sent.at(-1)?.mail.subject).toMatch(/^\d{6} is your Lumi code$/);

    // El correo de recuperación se envía después de responder: el idioma tiene que llegar igual.
    const before = mail.sent.length;
    await http()
      .post('/auth/forgot-password')
      .set('Accept-Language', 'hi-IN')
      .send({ email: 'idiomas@correo.com' })
      .expect(204);
    await mail.waitForCode('idiomas@correo.com', before);
    const reset = mail.sent
      .slice(before)
      .find((m) => m.to === 'idiomas@correo.com');
    expect(reset?.mail.subject).toContain('पासवर्ड बदलने का तुम्हारा कोड है');
    expect(reset?.mail.html).toContain('<html lang="hi">');

    // Un idioma que no hablamos cae en inglés; sin cabecera, español.
    const german = await http()
      .post('/auth/login')
      .set('Accept-Language', 'de-DE')
      .send({ email: 'idiomas@correo.com', password: 'no-es-esta' })
      .expect(401);
    expect(german.body.message).toBe('Wrong email or password');
  });

  it('responde al health check', async () => {
    await http().get('/health').expect(200, { status: 'ok' });
  });
});
