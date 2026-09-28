import { parseDateKey } from '@/game/clock';
import { friendById, itemById } from '@/game/catalog';
import { destinationById } from '@/game/destinations';
import type { GameApi, WeekDay } from '@/game/store';
import type { CatalogEntry, Destination } from '@/game/types';
import { EVOLUTION } from '@/lumi/data';
import { LUMI_STATES, type LumiState } from '@/lumi/states';

/** Lo que cuenta la tarjeta del resumen semanal (lunes a domingo de esta semana). */
export type WeekSummary = {
  lumiName: string;
  /** "22–28 sept". */
  range: string;
  /** Días de esta semana con expedición (0-7). */
  shone: number;
  /** Lumi en el ánimo de la semana (nunca apagadita). */
  mood: LumiState;
  week: WeekDay[];
  /** Lugares visitados esta semana, sin repetir, en orden. */
  places: Destination[];
  treasure: Treasure;
  /** Frase de Lumi, en primera persona. */
  line: string;
  streak: number;
};

export type Treasure =
  { kind: 'friend' | 'item'; entry: CatalogEntry; isNew: boolean } | { kind: 'stage'; name: string; orb: string };

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

/** "22–28 sept" o "29 sept – 5 oct". */
export function shortRange(from: string, to: string): string {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}–${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`
    : `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`;
}

export function buildWeekSummary(game: GameApi, lumiName: string): WeekSummary {
  const { week } = game;
  const monday = week[0]?.date ?? game.today;
  const sunday = week[week.length - 1]?.date ?? game.today;
  const inWeek = (date: string) => date >= monday && date <= sunday;
  const days = game.history.filter((d) => inWeek(d.date));
  const trips = days.filter((d) => d.expedition);
  const shone = trips.length;

  // Primera vez que apareció cada objeto y cada amigo, para saber qué es nuevo esta semana.
  const firstItem = new Map<string, string>();
  const firstFriend = new Map<string, string>();
  for (const day of game.history) {
    const e = day.expedition;
    if (!e) continue;
    for (const id of e.itemIds) if (!firstItem.has(id)) firstItem.set(id, day.date);
    if (e.friendId && !firstFriend.has(e.friendId)) firstFriend.set(e.friendId, day.date);
  }

  const places: Destination[] = [];
  for (const day of trips) {
    const d = destinationById(day.expedition!.destinationId);
    if (d && !places.includes(d)) places.push(d);
  }

  const treasure = pickTreasure(trips, firstItem, firstFriend, game.evolution.stage);

  // Días ya cerrados en los que no salió ni descansó.
  const dimDays = days.filter((d) => d.closed && !d.expedition && !d.restDay).length;
  const mood =
    shone >= 5
      ? LUMI_STATES.radiante
      : shone >= 3 || (shone > 0 && dimDays === 0)
        ? LUMI_STATES.contenta
        : LUMI_STATES.cansada;

  const rested = days.some((d) => d.restDay);
  const newFriend = treasure.kind === 'friend' && treasure.isNew ? treasure.entry : null;
  const line =
    shone >= 5
      ? 'Esta semana he visto más estrellas que pantallas ✨'
      : newFriend
        ? `Tengo una amistad nueva: ${newFriend.name}. ¡Ya os presentaré! 🌿`
        : places.length >= 3
          ? `He conocido ${places.length} sitios y me he traído un recuerdo de cada uno 🗺️`
          : rested && shone >= 2
            ? 'Brillar también es saber descansar. Qué semana más bonita 🌙'
            : shone >= 3
              ? 'Cada rato sin móvil ha sido una aventura para mí 🌿'
              : shone >= 1
                ? 'Poquito a poco se llega lejísimos. ¡Seguimos! 🌱'
                : 'Tengo la mochila lista para salir a explorar ✨';

  return {
    lumiName,
    range: shortRange(monday, sunday),
    shone,
    mood,
    week,
    places,
    treasure,
    line,
    streak: game.streak,
  };
}

function pickTreasure(
  trips: GameApi['history'],
  firstItem: Map<string, string>,
  firstFriend: Map<string, string>,
  stage: number,
): Treasure {
  const latestFirst = [...trips].reverse();
  // 1) Un amigo nuevo; 2) un objeto nuevo; 3) un amigo o un objeto de esta semana.
  for (const day of latestFirst) {
    const id = day.expedition!.friendId;
    const entry = id ? friendById(id) : undefined;
    if (entry && firstFriend.get(entry.id) === day.date) return { kind: 'friend', entry, isNew: true };
  }
  for (const day of latestFirst) {
    for (const id of day.expedition!.itemIds) {
      const entry = itemById(id);
      if (entry && firstItem.get(id) === day.date) return { kind: 'item', entry, isNew: true };
    }
  }
  for (const day of latestFirst) {
    const e = day.expedition!;
    const friend = e.friendId ? friendById(e.friendId) : undefined;
    if (friend) return { kind: 'friend', entry: friend, isNew: false };
    const item = e.itemIds.map(itemById).find(Boolean);
    if (item) return { kind: 'item', entry: item, isNew: false };
  }
  const s = EVOLUTION.stages[Math.min(stage, EVOLUTION.stages.length - 1)];
  return { kind: 'stage', name: s.name, orb: s.orb };
}
