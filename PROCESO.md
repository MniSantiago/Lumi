# Lumi: registro del proceso

Última sesión: lunes 28 de septiembre de 2026.
Para retomar: abre un chat en el proyecto "Cozy experience" (o pega este archivo y `BRIEF.md`) y di en qué paso vamos.

---

## 1. Estado actual

| Pieza | Estado | Dónde está |
|---|---|---|
| Brief del proyecto | Hecho | `BRIEF.md` |
| Mockup HTML con marco de iPhone | Hecho (v2, con las ilustraciones de Higgsfield) | `lumi-mockup.html` y el artifact en claude.ai: https://claude.ai/artifact/U7vrjvNhSVL9wLAQnRwmuB |
| Lumi elegida | Variante B (`fa783b9e…`), recortada | Original en `assets/fa783b9e-….png`; recorte en `assets/web/lumi-recorte.png` |
| Fondo del hogar | Hecho e integrado | Original en `assets/Vertical-mobile-app-home-background-coz.png` |
| Lumi en 4 estados con expresiones propias | Hecho (ilustraciones), recortados para la app | Originales en `assets/Radiante.png`, `Cansada.png`, `Apagadita.png`; recortes en `app/assets/lumi/`. El mockup HTML aún usa filtros CSS |
| App Expo (SDK 57) con las 5 pestañas | Hecho (v1, datos de ejemplo y uso simulado) | `app/` |
| Pantallas de onboarding, postal nocturna y paywall | **Pendiente** (paso 3) | |
| Entitlement de Family Controls | **Pendiente** (paso 4) | |
| Validación (landing y TikTok) | **Pendiente** (paso 5) | |
| Repositorio Git | En GitHub: `origin` = github.com/MniSantiago/Lumi (`main` y `feat/expo-app`) | Raíz de esta carpeta |

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

### Paso 2. Generar los 4 estados de Lumi (hecho para la app; falta llevarlos al mockup HTML)

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
- **Repositorio:** en GitHub (`origin` = https://github.com/MniSantiago/Lumi). La app está en la rama `feat/expo-app`.
- **Expo:** proyecto `@mnisantiago/lumi` (https://expo.dev/accounts/mnisantiago/projects/lumi), vinculado en `app/app.json`.
