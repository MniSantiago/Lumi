# Lumi API

NestJS 12 + Postgres (Drizzle) + Resend. Cuentas opcionales para guardar el progreso, recuperación de contraseña, borrado de cuenta y la lista de espera de la landing.

## Arrancar en local

```bash
cd backend
npm ci
cp .env.example .env          # y rellena lo que haga falta
npm run db:migrate            # crea las tablas (usa DATABASE_URL)
npm run start:dev             # http://localhost:3000, documentación en /docs
```

Sin `RESEND_API_KEY`, los correos no se envían: salen en el log, con el código de 6 cifras.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/auth/register` | Crea la cuenta, devuelve la sesión y envía el código para verificar el correo |
| POST | `/auth/login` | Entra con correo y contraseña |
| POST | `/auth/refresh` | Rota el token de refresco (si se reutiliza uno viejo, cierra todas las sesiones) |
| POST | `/auth/logout` | Revoca el token de refresco |
| POST | `/auth/verify-email` · `/auth/verify-email/resend` | Verifica el correo con el código |
| POST | `/auth/forgot-password` | Envía un código para cambiar la contraseña (responde igual exista o no el correo) |
| POST | `/auth/reset-password` | Cambia la contraseña con el código y cierra las sesiones |
| GET · PATCH | `/me` | Perfil (nombre y nombre de Lumi) |
| POST | `/me/password` | Cambia la contraseña conociendo la actual |
| POST | `/me/delete` | Borra la cuenta y todos sus datos (Apple lo exige, guía 5.1.1(v)) |
| POST | `/waitlist` | Lista de espera de la landing (`WAITLIST_ENDPOINT` en `landing/main.js`) |
| GET | `/health` | Comprueba el servidor y la base de datos |

## Seguridad

- Contraseñas con scrypt (N=2¹⁷, r=8, p=1). Mínimo 8 caracteres.
- Token de acceso JWT de 15 minutos. Token de refresco opaco de 30 días, guardado solo como hash y rotado en cada uso.
- Códigos de 6 cifras por correo: caducan en 15 minutos, solo sirven una vez y se bloquean tras 5 intentos.
- Límite por IP (120/min en general; 3-10/min en login, registro y códigos), Helmet y CORS solo para los orígenes configurados.
- El login y la recuperación no dicen si un correo existe.

## Tests

```bash
npm test          # unitarios
npm run test:e2e  # contra Postgres real: DATABASE_URL=postgres://lumi:lumi@localhost:5432/lumi_test
```

## Cambiar la API

1. Cambia el código (DTO con `@ApiProperty`).
2. Si cambia el esquema: `npm run db:generate` (crea la migración en `drizzle/`).
3. `npm run openapi` actualiza `openapi.json`.
4. En `app/`: `npm run api:generate` regenera el cliente con Orval.

## Desplegar

`Dockerfile` listo para cualquier plataforma con contenedores (Railway, Render, Fly.io…). Al arrancar aplica las migraciones pendientes. Variables: ver `.env.example`. En producción son obligatorias `DATABASE_URL`, `JWT_SECRET` (32+ caracteres) y `RESEND_API_KEY`, y `/docs` no se publica.
