# Lumi: checklist para la App Store

Lo que Apple pide para publicar Lumi y en qué estado está. ✅ hecho · 🟡 en parte · ⬜ pendiente · 🔒 depende de Apple.

---

## 1. Bloqueantes

| | Qué | Estado | Notas |
|---|---|---|---|
| 🔒 | **Entitlement de Family Controls (Distribution)** | ⬜ | Sin él no se puede publicar el bloqueo real. Se pide en developer.apple.com con la cuenta de pago (99 $/año). Tarda semanas: pedirlo ya. |
| ⬜ | **Módulo nativo de Screen Time** | 🟡 | Integrado con `react-native-device-activity` (`app/src/screen-time/native.ts`), **sin compilar todavía**. Se activa con `LUMI_SCREEN_TIME=1` y `APPLE_TEAM_ID` al compilar (`app/app.config.ts`). Apple tiene que aprobar Family Controls para 4 bundle IDs: `com.gonzalez.lumi`, `com.gonzalez.lumi.ActivityMonitorExtension`, `com.gonzalez.lumi.ShieldAction` y `com.gonzalez.lumi.ShieldConfiguration` (comprobados con `expo prebuild`), más el App Group `group.com.gonzalez.lumi`. Con Screen Time, la app pide iOS 18 como mínimo (igual que sus extensiones). |
| ⬜ | **Compras reales (StoreKit)** | 🟡 | Código listo con RevenueCat (`app/src/purchases/revenuecat.ts`). Falta: crear los productos en App Store Connect, configurar RevenueCat (entitlement `plus`, paquetes `$rc_annual` y `$rc_monthly`), poner `EXPO_PUBLIC_REVENUECAT_IOS_KEY` en EAS y probar con un development build en sandbox. |
| ⬜ | **Backend desplegado con HTTPS** | 🟡 | Código listo (`backend/`, `Dockerfile`). Falta desplegarlo (Railway, Render o Fly.io) y poner `EXPO_PUBLIC_API_URL` en EAS (ver §6). |
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
| Cuenta de prueba para la revisión | ⬜ | Crear `review@<dominio>` en producción y ponerla en las notas de revisión |

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
