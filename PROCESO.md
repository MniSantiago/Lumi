# Lumi: registro del proceso

Última sesión: lunes 28 de septiembre de 2026.
Para retomar: pega este archivo y `BRIEF.md` al inicio de una nueva sesión.

---

## 1. Estado actual

| Pieza | Estado | Dónde está |
|---|---|---|
| Brief del proyecto | Hecho | `BRIEF.md` |
| Mockup HTML con marco de iPhone | Hecho (v1) | `lumi-mockup.html` y artifact en claude.ai: https://claude.ai/artifact/U7vrjvNhSVL9wLAQnRwmuB |
| Lumi generada con Higgsfield | 2 variantes base (sin elegir) | En tu cuenta de Higgsfield (ver IDs abajo) |
| Fondo nocturno con Higgsfield | 1 versión vertical 9:16 | En tu cuenta de Higgsfield |
| Lumi en 4 estados (imagen) | Pendiente | |
| Vídeo o bucle animado | Pendiente | |
| Postales ilustradas | Pendiente (hoy son degradados en CSS) | |

Para ver el mockup: abre `lumi-mockup.html` en el navegador. No necesita nada más.

---

## 2. Qué se hizo en esta sesión

### 2.1 Higgsfield

- La cuenta está en el **plan gratuito con 10 créditos**.
- El modelo por defecto de imagen (`gpt_image_2_5`, 0,25 créditos por imagen) **requiere plan Basic**, así que se usó **Nano Banana Pro** (`nano_banana_pro`, 2K).
- Trabajos lanzados:

| Job ID | Qué es |
|---|---|
| `9ad524b6-84bf-4d0a-b1e2-a7f77db34c37` | Lumi, variante A (1:1, fondo blanco) |
| `9df40ac5-4f6d-44a4-b8db-41c2d24aabc9` | Lumi, variante B (1:1, fondo blanco). URL: https://d8j0ntlcm91z4.cloudfront.net/user_3Jy551jvvUzeiYXwuDTqxAfRMmV/hf_20260928_184725_9df40ac5-4f6d-44a4-b8db-41c2d24aabc9.png |
| `5ebffd5e-2291-4ad2-b822-2be0e3a7551c` | Fondo del hogar (9:16): pradera nocturna con madriguera, luna, luciérnagas y hueco central para Lumi |

- **Bloqueo:** el espacio de trabajo de Claude no puede descargar archivos del servidor de Higgsfield (CloudFront), así que las imágenes no se pudieron meter en el mockup.
- **Cómo desbloquearlo:** descarga los PNG desde Higgsfield y guárdalos en `assets/` dentro de esta carpeta. En la próxima sesión Claude los lee desde aquí, los recorta y los integra.

#### Prompt usado para Lumi (reutilizable)

> Character design sheet art of 'Lumi', a tiny cute round light spirit creature for a cozy self-care mobile app. Soft squishy mochi-like round body, pastel lavender (#C9BFF2) soft velvety skin with a subtle gradient to violet (#8C7BD8) at the bottom, two big glossy expressive dark eyes with sparkle highlights, small peach-pink blush cheeks, tiny happy smile, two short stubby feet, two tiny curved antennae each topped with a glowing warm amber-gold orb of light (#FFC96B), and a soft warm golden glow shining from its belly. Gentle golden glow halo around it. Soft 2D cozy illustration, painterly with gentle grain texture, rounded shapes, inspired by Studio Ghibli spirits and Kirby, Finch app aesthetic. Centered, full body, front view, radiant joyful expression. Isolated on a plain flat solid white background, no scenery, no shadow on floor, no text.

#### Prompt usado para el fondo

> Vertical mobile app home background, cozy magical night meadow at dusk in soft 2D painterly illustration style (Studio Ghibli inspired, cozy game aesthetic like Finch app). Deep indigo night sky (#1B1840 at top blending to #2A2560) with scattered soft twinkling stars and a gentle crescent moon, dreamy lavender (#8C7BD8, #C9BFF2) mist and rolling hills in the midground, floating warm amber-gold fireflies (#FFC96B, #FFE3A3) drifting everywhere. In the lower third: a tiny cozy round burrow house built into a mossy hill with a round wooden door and a warm glowing window, soft grass, little glowing mushrooms and flowers with peach-pink accents. The center and lower-center area is open soft grassy clearing (empty space where a small character will stand). Calm, soft, rounded shapes, gentle grain texture, low contrast in top area for UI text. No characters, no animals, no text.

### 2.2 Diseño de Lumi (decisiones tomadas)

- **La luz vive en dos antenas con orbes ámbar y en la barriga.** El brief lo dejaba abierto (cola, antenas o barriga).
- **Cuerpo:** redondo tipo mochi, lavanda con degradado a violeta, dos pies pequeños, mejillas melocotón y brillo blanco arriba a la izquierda.
- **Estados:** en el mockup cambian estas variables:

| Estado | Tramo del límite | Brillo | Ojos | Boca | Extra |
|---|---|---|---|---|---|
| Radiante | 0-25 % | 100 % | Abiertos con brillo | Sonrisa abierta | Sale de expedición |
| Contenta | 25-50 % | 75 % | Abiertos | Sonrisa | Sale de expedición |
| Cansada | 50-75 % | 42 % | Medio cerrados | Bostezo | Se queda en casa |
| Apagadita | 75-100 %+ | 16 % | Cerrados | Relajada | "z" flotando, siesta |

### 2.3 Mockup (`lumi-mockup.html`)

- **Construcción:** HTML, CSS y JS en un solo archivo, con Lumi dibujada en SVG vectorial (función `lumiSVG(estado)` en el script).
- **Controles fuera del teléfono:**
  - "Luz de hoy" simula los 4 estados: cambian Lumi, el medidor, el mensaje, las chispas, la expedición y los widgets.
  - "Superficie" alterna entre la app, el escudo de bloqueo y los widgets.
- **Pestañas:**
  1. **Hogar:** mundo nocturno animado (estrellas y luciérnagas en canvas cuyo brillo depende del estado), madriguera, mensaje de Lumi, medidor "Luz de hoy" en 4 tramos, chispas y tarjeta de expedición.
  2. **Expediciones:** sendero de zonas (visitadas, actual y bloqueadas) y postales recibidas.
  3. **Colección:** postales, objetos y criaturas amigas, con huecos bloqueados.
  4. **Progreso:** racha con días de descanso, gráfica semanal por tramos, resumen compartible y evolución (Chispa, Farolito, Estrella, Aurora).
  5. **Ajustes:** apps ladronas, límite con stepper, horario de noche, interruptores y tarjeta de Plus (7 días gratis, 49,99 $/año).
- **Extras:** escudo ("Lumi se estaba echando la siesta… ¿de verdad entramos?" con [Vale, lo dejo] y [5 min más]) y widgets de bloqueo e inicio.
- **Medidor:** muestra tramos, no minutos exactos, para ser coherente con el límite de la API de Screen Time (solo umbrales).

### 2.4 Sistema visual (sale de Lumi)

| Token | Hex | Uso |
|---|---|---|
| Noche | `#1B1840` / `#13112E` | Fondos |
| Índigo | `#2A2560` | Tarjetas, capas |
| Violeta | `#8C7BD8` | Detalles, interruptores |
| Lavanda | `#C9BFF2` / `#E6E0FB` | Bocadillo de Lumi, progreso |
| Ámbar | `#FFC96B` / `#FFE3A3` | Acento: la luz de Lumi, botones principales, pestaña activa |
| Melocotón | `#FFB4A2` | Mejillas, detalles cálidos |
| Texto | `#F4F0FF` / `#B9B0E6` / `#A69FD8` | Principal, secundario, terciario |

- **Tipografía:** Fraunces con el eje SOFT al máximo (títulos redondeados de cuento) y Figtree (texto).
- **Reglas:** tema oscuro único a propósito (es un mundo nocturno). El ámbar se reserva para "luz" y acciones principales.

### 2.5 Revisión de diseño aplicada (design-critique)

- Subí el contraste del texto terciario para cumplir WCAG AA en textos pequeños.
- Quité una leyenda del medidor que contradecía los tramos iluminados.
- Unifiqué el nombre "Expediciones" en la pestaña y el título.

---

## 3. Próximos pasos sugeridos

1. **Elegir la variante de Lumi (A o B)** en Higgsfield y guardarla en `assets/`.
2. **Generar los 4 estados** usando la variante elegida como referencia (con `nano_banana_pro` o `seedream_v5_pro`, que tiene `remove_bg`) para mantener la coherencia, y recortar el fondo.
3. **Sustituir el SVG por los PNG** en el mockup: cambiar `lumiSVG()` por una etiqueta `<img>` según el estado (las imágenes van incrustadas como data URI para que el artifact las muestre).
4. **Poner el fondo generado** en la capa `.world` del Hogar, manteniendo las luciérnagas del canvas encima para dar movimiento.
5. **Opcional, según créditos:** un bucle de vídeo de Lumi respirando y 2-3 postales ilustradas.
6. **Pantallas que faltan del MVP:** onboarding (elegir y nombrar a Lumi, apps ladronas, límite y noche), postal nocturna a pantalla completa y paywall.
