# Armario de Lampi — vestir a Lampi y dar uso a las chispas

Fecha: 2026-10-07 · Rama: `armario-lampi` · Origen: pendiente #5 (puntos y artículos sin uso).

## Intención

Hoy las chispas solo se suman y los 36 objetos y 12 amigos solo se coleccionan. Queremos que
sirvan para algo visible y afectivo: **vestir a Lampi** y **llevar un amigo de compañero**, y que
las chispas tengan un **sumidero** propio. Tono sereno, sin presión ni urgencia ni caducidades.
Funciona en los 5 idiomas (es/en/zh/hi/fr).

Decisiones (el usuario delegó las de diseño en la sesión del 2026-10-07):

1. **Objetos y amigos se equipan gratis.** Tenerlos en la colección basta.
2. **Las chispas compran accesorios especiales** que no salen de las postales.
3. **Forma visual:** accesorios superpuestos sobre la ilustración de Lampi en huecos fijos, más un
   amigo a su lado. Sin arte por estado ni por prenda: se reutilizan los iconos de `assets/collection`.

Fuera de alcance (YAGNI): fondos del hogar, colores de halo (el halo ya expresa la etapa de
evolución), varios conjuntos guardados, venta o intercambio, compras con dinero real.

## Modelo

### Huecos
`type Slot = 'cabeza' | 'cuello' | 'mano'`. Un hueco lleva un solo objeto. El **compañero** es un
hueco aparte que admite un amigo (`friendId`).

### Catálogo
`CatalogEntry` gana `slot?: Slot` (solo objetos) y `fit?: { scale?: number; rotate?: number }`
(ajuste fino por objeto, por defecto escala 1 y giro 0). Asignación de los 36 objetos:

- **cabeza (10):** trebol, seta, bellota, pluma, hoja, flor-luna, trocito-luna, nenufar, pina, polvo-estrella
- **cuello (9):** bufanda, moneda, llave, boton, concha, campanilla, cristal, geoda, reloj
- **mano (17):** farolillo, catalejo, mapa, carta, taza, vela, fresa, galleta, barquito, gota,
  burbuja, engranaje, piedra, semilla, canica, calcetin, ovillo

### Accesorios especiales (chispas)
Nuevo `game/wardrobe.ts` con `SPECIAL_ACCESSORIES`: 8 piezas, cada una con `id`, `slot`, `price`,
`icon` (arte propio generado con APIMart) y textos en 5 idiomas.

| id | hueco | precio |
|----|-------|--------|
| gorro-dormir | cabeza | 50 |
| antifaz-estrellas | cabeza | 70 |
| corona-luz | cabeza | 150 |
| lazo-luna | cuello | 60 |
| capa-estrellas | cuello | 120 |
| varita-luz | mano | 80 |
| paraguas-nube | mano | 90 |
| linterna-dorada | mano | 110 |

Total 730 chispas ≈ 2 meses jugando cada noche (una postal da 10–24; más el bonus de dormir bien).
Los precios viven en una sola tabla para reajustarlos.

### Estado guardado (`GameState`, sigue en `version: 1`)
Campos nuevos con valor por defecto en `EMPTY_STATE`; `toGameState` ya fusiona con `EMPTY_STATE`,
así que las partidas existentes cargan sin migración.

```ts
outfit: { cabeza?: string; cuello?: string; mano?: string; companion?: string };
unlocked: string[];  // ids de accesorios especiales comprados
spent: number;       // chispas gastadas
```

`sparks` sigue siendo el **total ganado** (Progreso lo muestra como logro). El saldo es
`sparks - spent`, expuesto como `balance` en `useGame()`. El chip del Hogar y la hoja de chispas
enseñan el saldo.

### Reglas (funciones puras en `engine.ts`/`wardrobe.ts`, con tests)
- `equip(state, slot, id)`: solo si el id existe, es del hueco y está en `items` o `unlocked`.
  Poner el mismo id otra vez no hace nada. `unequip(state, slot)`.
- `setCompanion(state, friendId | null)`: solo si está en `friends`.
- `buy(state, id)`: el accesorio existe, no está comprado y `balance >= price`; suma a `unlocked`
  y a `spent`. Nunca deja saldo negativo.
- Saneado al cargar/restaurar: se descarta del `outfit` lo que ya no exista o no se posea.

## Interfaz

- **Ruta `src/app/armario.tsx`** (hoja `Sheet`, como `chispas.tsx`). Arriba, Lampi en vivo con lo
  puesto. Debajo, pestañas **Cabeza / Cuello / Mano / Amigo**: cuadrícula con los objetos
  poseídos de ese hueco (más los especiales comprados) y «Quitar». Los especiales sin comprar salen
  al final con su precio y el botón «Conseguir»; sin saldo, el botón queda desactivado con el
  texto de lo que falta. Equipar y comprar dan el háptico y sonido suaves ya existentes.
- **Accesos:** botón «Armario» junto a Lampi en el Hogar (con `TourTarget` y un paso nuevo en el
  tour del Hogar) y botón «Ponérselo» en `CollectionDetail` (objetos y amigos poseídos).
- Lampi vestida se ve en el Hogar, la postal nocturna y el armario (donde use `LumiAvatar`).

### Dibujo: `Outfit` dentro de `LumiAvatar`
`RIG` de cada estado gana `anchors: { cabeza, cuello, mano }` (fracciones de ancho y alto de la
ilustración, como `orbs`). Un componente `<Outfit>` pinta cada icono con `CollectionIcon`
en su ancla, **dentro del contenedor animado del cuerpo**, así flota, respira y salta con Lampi.
Escala base 0.26 del tamaño de Lampi (cabeza/mano) y 0.22 (cuello), multiplicada por `fit.scale`.
El **compañero** va abajo a la derecha, escala 0.34, con un balanceo propio suave, fuera del
contenedor del cuerpo. Con «reducir movimiento» no se anima.
Hay un prop `outfit` (por defecto, el del juego) para poder previsualizar y para tests.
Estado `apagadita` (dormida): lleva puesto lo mismo, sin gestos.

## Arte (APIMart)
- 8 accesorios especiales en una hoja 3×3 con `tools/apimart_generate.py` y recorte con
  `tools/slice_sheets.py`, mismo estilo que el resto de la colección. Salida en
  `assets/collection/<id>.webp` y registro en `CollectionIcon`.
- Anclas y `fit`: se afinan con un script de previsualización (PIL) que compone cada objeto sobre
  los 4 PNG de Lampi antes de tocar la app.

## Textos
Todo con `tr({ es, en, zh, hi, fr })`. Los nombres de los accesorios van en un `content` por idioma
junto a los de objetos y amigos.

## Pruebas
Jest (ya hay `src/game/__tests__`): `equip`/`unequip`/`setCompanion`/`buy`/saneado, carga de un estado
antiguo sin los campos nuevos, que cada objeto del catálogo tenga `slot`, y que los precios sean
positivos y los ids únicos. Comprobación manual en simulador de los 4 estados con piezas puestas.
Antes de dar nada por hecho: `npx tsc --noEmit`, `npx expo lint` y los tests.

## Riesgos
- Se ven como pegatinas: se mitiga con `fit` por objeto y revisando cada uno sobre los 4 estados.
- El PNG de `radiante` tiene los brazos en alto: `mano` va en el brazo izquierdo; se verifica.
- `account/sync` guarda el estado entero: los campos nuevos viajan con él sin cambios de backend.
