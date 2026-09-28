# Lumi

El Finch del tiempo de pantalla: un espíritu de luz que vive contigo todo el día. Cuando sueltas el móvil, brilla y sale de aventura; cuando haces scroll, se atenúa y te espera en casa.

## Contenido

| Ruta | Qué es |
|---|---|
| `app/` | **App de iOS con Expo** (ver `app/README.md`) |
| `BRIEF.md` | Brief del proyecto: idea, competidores, criatura, mecánica y alcance del MVP |
| `PROCESO.md` | Estado actual, historial y **pasos pendientes** (léelo para retomar) |
| `lumi-mockup.html` | Mockup interactivo para iPhone, generado (ábrelo en el navegador) |
| `src/lumi-mockup.template.html` | Fuente del mockup; se edita esta |
| `tools/build.py` | Incrusta las imágenes y genera `lumi-mockup.html` |
| `tools/cutout_states.py` | Recorta los 4 estados de Lumi para la app |
| `assets/` | Originales de Higgsfield |
| `assets/web/` | Imágenes recortadas y optimizadas que usa el mockup |

## Regenerar el mockup

```bash
python3 tools/build.py
```

## Arrancar la app

```bash
cd app && npm install && npx expo start
```
