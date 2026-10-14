/**
 * Textos de la postal nocturna. Lampi vuelve contenta, cuenta y nunca juzga.
 * (El texto del aviso lo escribe `notifications/`.)
 */
import { withSiteLink } from '@/constants/site';
import type { CatalogEntry, Destination } from '@/game/types';
import { tr } from '@/i18n';
import type { NightlyReturn } from '@/nightly/tonight';

/** Rachas que se celebran en la postal. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];

export const nightlyCopy = {
  header: (lumiName: string) =>
    tr({
      es: `${lumiName} ha vuelto`,
      en: `${lumiName} is back`,
      zh: `${lumiName}回来了`,
      hi: `${lumiName} लौट आई`,
      fr: `${lumiName} est rentrée`,
    }),
  rereadHeader: (d: Destination) =>
    tr({
      es: `Postal ${d.from}`,
      en: `Postcard ${d.from}`,
      zh: `来自${d.from}的明信片`,
      hi: `${d.from} से पोस्टकार्ड`,
      fr: `Carte postale ${d.from}`,
    }),
  chapter: (n: number, title?: string) => {
    const label = tr({
      es: `Capítulo ${n}`,
      en: `Chapter ${n}`,
      zh: `第${n}章`,
      hi: `अध्याय ${n}`,
      fr: `Chapitre ${n}`,
    });
    return title ? `${label} · ${title}` : label;
  },
  broughtLabel: tr({
    es: 'Te ha traído',
    en: 'She brought you',
    zh: '给你带回来了',
    hi: 'तुम्हारे लिए लाई',
    fr: 'Elle t’a rapporté',
  }),
  /** "¡Amigo nuevo!" / "¡Amiga nueva!" según la criatura. */
  newFriend: (friend: CatalogEntry) =>
    friend.feminine
      ? tr({ es: '¡Amiga nueva!', en: 'New friend!', zh: '新朋友！', hi: 'नई दोस्त!', fr: 'Nouvelle amie !' })
      : tr({ es: '¡Amigo nuevo!', en: 'New friend!', zh: '新朋友！', hi: 'नया दोस्त!', fr: 'Nouvel ami !' }),
  /** Solo en las rachas redondas; el resto de noches, nada (sin presión). */
  streakMilestone: (days: number) =>
    STREAK_MILESTONES.includes(days)
      ? tr({
          es: `${days} días seguidos brillando. ¡Qué racha más bonita!`,
          en: `${days} days shining in a row. What a lovely streak!`,
          zh: `连续发光 ${days} 天。好棒的连续记录！`,
          hi: `लगातार ${days} दिन चमक। कितना प्यारा सिलसिला!`,
          fr: `${days} jours de lumière d’affilée. Quelle jolie série !`,
        })
      : null,
  /** Chispas extra por no pedir «5 min más» de noche (ya van en el total). */
  nightBonus: (n: number) =>
    tr({
      es: `+${n} por dormir bien anoche`,
      en: `+${n} for sleeping well last night`,
      zh: `昨晚睡得好，多得 ${n} 个`,
      hi: `कल रात अच्छी नींद के लिए +${n}`,
      fr: `+${n} pour avoir bien dormi cette nuit`,
    }),
  /** Esta vuelta la ha hecho crecer a la etapa `stageName`. */
  grewUp: (lumiName: string, stageName: string) =>
    tr({
      es: `¡${lumiName} ha crecido! Nueva etapa: ${stageName}.`,
      en: `${lumiName} has grown! New stage: ${stageName}.`,
      zh: `${lumiName}长大了！新阶段：${stageName}。`,
      hi: `${lumiName} बड़ी हो गई! नया पड़ाव: ${stageName}।`,
      fr: `${lumiName} a grandi ! Nouvelle étape : ${stageName}.`,
    }),
  /**
   * Se ha conocido el último lugar del capítulo. Es el momento más grande que
   * tiene el juego —«tengo algo que no quiero perder»— y hasta ahora el capítulo
   * era solo una etiqueta en la postal.
   */
  chapterDone: (lumiName: string, chapter: number, title?: string) =>
    tr({
      es: `Fin del capítulo ${chapter}${title ? `: ${title}` : ''}. ${lumiName} ya conoce este rincón entero.`,
      en: `End of chapter ${chapter}${title ? `: ${title}` : ''}. ${lumiName} now knows this whole corner.`,
      zh: `第${chapter}章完${title ? `：${title}` : ''}。${lumiName}已经走遍了这一带。`,
      hi: `अध्याय ${chapter} पूरा${title ? `: ${title}` : ''}। ${lumiName} अब यह पूरा कोना जानती है।`,
      fr: `Fin du chapitre ${chapter}${title ? ` : ${title}` : ''}. ${lumiName} connaît maintenant tout ce coin.`,
    }),
  /**
   * La noche siguiente a un descanso. Es justo cuando se espera haber perdido la
   * racha, así que es el único sitio donde decirlo sirve de algo.
   */
  restKeptStreak: (days: number) =>
    tr({
      es: `Descansasteis ayer y la racha sigue en pie: ${days} días.`,
      en: `You rested yesterday and the streak is still going: ${days} days.`,
      zh: `昨天休息了，连续记录还在：${days} 天。`,
      hi: `कल आराम किया और सिलसिला अब भी क़ायम है: ${days} दिन।`,
      fr: `Vous avez fait une pause hier et la série tient toujours : ${days} jours.`,
    }),
  firstPostcard: tr({
    es: ' ¡Tu primera postal! La primera de muchas.',
    en: ' Your first postcard! The first of many.',
    zh: ' 你的第一张明信片！以后还会有很多。',
    hi: ' तुम्हारा पहला पोस्टकार्ड! ऐसे बहुत आएँगे।',
    fr: ' Ta première carte ! La première d’une longue série.',
  }),
  sparksUnit: tr({ es: 'chispas', en: 'sparks', zh: '火花', hi: 'चिंगारियाँ', fr: 'étincelles' }),
  skipHint: tr({
    es: 'Toca para verlo todo',
    en: 'Tap to see everything',
    zh: '轻点查看全部',
    hi: 'सब देखने के लिए टैप करो',
    fr: 'Touche pour tout voir',
  }),

  save: tr({
    es: 'Guardar en el álbum',
    en: 'Save to album',
    zh: '存进相册',
    hi: 'एल्बम में रखो',
    fr: 'Ranger dans l’album',
  }),
  saved: tr({
    es: 'Guardada. Mañana, más aventuras',
    en: 'Saved. More adventures tomorrow',
    zh: '存好了。明天还有新冒险',
    hi: 'रख लिया। कल और रोमांच',
    fr: 'Rangée. Demain, d’autres aventures',
  }),
  share: tr({ es: 'Compartir', en: 'Share', zh: '分享', hi: 'शेयर करो', fr: 'Partager' }),
  close: tr({ es: 'Cerrar', en: 'Close', zh: '关闭', hi: 'बंद करो', fr: 'Fermer' }),

  /**
   * Lo que Lampi vio de lejos: una zona de Plus contada como historia, no como
   * oferta. Sale una sola vez, nunca en las primeras postales, y se puede cerrar
   * sin tocar nada más (la postal sigue igual debajo).
   */
  glimpseLabel: tr({
    es: 'Y algo que vio de lejos',
    en: 'And something she saw from afar',
    zh: '还有她远远望见的东西',
    hi: 'और कुछ जो उसने दूर से देखा',
    fr: 'Et quelque chose qu’elle a vu de loin',
  }),
  glimpse: (lumiName: string, d: Destination) =>
    tr({
      es: `Desde allí, ${lumiName} alcanzó a ver ${d.the}. Dice que algún día le gustaría acercarse.`,
      en: `From there, ${lumiName} could just make out ${d.the}. She says she’d like to go closer some day.`,
      zh: `从那里，${lumiName}远远望见了${d.the}。她说总有一天想去看看。`,
      hi: `वहाँ से ${lumiName} को दूर ${d.the} दिखी। कहती है किसी दिन पास जाना चाहेगी।`,
      fr: `De là-bas, ${lumiName} a aperçu ${d.the}. Elle dit qu’un jour elle aimerait s’en approcher.`,
    }),
  glimpseLink: tr({
    es: 'Ver qué es Lampi Plus',
    en: 'See what Lampi Plus is',
    zh: '看看 Lampi Plus 是什么',
    hi: 'देखो Lampi Plus क्या है',
    fr: 'Voir ce qu’est Lampi Plus',
  }),
  glimpseDismiss: tr({
    es: 'Cerrar este aviso',
    en: 'Dismiss this note',
    zh: '关闭这条提示',
    hi: 'यह सूचना बंद करो',
    fr: 'Fermer cette note',
  }),

  /** Sin vuelta pendiente: aún está fuera, o hoy se ha quedado en casa. */
  stillOut: (lumiName: string, returnsAt: string) =>
    tr({
      es: `${lumiName} aún está de expedición. Vuelve a las ${returnsAt}`,
      en: `${lumiName} is still exploring. She’ll be back at ${returnsAt}`,
      zh: `${lumiName}还在探险，${returnsAt}回来`,
      hi: `${lumiName} अभी सफ़र पर है। ${returnsAt} को लौटेगी`,
      fr: `${lumiName} est encore en expédition. Elle rentre à ${returnsAt}`,
    }),
  nothingNew: (lumiName: string) =>
    tr({
      es: `Hoy no hay postal nueva. ${lumiName} te espera en casa`,
      en: `No new postcard today. ${lumiName} is waiting for you at home`,
      zh: `今天没有新明信片。${lumiName}在家等你`,
      hi: `आज कोई नया पोस्टकार्ड नहीं। ${lumiName} घर पर तुम्हारा इंतज़ार कर रही है`,
      fr: `Pas de nouvelle carte aujourd’hui. ${lumiName} t’attend à la maison`,
    }),
};

export function shareTonight(lumiName: string, result: NightlyReturn) {
  return withSiteLink(shareTonightText(lumiName, result), 'postal');
}

function shareTonightText(lumiName: string, result: NightlyReturn) {
  const first = result.keepsakes[0];
  const d = result.destination;
  const friend = result.friend?.name;
  return tr({
    es: `Mi ${lumiName} ha vuelto ${d.from}${first ? ` con ${first.a}` : ''}${friend ? ` y se ha traído a ${friend}` : ''}`,
    en: `My ${lumiName} came back ${d.from}${first ? ` with ${first.a}` : ''}${friend ? ` and brought ${friend} along` : ''}`,
    zh: `我的${lumiName}从${d.from}回来了${first ? `，带回了${first.a}` : ''}${friend ? `，还带来了${friend}` : ''}`,
    hi: `मेरी ${lumiName} ${d.from} से लौट आई${first ? `, ${first.a} लेकर` : ''}${friend ? `, और ${friend} को भी साथ लाई` : ''}`,
    fr: `Ma ${lumiName} est rentrée ${d.from}${first ? ` avec ${first.a}` : ''}${friend ? ` et elle a ramené ${friend}` : ''}`,
  });
}

export function shareReread(lumiName: string, d: Destination) {
  return withSiteLink(shareRereadText(lumiName, d), 'postal');
}

function shareRereadText(lumiName: string, d: Destination) {
  return tr({
    es: `Mi ${lumiName} me mandó una postal ${d.from}: «${d.quote}»`,
    en: `My ${lumiName} sent me a postcard ${d.from}: “${d.quote}”`,
    zh: `我的${lumiName}从${d.from}给我寄了一张明信片：“${d.quote}”`,
    hi: `मेरी ${lumiName} ने ${d.from} से मुझे पोस्टकार्ड भेजा: "${d.quote}"`,
    fr: `Ma ${lumiName} m’a envoyé une carte ${d.from} : « ${d.quote} »`,
  });
}
