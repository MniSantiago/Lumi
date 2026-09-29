# Lumi: registro del proceso

Última sesión: lunes 28 de septiembre de 2026 (noche): bloques de UX y preparación para producción.
Para retomar: abre un chat en el proyecto "Cozy experience" (o pega este archivo y `BRIEF.md`) y di en qué paso vamos.

---

## 1. Estado actual

| Pieza | Estado | Dónde está |
|---|---|---|
| Brief del proyecto | Hecho | `BRIEF.md` |
| Mockup HTML con marco de iPhone | Hecho (v2, con las ilustraciones de Higgsfield) | `lumi-mockup.html` y el artifact en claude.ai: https://claude.ai/artifact/U7vrjvNhSVL9wLAQnRwmuB |
| Lumi elegida | Variante B (`fa783b9e…`), recortada | Original en `assets/fa783b9e-….png`; recorte en `assets/web/lumi-recorte.png` |
| Fondo del hogar | Hecho e integrado | Original en `assets/Vertical-mobile-app-home-background-coz.png` |
| Lumi en 4 estados con expresiones propias | Hecho (ilustraciones), en la app, la landing y el mockup HTML | Originales en `assets/Radiante.png`, `Cansada.png`, `Apagadita.png`; recortes en `app/assets/lumi/` y `landing/img/` |
| App Expo (SDK 57) con las 5 pestañas | Hecho (v1, datos de ejemplo y uso simulado) | `app/` |
| Onboarding, postal nocturna, escudo, paywall y resumen semanal | Hecho en la app (datos de ejemplo y uso simulado) | `app/src/app/` |
| Motor del ciclo diario (expediciones, postales, recompensas) | Hecho | `app/src/game/` |
| Landing con lista de espera y plan de vídeos | Hecha; falta dominio y conectar `WAITLIST_ENDPOINT` al backend | `landing/` |
| Privacidad, Términos y Ayuda (en la app y en la landing) | Borrador en 5 idiomas; falta revisarlo y poner correo de contacto | `app/src/legal/i18n/` |
| Idiomas: español, inglés, chino, hindi y francés (app, backend, landing y ficha) | Hecho; falta revisión nativa de hindi y chino | `app/src/i18n/`, `backend/src/i18n.ts`, `landing/texts.js`, `ficha/` |
| Backend (NestJS, Postgres, Resend): cuentas, recuperación de contraseña, borrado de cuenta y lista de espera | Hecho, sin desplegar | `backend/` |
| Cuenta opcional en la app (cliente Orval) | Hecha | `app/src/account/`, `app/src/api/` |
| Checklist de la App Store | Hecho | `APP_STORE.md` |
| Entitlement de Family Controls | **Pendiente** (paso 4) | |
| Compras reales (RevenueCat) | **Pendiente** | `app/src/purchases/` es un mock |
| Validación (vídeos de TikTok) | **Pendiente** (paso 5) | `landing/videos.md` |
| Repositorio Git | En GitHub: `origin` = github.com/MniSantiago/Lumi | Raíz de esta carpeta |

---

## 2. Cómo está montado el repositorio

```
Lumi/
├── BRIEF.md                         Brief del proyecto
├── PROCESO.md                       Este documento
├── README.md
├── lumi-mockup.html                 Mockup final (generado, ábrelo en el navegador)
├── src/lumi-mockup.template.html    Fuente del mockup; se edita esta
├── tools/build.py                   Incrusta las imágenes y genera lumi-mockup.html
└── assets/
    ├── *.png                        Originales de Higgsfield (2 Lumis y el fondo)
    └── web/
        ├── lumi.webp                Lumi recortada y optimizada (520 px)
        ├── lumi-recorte.png         Lumi recortada a resolución completa
        └── fondo-hogar.webp         Fondo optimizado (820 px)
```

**Flujo para cambiar el mockup:** edita `src/lumi-mockup.template.html`, cambia o añade imágenes en `assets/web/` y ejecuta `python3 tools/build.py`. Las imágenes van incrustadas como data URI porque el artifact de claude.ai no carga imágenes externas.

**Si añades imágenes nuevas** (por ejemplo, los 4 estados): añade un marcador en la plantilla (`{{LUMI_CANSADA}}`) y su ruta en el diccionario `ASSETS` de `tools/build.py`.

---

## 3. Historial

### Sesión 1 (28 sep, 20:45-21:10)

- **Higgsfield:** plan gratuito con 10 créditos. `gpt_image_2_5` requiere plan Basic, así que se usó **Nano Banana Pro** (`nano_banana_pro`, 2K). Se generaron dos variantes de Lumi y el fondo.
- **Mockup v1:** Lumi dibujada en SVG, porque el espacio de trabajo en la nube no puede descargar del CDN de Higgsfield.
- **Revisión de diseño aplicada:** contraste AA del texto terciario, quitada una leyenda del medidor que contradecía los tramos, nombre "Expediciones" unificado.
- **Repositorio Git** creado en esta carpeta.

### Sesión 1, segunda parte (21:13)

- Santiago descargó los PNG en `assets/`.
- **Variante elegida: B (`fa783b9e`)**, porque las antenas brillan más y refuerzan la metáfora de la luz.
- **Recorte:** el fondo blanco se quitó con máscara del cuerpo más "color a alfa" para el halo. El borde cálido se conserva como parte del brillo, y se tapó la marca de agua de Higgsfield (esquina inferior derecha).
- **Hogar rediseñado** sobre la ilustración:
  - Lumi de pie en el claro del prado, con el mensaje encima.
  - El medidor "Luz de hoy" arriba y la expedición abajo, sin scroll.
  - Luciérnagas animadas en canvas por encima de la ilustración.
  - El mundo se oscurece un poco al bajar de estado ("tu atención es luz").
- **Estados provisionales:** brillo, saturación y halo cambian con filtros CSS, y en Apagadita aparecen las "z". Las expresiones (bostezo, ojos cerrados) llegan en el paso 2.

### Sesión 2 (28 sep, noche): app Expo

- **Proyecto Expo** en `app/`: SDK 57, Expo Router con pestañas nativas (Hogar, Expediciones, Colección, Progreso y Ajustes), TypeScript, Fraunces + Figtree.
- **Hogar** como en el mockup: fondo ilustrado, luciérnagas animadas, Lumi flotando y respirando con halo, medidor "Luz de hoy", bocadillo, estado y expedición. El mundo se oscurece al bajar de estado.
- **Estados** derivados del último umbral de uso (0/25/50/75 %), no de minutos, igual que funcionará con `DeviceActivityMonitor`. La fuente de uso es una interfaz (`app/src/screen-time`) con un mock; en desarrollo, el hogar tiene "Simular uso".
- **Recorte de los estados** (`tools/cutout_states.py`): cuerpo y núcleo de los orbes opacos (con cierre morfológico y relleno de huecos), blancos encerrados como luz y halo con "color a alfa" conservando el tono a brillo máximo.
- Ajustes guardados en el dispositivo (AsyncStorage). Todo lo demás son datos de ejemplo (`app/src/lumi/data.ts`).

### Sesión 3 (28-29 sep, noche): UX y producción

Trabajo en bloques, cada uno con su PR (ver «PRs de la sesión 3» abajo para el orden de merge):

- **UX de la app:** ajustes editables (nombres, apps, horario), tocar a Lumi y medidor con el límite real, postales por descubrir en la Colección, recuperar a Lumi desde el onboarding en un iPhone nuevo, permiso de avisos en contexto, pantalla de error amable, valoraciones en un buen momento y «Gestionar suscripción».
- **Legal y privacidad:** Privacidad, Términos y Ayuda desde un solo `content.json` (app y landing), «Descargar mis datos» y privacy manifest.
- **Backend NestJS** (`backend/`): cuentas opcionales, verificación y recuperación con códigos por correo (Resend), refresh con rotación, borrado de cuenta, copia del progreso, exportación, lista de espera con bienvenida, limpieza diaria y endurecimiento de seguridad. Tests e2e contra Postgres.
- **App ↔ backend:** cliente con Orval (`npm run api:generate`), sesión en el llavero, sincronización del progreso entre iPhones.
- **Idiomas:** la app, los correos y errores del backend, la landing, los legales y la ficha de la App Store siguen el idioma del dispositivo: español, inglés, chino simplificado, hindi y francés (si no, inglés). `tr()` tipado desde el español: si falta una traducción, no compila.
- **Producción:** RevenueCat (código listo), Screen Time nativo con `react-native-device-activity` (borrador sin compilar), EAS por entornos, blueprint de Render, CI en GitHub Actions y tests del motor del juego (jest-expo).

#### PRs de la sesión 3 (orden de merge)

Están apilados: cada uno va encima del anterior. Al fusionar uno, GitHub cambia la base del siguiente a `main`.

| Orden | PR | Qué |
|---|---|---|
| 1 | #1 | Ajustes editables |
| 2 | #2 | Privacidad y Términos |
| 3 | #4 | Backend NestJS (sale de `main`) |
| 4 | #5 | Cuenta opcional en la app (Orval) |
| 5 | #6 | Preparar la App Store |
| 6 | #7 | Sincronizar el progreso |
| 7 | #8 | Pantalla de error |
| 8 | #9 | Compras con RevenueCat |
| 9 | #10 | Recuperar a Lumi desde el onboarding |
| 10 | #11 | CI |
| 11 | #12 | Bienvenida a la lista de espera y limpieza |
| 12 | #13 | Postales por descubrir |
| 13 | #14 | Descargar mis datos |
| 14 | #16 | Blueprint de Render |
| 15 | #17 | Seguridad del backend |
| 16 | #18 | Permiso de avisos en contexto |
| 17 | #19 | Tests de la app |
| 18 | #20 | Valoraciones y gestionar suscripción |
| 19 | #3 | Hogar: tocar a Lumi y medidor |
| 20 | #21 | Este resumen |
| 21 | #23 | No usar un dominio que no es nuestro |
| 22 | #24 | Expediciones sin destripar la postal |
| 23 | #25 | Ficha de la App Store (borrador) |
| 24 | #26 | Chispas: qué son y cómo se consiguen |
| 25 | #27 | Operación: canales de EAS Update y logs de peticiones |
| 26 | #28 | Idiomas 1: base i18n, contenido del juego y textos de Lumi |
| 27 | #29 | Idiomas 2: todas las pantallas |
| 28 | #30 | Idiomas 3: errores y correos del backend |
| 29 | #31 | Idiomas 4: legales, ayuda y landing |
| 30 | #32 | Ficha de la App Store en 5 idiomas y CI de la ficha |
| 31 | #33 | Pulido: idioma en Ajustes, hora de 12 h, hreflang, cuenta de revisión y rachas |
| 32 | #34 | Aviso del domingo con el resumen de la semana |
| 33 | #35 | Accesibilidad: selectores ajustables y texto grande |
| 34 | #36 | Plus: anunciar solo lo que existe (+ escudo estricto y «Tus números») |
| — | #15 | **Borrador:** Screen Time nativo (encima de #36, con idiomas y escudo estricto; fusionar cuando compile en un iPhone) |
| — | #22 | **Borrador:** widget de Lumi (encima de #15) |

Los borradores se activan al compilar con `LUMI_SCREEN_TIME=1` y `LUMI_WIDGET=1` (ver `app/app.config.ts`); sin esas variables, la app es la de siempre.

### Prompts de Higgsfield (reutilizables)

**Lumi:**

> Character design sheet art of 'Lumi', a tiny cute round light spirit creature for a cozy self-care mobile app. Soft squishy mochi-like round body, pastel lavender (#C9BFF2) soft velvety skin with a subtle gradient to violet (#8C7BD8) at the bottom, two big glossy expressive dark eyes with sparkle highlights, small peach-pink blush cheeks, tiny happy smile, two short stubby feet, two tiny curved antennae each topped with a glowing warm amber-gold orb of light (#FFC96B), and a soft warm golden glow shining from its belly. Gentle golden glow halo around it. Soft 2D cozy illustration, painterly with gentle grain texture, rounded shapes, inspired by Studio Ghibli spirits and Kirby, Finch app aesthetic. Centered, full body, front view, radiant joyful expression. Isolated on a plain flat solid white background, no scenery, no shadow on floor, no text.

**Fondo:**

> Vertical mobile app home background, cozy magical night meadow at dusk in soft 2D painterly illustration style (Studio Ghibli inspired, cozy game aesthetic like Finch app). Deep indigo night sky (#1B1840 at top blending to #2A2560) with scattered soft twinkling stars and a gentle crescent moon, dreamy lavender (#8C7BD8, #C9BFF2) mist and rolling hills in the midground, floating warm amber-gold fireflies (#FFC96B, #FFE3A3) drifting everywhere. In the lower third: a tiny cozy round burrow house built into a mossy hill with a round wooden door and a warm glowing window, soft grass, little glowing mushrooms and flowers with peach-pink accents. The center and lower-center area is open soft grassy clearing (empty space where a small character will stand). Calm, soft, rounded shapes, gentle grain texture, low contrast in top area for UI text. No characters, no animals, no text.

**IDs de trabajo en Higgsfield:** Lumi A `9ad524b6-84bf-4d0a-b1e2-a7f77db34c37` · Lumi B (elegida) `9df40ac5-4f6d-44a4-b8db-41c2d24aabc9` · Fondo `5ebffd5e-2291-4ad2-b822-2be0e3a7551c`.

---

## 4. Sistema visual (sale de Lumi)

| Token | Hex | Uso |
|---|---|---|
| Noche | `#1B1840` / `#13112E` | Fondos |
| Índigo | `#2A2560` | Tarjetas, capas |
| Violeta | `#8C7BD8` | Detalles, interruptores |
| Lavanda | `#C9BFF2` / `#E6E0FB` | Bocadillo de Lumi, progreso |
| Ámbar | `#FFC96B` / `#FFE3A3` | La luz de Lumi: acento, botones principales, pestaña activa |
| Melocotón | `#FFB4A2` | Mejillas, detalles cálidos |
| Texto | `#F4F0FF` / `#B9B0E6` / `#A69FD8` | Principal, secundario, terciario |

- **Tipografía:** Fraunces con el eje SOFT al máximo (títulos de cuento) y Figtree (texto).
- **Reglas:** tema oscuro único a propósito (mundo nocturno); el ámbar se reserva para "luz" y acciones principales.
- **Estados de Lumi:**

| Estado | Tramo del límite | Brillo | Expresión objetivo (paso 2) | Expedición |
|---|---|---|---|---|
| Radiante | 0-25 % | 100 % | Ojos brillantes, sonrisa abierta, brazos arriba | Sale |
| Contenta | 25-50 % | 75 % | La ilustración actual | Sale |
| Cansada | 50-75 % | 42 % | Párpados medio caídos, bostezo | Se queda en casa |
| Apagadita | 75-100 %+ | 16 % | Dormida hecha bolita, ojos cerrados, "z" | Se queda en casa |

---

## 5. Pasos pendientes

> Lo necesario para publicar está en `APP_STORE.md`. Lo más urgente: pedir el entitlement de Family Controls y desplegar el backend.

### Paso 2. Generar los 4 estados de Lumi (hecho: app, landing y mockup HTML)

- **Objetivo:** que sea la misma criatura con expresiones distintas.
- **Cómo:**
  1. Subir `assets/web/lumi-recorte.png` a Higgsfield (`media_upload_widget`) o reutilizar el job `9df40ac5…` como referencia.
  2. Con un modelo que acepte imagen de referencia (`nano_banana_pro`, `seedream_v5_pro` o `flux_kontext`), pedir solo el cambio de expresión y postura, manteniendo el estilo, los colores y el fondo blanco.
  3. Recortar con el mismo método (o con `remove_background` de Higgsfield) y exportar a `assets/web/lumi-<estado>.webp`.
  4. En la plantilla, cambiar `LUMI_SRC` por un mapa estado → imagen y quitar los filtros CSS de brillo que sobren (mantener el halo).
- **Coste:** con el plan gratuito deberían bastar los créditos que quedan. Comprobar el saldo antes (`balance`) y el coste de cada generación (`get_cost`).
- **Opcional (plan Basic):**
  - Bucle de vídeo de Lumi respirando o flotando.
  - 2-3 postales ilustradas: Bosque de Musgo, Cuevas de Cristal y Lago de las Lunas.

### Paso 3. Completar las pantallas del MVP en el mockup

- **Onboarding (3 pasos):**
  1. Conocer a Lumi y ponerle nombre.
  2. Elegir las apps ladronas (simular el `FamilyActivityPicker` de Apple).
  3. Límite diario suave y horario de noche.
- **Postal nocturna:** la notificación "Lumi ha vuelto de las Cuevas de Cristal 🌙" y la pantalla completa de la postal con objetos y chispas ganadas.
- **Paywall:** prueba gratuita de 7 días, 49,99 $/año; que el plan gratis se sienta generoso (lección de Opal).
- **Resumen semanal vertical:** para stories y TikTok (9:16).
- Añadir estas pantallas al control "Superficie" del mockup.

### Paso 4. Pedir el entitlement de Family Controls a Apple

- **Por qué ya:** tarda y sin él no se puede probar el bloqueo real en iOS.
- **Qué hace falta:** cuenta de Apple Developer (99 $/año) y el formulario de solicitud de Family Controls (Distribution), explicando que es una app de bienestar digital para el propio usuario.
- **Mientras tanto** se puede prototipar en el simulador con la capacidad de desarrollo:
  - `FamilyControls`: pedir autorización e integrar `FamilyActivityPicker`.
  - `DeviceActivityMonitor`: eventos al 25, 50, 75 y 100 % del límite.
  - `ShieldConfiguration`: el escudo con Lumi.
  - `WidgetKit`: el widget de Lumi.

### Paso 5. Validar antes de programar en serio

- **Landing con lista de espera:** Lumi, la metáfora de la luz, el escudo como gancho y un formulario de correo.
- **2-3 vídeos cortos para TikTok o Reels:**
  - "Mi mascota me pilló abriendo Instagram a las 2 am" (el escudo).
  - Lumi volviendo con una postal.
  - El resumen semanal.
- **Métrica para decidir:** registros por visita en la landing y guardados o compartidos en los vídeos.

---

## 6. Notas técnicas

- **Descargas desde la nube:** el espacio de trabajo en la nube de Claude no puede descargar del CDN de Higgsfield (`cloudfront.net`). Las imágenes se descargan a mano en `assets/` y Claude las lee desde esta carpeta.
- **Commits desde Claude:** en esta carpeta necesita permiso de borrado (Git borra sus archivos `.lock`); se concede por sesión.
- **Repositorio:** en GitHub (`origin` = https://github.com/MniSantiago/Lumi). Todo se trabaja en ramas con PR contra `main`.
- **Expo:** proyecto `@mnisantiago/lumi` (https://expo.dev/accounts/mnisantiago/projects/lumi), vinculado en `app/app.json`.
