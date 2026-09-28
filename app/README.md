# Lumi: app (Expo)

App de iOS de Lumi con Expo SDK 57, Expo Router (pestañas nativas) y TypeScript.

## Arrancar

```bash
cd app
npm install
npx expo start        # pulsa i para el simulador de iOS, o escanea el QR con Expo Go
```

En desarrollo, el hogar muestra **Simular uso** (0/25/50/75/100 %) para ver los 4 estados de Lumi.

## Probar sin el Mac (EAS Update)

La versión publicada en el canal `preview` se abre en Expo Go (SDK 57) escaneando `../qr-preview-expo-go.png` con la cámara del iPhone, o con:

```
exp://u.expo.dev/6244480e-5eaa-4ca9-bce9-a3ce408b7116?channel-name=preview&runtime-version=1.0.0
```

Para publicar una nueva versión: `npm run update:preview -- --message "qué cambia"`.
Las publicaciones aparecen en https://expo.dev/accounts/mnisantiago/projects/lumi/updates

## Estructura

| Ruta | Qué es |
|---|---|
| `src/app/` | Pantallas (una por pestaña): `index` (Hogar), `expediciones`, `coleccion`, `progreso`, `ajustes` |
| `src/constants/theme.ts` | Colores, tipografías y espaciado (salen de Lumi, ver `PROCESO.md`) |
| `src/lumi/states.ts` | Los 4 estados de Lumi y su relación con los umbrales de uso |
| `src/lumi/store.tsx` | Estado global: umbral actual y ajustes (guardados en AsyncStorage) |
| `src/lumi/data.ts` | Contenido de ejemplo: zonas, postales, objetos, semana |
| `src/screen-time/` | Fuente de uso de pantalla. Hoy es un mock; mañana, el módulo nativo |
| `src/components/` | Lumi animada, luciérnagas, medidor de luz y piezas de UI |
| `assets/lumi/` | Lumi en sus 4 estados, recortada (`python3 tools/cutout_states.py` desde la raíz) |

## Screen Time real

La app solo depende de la interfaz `ScreenTimeSource` (`src/screen-time/index.ts`), que trabaja con
**umbrales** porque iOS no deja leer los minutos exactos. Para conectarla a FamilyControls /
DeviceActivityMonitor hace falta un módulo nativo, una development build (`npx expo run:ios`) y el
entitlement de Family Controls. En Expo Go solo funciona el mock.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```
