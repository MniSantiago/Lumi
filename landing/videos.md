# Lampi: vídeos cortos para validar (TikTok y Reels)

Paso 5 de `PROCESO.md`: antes de programar en serio, medir si la idea engancha.
Tres vídeos verticales (9:16, 1080×1920) de 15 a 30 s, cada uno con un solo momento de la app.
Todos enlazan a la landing con UTM, para cruzar vídeo y registros:

```
https://<dominio>/?utm_source=tiktok&utm_medium=video&utm_campaign=escudo
https://<dominio>/?utm_source=tiktok&utm_medium=video&utm_campaign=postal
https://<dominio>/?utm_source=tiktok&utm_medium=video&utm_campaign=resumen
```
(En Instagram, `utm_source=instagram`. En la bio, un solo enlace con `utm_campaign=bio`.)

## Métrica de decisión

| Dónde | Qué mirar | Umbral orientativo para seguir |
|---|---|---|
| Vídeos | Guardados + compartidos por cada 1000 visualizaciones | 10 o más (1 %) |
| Vídeos | Retención a los 3 s (el gancho funciona) | 60 % o más |
| Vídeos | Comentarios del tipo «¿cómo se llama?», «la quiero» | Contarlos a mano |
| Landing | Registros / visitas (`waitlist_success` / `page_view`), por `utm_campaign` | 15 % o más desde TikTok |

Los umbrales son una referencia inicial para comparar vídeos entre sí, no una verdad. Lo útil es ver cuál de los tres gana y hacer más de ese.

---

## Cómo grabar desde el simulador de iOS

1. Arranca la app en el simulador (iPhone 16 Pro o 17 Pro, que salen a 1179×2556 o parecido; luego se reencuadra a 9:16).
2. Oculta la hora real: `xcrun simctl status_bar booted override --time "2:07" --batteryState charged --batteryLevel 100 --cellularBars 4`
   (para el vídeo 2, `--time "21:04"`; para el 3, `--time "20:30"`). Quítalo con `xcrun simctl status_bar booted clear`.
3. Graba: `xcrun simctl io booted recordVideo --codec h264 escudo.mp4` y para con Ctrl+C.
4. Botones de desarrollo que ayudan:
   - **Ajustes → Desarrollo:** «Ver el escudo», «Ver la postal nocturna», «Cerrar el día» (Lampi vuelve de la expedición), «Pasar al día siguiente».
   - **Hogar:** «Simular uso» (salta de umbral en umbral: Radiante → Contenta → Cansada → Apagadita).
   - Antes de grabar, ocúltalos del encuadre o recorta en edición.
5. Monta en CapCut: texto en pantalla con Figtree o la fuente del sistema de TikTok, subtítulos automáticos revisados a mano.
6. El simulador no muestra el dedo: activa los toques visibles o añade un círculo en edición en cada toque. En el vídeo 1 se agradece grabar además el iPhone real con otra cámara (la mano abriendo Instagram) y montar el plano del escudo encima.

---

## Vídeo 1. «Mi mascota me pilló abriendo Instagram a las 2 am» (el escudo)

**Duración:** 15-18 s. **Es el vídeo estrella.**

**Gancho (0-1,5 s), texto en pantalla:** «mi mascota me pilló abriendo Instagram a las 2 am 💀»

| Tiempo | Plano | Qué se hace |
|---|---|---|
| 0,0-1,5 s | Habitación a oscuras, solo la luz del móvil en la cara (grabado con el iPhone real) o pantalla de inicio del simulador a las 2:07 | El pulgar va a Instagram |
| 1,5-3 s | Toque en Instagram | Corte seco al escudo (Ajustes → Desarrollo → «Ver el escudo») |
| 3-7 s | Escudo: Lampi apagadita, «Lampi se estaba echando la siesta… ¿de verdad entramos?» | Quieto 3 s, que se lea. Zoom suave a la cara de Lampi |
| 7-10 s | El dedo duda entre los dos botones | Toque en «5 min más»; aparece «Vale, 5 minutitos. Aquí te espero 🌙» |
| 10-13 s | Texto en pantalla: «a los 5 min…» | Vuelve el escudo; ahora el botón dice «Vale… 5 min, pero te espero despierta» |
| 13-16 s | Toque en «Vale, lo dejo» | «Gracias. Me quedo soñando contigo 💤» y Lampi dormida. Fundido a negro |
| 16-18 s | Cierre | Texto: «se llama Lampi. lista de espera en la bio» |

**Texto en pantalla / subtítulos:** mínimos, en minúsculas, tono de confesión. Sin voz en off: la gracia es leer el escudo.
**Alternativa con voz (susurrando):** «Son las dos de la mañana. Solo iba a mirar una cosa… y mi mascota me ha pillado. Me ha mirado así. No he podido.»
**Sonido:** audio en tendencia de tipo «caught in 4K» o un silencio con un «ding» suave al salir el escudo. Si no, una nana de caja de música muy bajita.
**Hashtags:** #tiempodepantalla #doomscrolling #appsdebienestar #cozygames #mascotavirtual #finchapp #selfcare #insomnio
**Qué medir:** retención a 3 s (¿funciona el gancho?), compartidos (es el que más debería compartirse: «literal yo»), comentarios pidiendo el nombre. Variante A/B: gancho con TikTok en vez de Instagram.

---

## Vídeo 2. Lampi vuelve con una postal

**Duración:** 20-25 s.

**Gancho (0-1,5 s), texto en pantalla:** «hoy no he tocado TikTok y mira lo que me ha traído»

| Tiempo | Plano | Qué se hace |
|---|---|---|
| 0-2 s | Hogar con Lampi radiante, el medidor «Luz de hoy» casi lleno | Lampi flotando entre luciérnagas |
| 2-5 s | Hogar: «Lampi está explorando…» | Ajustes → Desarrollo → «Cerrar el día». Vuelve a Hogar |
| 5-8 s | Aviso «¡Lampi ha vuelto! Toca para ver la postal» | Toque |
| 8-16 s | La postal nocturna a pantalla completa | Se lee el texto de Lampi (por ejemplo, el Bosque de Musgo: «El musgo estaba tan blandito que me eché una siesta sin querer…»). Mostrar los objetos y las chispas ganadas |
| 16-21 s | Colección | Abrir la pestaña Colección: la postal nueva en el álbum, huecos por llenar |
| 21-24 s | Cierre | Texto: «20 sitios por descubrir. se llama Lampi, link en la bio» |

**Voz en off (tranquila, cercana):** «Hoy he dejado el móvil y mi Lampi se ha ido de aventura. Por la noche ha vuelto con esto. Dice que se echó una siesta en el musgo y que alguien la tapó con una hoja. Estoy bien. Todo bien.»
**Sonido:** lo-fi cozy o piano suave; nada con letra que tape la voz.
**Hashtags:** #cozy #cozyaesthetic #tiempodepantalla #desconexiondigital #mascotavirtual #postales #selfcare
**Qué medir:** guardados (es el vídeo de «lo quiero»), duración media vista (¿se leen la postal?), comentarios sobre la historia.

---

## Vídeo 3. El resumen semanal

**Duración:** 15-20 s.

**Gancho (0-1,5 s), texto en pantalla:** «mi semana de móvil contada por mi mascota (no me juzguéis)»

| Tiempo | Plano | Qué se hace |
|---|---|---|
| 0-3 s | Hogar, Lampi apagadita (el lunes) | «Simular uso» hasta Apagadita. Texto: «lunes: desastre» |
| 3-7 s | Montaje rápido de días | «Pasar al día siguiente» + «Simular uso» con estados distintos, un corte por día (1 s cada uno). Texto por día: «martes: mejor», «miércoles: lo intenté», «jueves: radiante ✨» |
| 7-14 s | Resumen semanal vertical (ruta `resumen`, cuando esté hecho) | Recorrido de arriba abajo: días brillando, postales de la semana |
| 14-18 s | Toque en compartir | Hoja de compartir de iOS con el resumen como imagen |
| 18-20 s | Cierre | Texto: «¿la tuya cómo saldría? lista de espera en la bio» |

**Voz en off (con humor):** «El lunes, un desastre. El miércoles, lo intenté. Pero el jueves Lampi volvió de las Cuevas de Cristal y el domingo me hizo esto. Cinco días brillando. Lo voy a poner de fondo de pantalla.»
**Sonido:** audio en tendencia de tipo «recap» o «photo dump»; cortes al ritmo.
**Hashtags:** #resumensemanal #tiempodepantalla #weeklyrecap #cozy #mascotavirtual #habitos #digitalwellbeing
**Qué medir:** compartidos y duetos o stitches («la mía saldría así»), clics a la landing con `utm_campaign=resumen`.
**Depende de:** la pantalla del resumen semanal (hoy es provisional en la app). Si no llega a tiempo, sustituir el tramo 7-14 s por la pestaña Progreso.

---

## Calendario sugerido

- Semana 1: vídeo 1 (dos variantes de gancho) + vídeo 2.
- Semana 2: el que mejor funcione, con otro gancho, + vídeo 3.
- Publicar entre las 20:00 y las 23:00 (hora de España), que es cuando la gente se reconoce en el problema.
- Responder a los comentarios con vídeo y enlazar la lista de espera.
