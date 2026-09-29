import { parseDateKey } from '@/game/clock';
import { friendById, itemById } from '@/game/catalog';
import { destinationById } from '@/game/destinations';
import type { GameApi, WeekDay } from '@/game/store';
import type { CatalogEntry, Destination } from '@/game/types';
import { lang, tr } from '@/i18n';
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
  | { kind: 'friend' | 'item'; entry: CatalogEntry; isNew: boolean }
  | { kind: 'stage'; name: string; orb: string };

const MONTHS_SHORT = tr({
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
});

const day = (d: Date) =>
  lang === 'zh'
    ? `${MONTHS_SHORT[d.getMonth()]}${d.getDate()}日`
    : lang === 'en'
      ? `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`
      : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

/** "28 sept", "Sep 28", "9月28日". */
export const shortDay = (key: string) => day(parseDateKey(key));

/** "22–28 sept" o "29 sept – 5 oct". */
export function shortRange(from: string, to: string): string {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  if (a.getMonth() !== b.getMonth()) return `${day(a)} – ${day(b)}`;
  if (lang === 'zh') return `${MONTHS_SHORT[b.getMonth()]}${a.getDate()}–${b.getDate()}日`;
  if (lang === 'en') return `${MONTHS_SHORT[b.getMonth()]} ${a.getDate()}–${b.getDate()}`;
  return `${a.getDate()}–${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`;
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
      ? tr({
          es: 'Esta semana he visto más estrellas que pantallas ✨',
          en: 'This week I saw more stars than screens ✨',
          zh: '这周我看到的星星比屏幕还多 ✨',
          hi: 'इस हफ़्ते मैंने स्क्रीन से ज़्यादा तारे देखे ✨',
          fr: 'Cette semaine, j’ai vu plus d’étoiles que d’écrans ✨',
        })
      : newFriend
        ? tr({
            es: `Tengo una amistad nueva: ${newFriend.name}. ¡Ya os presentaré! 🌿`,
            en: `I made a new friend: ${newFriend.name}. I’ll introduce you soon! 🌿`,
            zh: `我交了一个新朋友：${newFriend.name}。以后介绍给你认识！🌿`,
            hi: `मेरी एक नई दोस्ती हुई: ${newFriend.name}। जल्द मिलवाऊँगी! 🌿`,
            fr: `Je me suis fait un nouvel ami : ${newFriend.name}. Je vous présenterai ! 🌿`,
          })
        : places.length >= 3
          ? tr({
              es: `He conocido ${places.length} sitios y me he traído un recuerdo de cada uno 🗺️`,
              en: `I visited ${places.length} places and brought back a keepsake from each 🗺️`,
              zh: `我去了 ${places.length} 个地方，每个地方都带回了纪念品 🗺️`,
              hi: `मैं ${places.length} जगहों पर गई और हर एक से एक याद लाई 🗺️`,
              fr: `J’ai découvert ${places.length} endroits et j’ai rapporté un souvenir de chacun 🗺️`,
            })
          : rested && shone >= 2
            ? tr({
                es: 'Brillar también es saber descansar. Qué semana más bonita 🌙',
                en: 'Shining is also knowing how to rest. What a lovely week 🌙',
                zh: '会休息也是一种发光。多美好的一周 🌙',
                hi: 'चमकना आराम करना जानना भी है। कितना प्यारा हफ़्ता था 🌙',
                fr: 'Briller, c’est aussi savoir se reposer. Quelle jolie semaine 🌙',
              })
            : shone >= 3
              ? tr({
                  es: 'Cada rato sin móvil ha sido una aventura para mí 🌿',
                  en: 'Every moment without the phone was an adventure for me 🌿',
                  zh: '每一段不看手机的时间，对我来说都是一场冒险 🌿',
                  hi: 'फ़ोन के बिना हर पल मेरे लिए एक रोमांच था 🌿',
                  fr: 'Chaque moment sans téléphone a été une aventure pour moi 🌿',
                })
              : shone >= 1
                ? tr({
                    es: 'Poquito a poco se llega lejísimos. ¡Seguimos! 🌱',
                    en: 'Little by little, you get really far. Let’s keep going! 🌱',
                    zh: '一点一点，就能走得很远。继续加油！🌱',
                    hi: 'धीरे-धीरे बहुत दूर पहुँचते हैं। चलते रहें! 🌱',
                    fr: 'Petit à petit, on va très loin. On continue ! 🌱',
                  })
                : tr({
                    es: 'Tengo la mochila lista para salir a explorar ✨',
                    en: 'My backpack is ready to go exploring ✨',
                    zh: '我的背包已经准备好去探险了 ✨',
                    hi: 'मेरा बस्ता घूमने के लिए तैयार है ✨',
                    fr: 'Mon sac est prêt pour partir explorer ✨',
                  });

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
