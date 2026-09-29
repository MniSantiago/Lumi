# Lumi: checklist para la App Store

Lo que Apple pide para publicar Lumi y en qué estado está. ✅ hecho · 🟡 en parte · ⬜ pendiente · 🔒 depende de Apple.

---

## 1. Bloqueantes

| | Qué | Estado | Notas |
|---|---|---|---|
| 🔒 | **Entitlement de Family Controls (Distribution)** | ⬜ | Sin él no se puede publicar el bloqueo real. Se pide en developer.apple.com con la cuenta de pago (99 $/año). Tarda semanas: pedirlo ya. |
| ⬜ | **Módulo nativo de Screen Time** | ⬜ | FamilyControls + DeviceActivityMonitor (25/50/75/100 %) + ShieldConfiguration. Hoy es un mock (`app/src/screen-time`). |
| ⬜ | **Compras reales (StoreKit)** | 🟡 | Código listo con RevenueCat (`app/src/purchases/revenuecat.ts`). Falta: crear los productos en App Store Connect, configurar RevenueCat (entitlement `plus`, paquetes `$rc_annual` y `$rc_monthly`), poner `EXPO_PUBLIC_REVENUECAT_IOS_KEY` en EAS y probar con un development build en sandbox. Sin la clave, una build de la tienda enseña «Lumi Plus no está disponible ahora mismo» (nunca las compras de prueba). |
| ⬜ | **Backend desplegado con HTTPS** | 🟡 | Código listo (`backend/`, `Dockerfile`). Falta desplegarlo (Railway, Render o Fly.io) y poner `EXPO_PUBLIC_API_URL` en EAS (ver §6). Sin esa variable, la build de producción oculta la cuenta (la app funciona igual), así que no se puede olvidar sin que se note: comprobar que Ajustes › Cuenta aparece antes de enviar. |
| ⬜ | **Dominio y correo** | ⬜ | Verificar el dominio en Resend (SPF y DKIM), poner `MAIL_FROM` y rellenar `contactEmail` en `app/src/legal/content.json` (sale en Ayuda). |

## 2. Cuenta de usuario (guía 5.1.1)

| Qué | Estado | Dónde |
|---|---|---|
| La cuenta es opcional (no se exige para lo que no la necesita) | ✅ | Ajustes › Cuenta |
| **Eliminar la cuenta desde la app** (5.1.1(v)) | ✅ | Ajustes › Cuenta › Eliminar la cuenta (`POST /me/delete`) |
| Recuperar la contraseña | ✅ | «¿Se te olvidó la contraseña?», con código por correo |
| Verificar el correo | ✅ | Código de 6 cifras |
| Cambiar la contraseña y cerrar sesión | ✅ | Ajustes › Cuenta |
| Iniciar sesión con Apple | No hace falta | Solo es obligatorio si se ofrece otro login social (Google, etc.). Con correo y contraseña, no. |
| Cuenta de prueba para la revisión | 🟡 | Script listo: `REVIEW_EMAIL=… REVIEW_PASSWORD=… node dist/db/review-account.js` en el servidor (ver `backend/README.md`). Falta ejecutarlo en producción y ponerla en las notas de revisión |

## 3. Privacidad

| Qué | Estado | Notas |
|---|---|---|
| Política de privacidad en la app | ✅ | Ajustes y paywall › Privacidad |
| **URL de la política** (obligatoria en App Store Connect) | 🟡 | `landing/privacidad.html`. Falta publicar la landing en un dominio. |
| Privacy manifest (`PrivacyInfo.xcprivacy`) | ✅ | `ios.privacyManifests` en `app/app.json`: sin tracking, datos recogidos y APIs con motivo |
| Etiquetas de privacidad en App Store Connect | ⬜ | Ver abajo |
| Permiso de notificaciones en contexto, con explicación si se deniega | ✅ | Al activar la postal nocturna |
| Sin App Tracking Transparency | ✅ | No hay tracking ni SDK de anuncios |

**Etiquetas de privacidad («Datos vinculados a ti»), para rellenar en App Store Connect:**

| Tipo | Dato | Uso | ¿Tracking? |
|---|---|---|---|
| Información de contacto | Correo electrónico | Funcionalidad de la app | No |
| Información de contacto | Nombre (opcional) | Funcionalidad de la app | No |
| Identificadores | ID de usuario | Funcionalidad de la app | No |
| Compras | Historial de compras (cuando llegue RevenueCat) | Funcionalidad de la app | No |

El uso de pantalla **no se recoge**: se queda en el iPhone (Screen Time por umbrales) y no sale del dispositivo.

## 4. Suscripción (guía 3.1.2)

| Qué | Estado | Notas |
|---|---|---|
| Precio, periodo y prueba gratis, claros antes de pagar | ✅ | Paywall: «Luego 49,99 $ al año», línea temporal de la prueba |
| Enlaces a Términos y Privacidad en el paywall | ✅ | |
| Restaurar compras | 🟡 | Conectado a RevenueCat; falta probarlo en sandbox |
| Recordatorio antes de que acabe la prueba | ✅ | Notificación local 2 días antes |
| Lo gratis sigue funcionando sin pagar | ✅ | Escudo, límite, expediciones, postales, widget y modo noche |
| Grupo de suscripción en App Store Connect | ⬜ | Anual (49,99 $, 7 días gratis) y mensual. IDs: `$rc_annual`, `$rc_monthly` en RevenueCat |
| **Lo que se anuncia de Plus existe** (guías 2.3.1 y 3.1.2) | ✅ | Plus anuncia solo zonas exclusivas, escudo estricto y «Tus números», que ya están en la app. Especies y colores de luz, varios horarios y decoración de la madriguera quedan para más adelante: no se anuncian hasta que existan. Si el widget (#22) no sale en la primera versión, quitarlo también de «Gratis para siempre», de la ficha y de la landing. |
| EULA | 🟡 | Términos propios en la app. En App Store Connect se puede usar el EULA estándar de Apple o enlazar `landing/terminos.html`. |

## 5. Ficha de la App Store

| Qué | Estado | Notas |
|---|---|---|
| Nombre, subtítulo, palabras clave, descripción | 🟡 | Borrador en `FICHA_APP_STORE.md` (límites comprobados con `tools/check_ficha.py`) |
| **URL de soporte** (obligatoria) | 🟡 | `landing/ayuda.html` (preguntas frecuentes), falta publicarla |
| URL de marketing | 🟡 | La landing |
| Capturas de 6,9" (1320 × 2868) | ⬜ | Desde el simulador del iPhone 17 Pro Max (ver `landing/videos.md` para ocultar la hora) |
| Icono de 1024 × 1024 sin transparencia | ✅ | `app/assets/images/icon.png` |
| Clasificación por edad | ⬜ | Cuestionario: sin contenido sensible, debería salir 4+ |
| Categoría | ⬜ | Estilo de vida (o Salud y forma física) |
| Cumplimiento de exportación | ✅ | `ITSAppUsesNonExemptEncryption: false` (solo HTTPS) |
| Solo iPhone | ✅ | `supportsTablet: false` |

### Idiomas

La app y la web hablan el idioma del dispositivo: **español, inglés, chino (simplificado), hindi y francés**. Si el dispositivo usa otro idioma, salen en inglés.

| Qué | Estado | Notas |
|---|---|---|
| Base (`app/src/i18n`): detección del idioma y `tr()` tipado | ✅ | Si falta una traducción, TypeScript no compila |
| Contenido del juego (20 lugares, 60 historias, 36 objetos, 12 amigos) | ✅ | `app/src/game/content/<idioma>.ts` |
| Textos de Lumi, avisos, escudo, paywall, fechas | ✅ | |
| Todas las pantallas | ✅ | Menos el panel de desarrollo, que solo se ve en `__DEV__` |
| `CFBundleLocalizations` (para que iOS muestre los idiomas en la ficha) | ✅ | `app.json`. La app no pide permisos con texto propio (avisos y Tiempo de uso usan los de iOS) |
| Legales, ayuda y landing | ✅ | `app/src/legal/i18n/<idioma>.json` (app y web) y `landing/texts.js`. La web sigue `navigator.language` (o `?lang=xx`) |
| Correos y errores del backend | ✅ | Según `Accept-Language` (la app lo manda); sin cabecera, español |
| Ficha de la App Store en los 5 idiomas | ✅ | `FICHA_APP_STORE.md` (es) y `ficha/<idioma>.md`; límites comprobados con `tools/check_ficha.py` |
| Revisión de las traducciones por hablantes nativos | ⬜ | Sobre todo hindi y chino |

**Notas para la revisión:** versión completa en `FICHA_APP_STORE.md`.

**Resumen:**

> Lumi es una mascota que ayuda a usar menos las apps que elige el usuario. Usa Family Controls solo para el propio usuario (no control parental): el usuario elige sus apps con FamilyActivityPicker, DeviceActivityMonitor avisa al 25/50/75/100 % de su límite y ShieldConfiguration muestra a Lumi al abrir una app pasado el límite. Ningún dato de uso sale del dispositivo. La cuenta es opcional (Ajustes › Cuenta) y se puede eliminar desde la app. Cuenta de prueba: review@… / …

## 6. Configuración de producción

**Backend y landing en Render:** `render.yaml` (New › Blueprint). Rellena `RESEND_API_KEY`, `MAIL_FROM` y `CORS_ORIGINS` en `lumi-api`. Con la URL de la API, pon `WAITLIST_ENDPOINT` en `landing/main.js` y `EXPO_PUBLIC_API_URL` en EAS.

```bash
# Variables de la app en EAS (entorno production)
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_API_URL --value https://api.<dominio> --visibility plaintext
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_… --visibility plaintext

# Build y envío
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

Backend (variables en la plataforma): `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (32+ caracteres), `RESEND_API_KEY`, `MAIL_FROM`, `CORS_ORIGINS` (el dominio de la landing). Al arrancar aplica las migraciones. Activa las copias de seguridad de Postgres en la plataforma.

Landing: pon la URL del backend en `WAITLIST_ENDPOINT` (`landing/main.js`) como `https://api.<dominio>/waitlist`.

## 7. Comprobación final antes de enviar

Con la build de producción (TestFlight) en un iPhone real:

1. **Idioma:** con el iPhone en inglés (o en Ajustes de iOS › Lumi › Idioma), la app, los avisos y los correos salen en inglés. Repetir con otro idioma.
2. **Cuenta:** Ajustes › Cuenta aparece (si no, falta `EXPO_PUBLIC_API_URL`). Crear una cuenta, recibir el código, entrar desde otro iPhone y borrarla.
3. **Cuenta de prueba:** `review@<dominio>` entra con la contraseña de las notas de revisión (`npm run review:account` la crea).
4. **Plus:** el paywall enseña los precios de la App Store (si dice «no está disponible», falta `EXPO_PUBLIC_REVENUECAT_IOS_KEY`). Comprar en sandbox, restaurar y encender el escudo estricto.
5. **Escudo y avisos:** elegir apps con el selector de Apple, llegar al límite y ver a Lumi en el escudo; la postal nocturna y el aviso del domingo llegan.
6. **Legales:** Privacidad, Términos y Ayuda se abren en la app y en la web, en el idioma del dispositivo, con el correo de contacto relleno.
7. **Ficha:** `python3 tools/check_ficha.py` en verde, capturas de 6,9" y las URLs con el dominio real (también las `hreflang` de la landing, en absoluto).
8. **Lista de espera:** apuntarse en la landing, recibir el correo de bienvenida en el idioma de la web y darse de baja con su enlace.
