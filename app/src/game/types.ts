/**
 * Contrato compartido del ciclo diario (destinos, recompensas, estado del juego).
 * Lo usan el motor (`game/store.tsx`), el contenido (`game/destinations.ts`,
 * `game/catalog.ts`, `game/rewards.ts`) y las notificaciones.
 */
import type { Threshold } from '@/lumi/states';

/** Fecha local 'YYYY-MM-DD'. */
export type DateKey = string;

export type Destination = {
  id: string;
  name: string;
  /** Con artículo: "el Bosque de Musgo" (en chino e hindi, solo el nombre). */
  the: string;
  /** De procedencia: "del Bosque de Musgo" (en hindi, la forma que va antes de "से"). */
  from: string;
  /** Degradado CSS (`experimental_backgroundImage`) de la miniatura y la postal. */
  art: string;
  chapter: number;
  chapterTitle: string;
  /** Pie corto de la postal. */
  caption: string;
  /** Frase para releer la postal en el álbum. */
  quote: string;
  /** Fragmentos de historia en la voz de Lumi (se elige uno por expedición). */
  stories: string[];
  /** Solo con Lumi Plus. */
  plus: boolean;
  /** Días brillantes acumulados que hacen falta para que Lumi pueda ir. */
  unlockAfterBrightDays: number;
  /** Ids de `ITEM_CATALOG` / `FRIEND_CATALOG` que se pueden encontrar aquí. */
  lootItems: string[];
  lootFriends: string[];
};

export type CatalogEntry = {
  id: string;
  name: string;
  /** Clave del dibujo en `components/collection-icon.tsx`. */
  icon: string;
  /** Con artículo indefinido, para las frases: "una seta brillante". */
  a: string;
  /** Género gramatical, para concordar ("¡Amiga nueva!"). */
  feminine: boolean;
};

export type ExpeditionResult = {
  destinationId: string;
  /** Índice en `destination.stories`. */
  storyIndex: number;
  itemIds: string[];
  friendId: string | null;
  sparks: number;
};

export type DayRecord = {
  date: DateKey;
  /** Umbral más alto alcanzado ese día (0/25/50/75/100). */
  maxThreshold: Threshold;
  /** Día de descanso usado: no rompe la racha. */
  restDay: boolean;
  /** Resultado de la expedición del día (null si Lumi se quedó en casa). */
  expedition: ExpeditionResult | null;
  /** El día ya se cerró (por la noche o al abrir la app al día siguiente). */
  closed: boolean;
};

export type AlbumEntry = {
  destinationId: string;
  date: DateKey;
  savedAt: number;
};
