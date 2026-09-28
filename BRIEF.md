# Lumi: brief del proyecto (contexto para una nueva sesión)

> Pega este documento al inicio de una nueva sesión con Claude para continuar donde lo dejamos.

---

## 0. Qué quiero que hagas en esta sesión

1. **Construir el mockup de la app móvil**: la pantalla principal y las pestañas principales, con el skill `frontend-design` (y después revisarlo con `design:design-critique`).
2. **Generar la criatura (Lumi) y el fondo con Higgsfield MCP** (imágenes y, si se puede, vídeo o animación en bucle). Si Higgsfield no está conectado, avísame antes de empezar.
3. El **fondo tiene que hacer match con la criatura**, y **el estilo y los colores del tema de la app tienen que salir de la criatura**.

---

## 1. Origen de la idea

- Inspiración: **Finch: Self-Care Pet** (https://apps.apple.com/us/app/finch-self-care-pet/id1528595748), con un MRR estimado de ~1 M $ (estimación de terceros, no oficial).
- Por qué funciona Finch:
  1. Vínculo emocional en vez de disciplina: haces las tareas "para cuidar a tu mascota".
  2. Estética cozy que se comparte y se viraliza en TikTok.
  3. Nicho con un dolor real (salud mental; mujeres de la Gen Z y millennials).
  4. Freemium generoso y suscripción que se siente como "apoyar" (~70 $/año).
- **Fórmula:** mascota o compañero + hábito que la gente ya quiere cambiar + estética compartible + cero culpa.
- Idea elegida: **una mascota para reducir el tiempo de pantalla** (dejar el móvil y el doomscrolling).

---

## 2. Análisis de competidores (resumen)

### Bloqueadores "fríos": demuestran que la gente paga
| App | Datos clave |
|---|---|
| **Opal** | ~10 M $ ARR con 11 personas (Latka estima 17 M $), más de 1 M de usuarios activos diarios, 4,7★ con 89 K valoraciones, 99,99 $/año. Pasó de paywall duro a freemium: la conversión bajó del 20 % al 9 %, pero los ingresos se duplicaron. Los estudiantes son 2/3 de sus usuarios activos diarios. Su CEO insiste en el "product soul" (momentos emocionales). |
| **one sec** | Pausa para respirar antes de abrir la app; con base en investigación. |
| **Clearspace** | Hay que "ganarse" la entrada con un ejercicio. |
| **Brick** | Bloqueo con dispositivo físico; el más difícil de saltarse. |
| **Jomo / ScreenZen** | Baratas o gratis; ScreenZen es gratis y muy configurable. |

### Competidor principal: Focus Friend (Hank Green) ⚠️
- Una judía que teje mientras no usas el móvil y se pone triste si abandonas. En iOS bloquea apps mediante Screen Time.
- Número 1 del App Store en EE. UU. y otros países; App del Año de Google Play 2025; más de 1,7 M de descargas.
- **Punto débil:** es un **temporizador** (sesiones que inicia el usuario), no un compañero pasivo de 24 h.
- **Ventaja injusta:** la audiencia de Hank Green.

### Mascotas indie: el hueco sigue abierto
- **Screencat** (3 valoraciones, 49,99 $/año), **Chinchillers** (sin valoraciones), **Screen Pet** (1★, paywall inmediato, no mide la pantalla), **Screentime Pal/Palli** (pixel art, poca tracción), **Phreepet** (concepto de Hacker News: mascota pasiva que se "deprime" con el scroll nocturno), **Gruu** (se alimenta de pasos).
- **Conclusión:** muchos han tenido la idea y nadie la ha ejecutado a nivel Finch. Los fallos típicos son pixel art genérico, paywall inmediato y mecánica superficial.

### Nuestro posicionamiento
**"El Finch del tiempo de pantalla": un compañero que vive contigo todo el día, no un temporizador.**
- Pasivo en vez de activo; sin castigo (nunca muere); momentos para compartir; modo noche; freemium generoso.
- Precio orientativo: **49,99-59,99 $/año** con prueba gratuita.

### Riesgos
- **Límite técnico de iOS:** la API de Screen Time (FamilyControls, DeviceActivity, ManagedSettings) **no deja leer los minutos exactos libremente**. Se trabaja con **umbrales** (eventos de `DeviceActivityMonitor`), inicio y fin de horarios, y escudos (`ShieldConfiguration`). Los informes detallados viven en una extensión aislada (`DeviceActivityReport`). **La mecánica está diseñada alrededor de umbrales.**
- Hay que pedir a Apple el entitlement de Family Controls.
- Focus Friend podría añadir un modo pasivo; nuestra defensa es el personaje y el vínculo emocional.
- Android (UsageStats) permite más, pero el público que paga está sobre todo en iOS.

---

## 3. La criatura elegida: **Lumi** ✨

- **Qué es:** un espíritu de luz pequeño, redondo y suave, **con carita** (ojos grandes y expresivos) y **una luz propia** (en la cola, las antenas o la barriga, por definir en el diseño).
- **Metáfora:** *tu atención es luz.* Cuando no haces scroll, Lumi brilla y sale de aventura. Cuando haces scroll, se atenúa y se queda en casa esperándote.
- **Por qué:** los ojos permiten crear vínculo, y el brillo es un indicador de estado que se lee al instante (ideal para el widget). Encaja con la noche (luciérnagas, dormir) y ningún competidor lo usa.
- **Estados** (siempre tiernos, nunca muere):
  - ✨ **Radiante** (0-25 % del límite): brillo máximo, energía, sale de expedición.
  - 🙂 **Contenta** (25-50 %)
  - 😪 **Cansada** (50-75 %): luz tenue, bosteza.
  - 💤 **Apagadita** (75-100 %+): se echa la siesta con un brillo mínimo. Se recupera al día siguiente.
- Referentes: Tsuki's Odyssey, Neko Atsume, Finch; también luciérnagas, espíritus de Ghibli (kodamas, susuwatari) y Kirby en cuanto a forma.

### Dirección visual
- **Estilo:** ilustración 2D suave, cozy, con bordes redondeados, texturas suaves y glow. **Nada de pixel art** (lo usan los competidores débiles).
- **Paleta (el tema de la app sale de la criatura):**
  - Fondo o noche: **índigo profundo / azul noche** (~#1B1840, #2A2560)
  - Secundario: **lavanda / violeta suave** (~#8C7BD8, #C9BFF2)
  - Acento (la luz de Lumi): **ámbar / dorado cálido** (~#FFC96B, #FFE3A3)
  - Detalles: rosa melocotón suave para las mejillas y los estados cálidos
- **Fondo:** un mundo nocturno y mágico que haga match con Lumi (bosque o pradera al anochecer, luciérnagas, estrellas, una casita o madriguera acogedora). Idealmente animado: partículas de luz flotando y un ligero parallax.
- **Tono de los textos:** cozy y tierno con toques de humor. Siempre habla Lumi, nunca juzga ("te echaba de menos", no "has fallado").

---

## 4. Mecánica

### Metáfora central
> Cuando sueltas el móvil, Lumi sale de aventura. Cuando haces scroll, se queda en casa, aburrida, esperándote.

### Onboarding
1. Eliges a tu Lumi y le pones nombre.
2. Eliges tus "apps ladronas" (TikTok, Instagram…) con el `FamilyActivityPicker` de Apple.
3. Defines un **límite diario suave** (por ejemplo, 1 h) y el **horario de noche** (por ejemplo, 23:00-07:00).

### Ciclo diario
```
Mañana: Lumi se despierta con la luz al máximo
   ↓
Durante el día: la app recibe avisos al 25 / 50 / 75 / 100 % del límite
   ↓
Cambian su luz y su ánimo (Radiante → Contenta → Cansada → Apagadita)
   ↓
Mientras está por encima del 50 %: sale de EXPEDICIÓN
   ↓
Por la noche (fin del día): vuelve con postal + objetos + fragmento de historia
   ↓
Si respetas el horario de noche: duerme bien y bonus al día siguiente
```

### La pantalla de bloqueo ES Lumi ⭐
- Al superar el límite y abrir una app ladrona aparece un `ShieldConfiguration` personalizado con Lumi:
  *"Lumi se estaba echando la siesta… ¿de verdad entramos?"*, con los botones **[Vale, lo dejo]** y **[5 min más]**.
- Fricción emocional, no punitiva. Es el momento más compartible ("mi mascota me pilló abriendo Instagram a las 2 am").

### Reglas sin culpa
- Nunca muere ni enferma; lo peor es que se aburra o se duerma.
- Cada día empieza de cero.
- Rachas con perdón ("días de descanso").
- Los textos hablan desde Lumi, con cariño.

### Progresión
| Capa | Qué es | Ritmo |
|---|---|---|
| Expediciones | Cada día explora una zona y trae objetos y postales | Diario |
| Colección | Álbum de lugares, criaturas amigas y objetos raros | Semanal |
| Evolución | Lumi crece y su luz cambia de color con semanas de constancia | Mensual |
| Mundo | Su hogar se amplía y decora con lo que trae | Continuo |
| Historia | Las postales cuentan una historia larga por capítulos | Por temporadas |

- **Moneda:** "chispas", que se ganan con las expediciones y se gastan en decoración. **Nunca se compran con dinero real.**

### Superficies clave
1. **Widget** de pantalla de inicio y de bloqueo (siempre gratis): Lumi con su brillo actual.
2. **Pantalla de escudo** con Lumi.
3. **Postal nocturna** (notificación): "Lumi ha vuelto de las Cuevas de Cristal 🌙".
4. **Resumen semanal** en formato vertical para stories y TikTok.

### Monetización
| Gratis (generoso) | Plus (~49,99 $/año) |
|---|---|
| 1 criatura, límite diario, escudo con Lumi | Más especies y colores de luz |
| Expediciones básicas y widget | Zonas exclusivas y capítulos de historia |
| Modo noche básico | Varios horarios, bloqueo estricto, estadísticas detalladas |
| | Decoración premium del hogar |

Lección de Opal: el usuario gratis tiene que **recomendarla**; lo que se paga es cosmético y avanzado.

### Social (fase 2, no para el MVP)
- Visitas entre amigos: la Lumi de un amigo visita tu mundo si los dos tuvisteis un buen día.
- Expediciones conjuntas (bucle viral).

---

## 5. Alcance del MVP
1. Onboarding, selección de apps y límite.
2. 4 estados de Lumi según los umbrales.
3. Escudo personalizado con Lumi.
4. Expedición diaria con postal (unos 20 destinos).
5. Widget.
6. Paywall con prueba gratuita.

**Fuera del MVP:** evolución compleja, lo social, Android, historia larga.

---

## 6. Mockup a construir (siguiente paso)

**Plataforma:** iOS (iPhone), mockup en HTML/CSS con marco de iPhone.

**Pantallas y pestañas (tab bar):**
1. **Hogar (home):** Lumi en grande sobre el fondo nocturno animado, con su estado actual (brillo y ánimo) y un medidor de "luz de hoy" (uso frente a límite, en tramos). Mensaje de Lumi, chispas del día y estado de la expedición ("Lumi está explorando el Bosque de Musgo… vuelve a las 21:00").
2. **Expediciones:** mapa o lista de zonas, expedición actual, postales recibidas.
3. **Colección:** álbum de postales, objetos y criaturas amigas.
4. **Progreso:** racha, resumen semanal (compartible), evolución de Lumi.
5. **Ajustes/Perfil:** apps ladronas, límite diario, horario de noche, Plus.

**Extras si da tiempo:** mockup del escudo de bloqueo con Lumi y del widget.

**Assets a generar con Higgsfield:**
- Lumi en sus 4 estados (misma criatura, coherente entre imágenes), con fondo transparente o fácil de recortar.
- Fondo del hogar: mundo nocturno cozy que haga match con Lumi (formato vertical 9:19.5).
- Opcional: vídeo o bucle animado del fondo (luciérnagas, estrellas) y de Lumi respirando o flotando.
- Opcional: 2-3 ilustraciones de postales de expedición.

**Requisito clave:** la paleta del tema de la app (fondos, tarjetas, botones, tab bar, tipografía) sale de los colores de Lumi y del fondo.

---

## 7. Fuentes consultadas
- Opal: https://www.revenuecat.com/blog/growth/kenneth-schlenker-sub-club-podcast-2026 · https://www.speedinvest.com/knowledge/scaling-smart-how-opal-built-a-10m-arr-business-in-just-2-years · https://getlatka.com/companies/opal.so · https://apps.apple.com/us/app/opal-screen-time-control/id1497465230
- Focus Friend: https://www.fastcompany.com/91388304/focus-friend-app-store-hank-green-bria-sullivan · https://techcrunch.com/2025/11/18/hank-greens-focus-friend-is-google-plays-app-of-the-year
- Mascotas indie: https://apps.apple.com/us/app/screencat-screen-time-pet/id6741950612 · https://apps.apple.com/mx/app/chinchillers/id6479682683 · https://apps.apple.com/us/app/screen-pet-virtual-buddy/id6767791604 · https://screentimepal.app/ · https://gruu.app/ · https://news.ycombinator.com/item?id=47745000
- Otras: https://en.wikipedia.org/wiki/Forest_(application) · https://www.whistleout.com/CellPhones/Apps/best-apps-to-manage-screen-time · https://screentimeindex.com/posts/best-app-blockers-iphone/
