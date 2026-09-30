# Lampi: app (Expo)

App de iOS de Lampi con Expo SDK 57, Expo Router (pestañas nativas) y TypeScript.

## Arrancar

```bash
cd app
npm install
npx expo start        # pulsa i para el simulador de iOS, o escanea el QR con Expo Go
```

En desarrollo, el hogar muestra **Simular uso** (0/25/50/75/100 %) para ver los 4 estados de Lampi.

## Probar sin el Mac (EAS Update)

La versión publicada en el canal `preview` se abre en Expo Go (SDK 57) escaneando `../qr-preview-expo-go.png` con la cámara del iPhone, o con:

```
exp://u.expo.dev/6244480e-5eaa-4ca9-bce9-a3ce408b7116?channel-name=preview&runtime-version=1.0.0
```

Para publicar una nueva versión: `npm run update:preview -- --message "qué cambia"`.
Las publicaciones aparecen en https://expo.dev/accounts/mnisantiago/projects/lumi/updates

## Canales en producción

Cada perfil de build escucha su canal (`eas.json`): `development`, `preview` y `production`. Un arreglo solo de JavaScript llega a la versión de la tienda sin pasar por revisión con `npm run update:production -- --message "qué cambia"`. Si cambia algo nativo (un paquete nuevo con código nativo, `app.json`), hace falta un build nuevo: `runtimeVersion` sigue a la versión de la app.

## Estructura

| Ruta | Qué es |
|---|---|
| `src/app/` | Pantallas (una por pestaña): `index` (Hogar), `expediciones`, `coleccion`, `progreso`, `ajustes` |
| `src/constants/theme.ts` | Colores, tipografías y espaciado (salen de Lampi, ver `PROCESO.md`) |
| `src/lumi/states.ts` | Los 4 estados de Lampi y su relación con los umbrales de uso |
| `src/lumi/store.tsx` | Estado global: umbral actual y ajustes (guardados en AsyncStorage) |
| `src/lumi/data.ts` | Contenido de ejemplo: zonas, postales, objetos, semana |
| `src/screen-time/` | Fuente de uso de pantalla. Hoy es un mock; mañana, el módulo nativo |
| `src/components/` | Lampi animada, luciérnagas, medidor de luz y piezas de UI |
| `assets/lumi/` | Lampi en sus 4 estados, recortada (`python3 tools/cutout_states.py` desde la raíz) |
| `src/tour/` | Tutoriales guiados con foco sobre la pantalla real (ver abajo) |
| `assets/tutorial/` | Manita, estrellas, medalla… de los tutoriales (APIMart: `python3 tools/apimart_generate.py tutorial` y `tools/slice_sheets.py tutorial`) |

## Tutoriales guiados

Un tour por pestaña, que sale solo la primera vez que se abre y se repite desde Ajustes → Tutoriales. Un foco oscurece la pantalla salvo el elemento señalado, y Lampi lo explica en una tarjeta. En los pasos `tap` hay que tocar el elemento de verdad.

Para añadir o cambiar un tour:

1. Envuelve el trozo de pantalla con `<TourTarget id="pestaña.algo">…</TourTarget>` (`tour/target.tsx`) y llama a `useTourOnFocus('id-del-tour')` en la pantalla.
2. Escribe los pasos en `tour/definitions.ts` (`tourSteps`), con los textos en los 5 idiomas. El último paso va sin foco: sale la medalla y el confeti.
3. Si es un tour nuevo, añade su id a `TOUR_IDS` (`tour/engine.ts`), su ruta a `TOUR_ROUTE` y su nombre a `tourTitle`.

Los tests (`src/tour/__tests__/`) comprueban las reglas y que cada paso apunte a un `TourTarget` que existe. El foco usa la barra nativa de pestañas por debajo, así que no puede señalar sus iconos, solo elementos dentro de la pantalla.

## Screen Time real

La app solo depende de la interfaz `ScreenTimeSource` (`src/screen-time/index.ts`), que trabaja con
**umbrales** porque iOS no deja leer los minutos exactos. Para conectarla a FamilyControls /
DeviceActivityMonitor hace falta un módulo nativo, una development build (`npx expo run:ios`) y el
entitlement de Family Controls. En Expo Go solo funciona el mock.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npm test                 # tests unitarios (motor del juego, fechas, idiomas…)
npx expo-doctor
```

Prueba de humo en la web (la misma que corre el CI): recorre 21 pantallas en los 5 idiomas y el onboarding completo.

```bash
EXPO_PUBLIC_API_URL=http://localhost:9 npx expo export --platform web
npm i --no-save playwright && npx playwright install chromium
npm run smoke
```
