import { tr } from '@/i18n';
import { dayMonth } from '@/i18n/dates';
import type { PlusPackage } from '@/purchases';

/** Textos del paywall. Lumi invita, nunca presiona. */

/** "5 de octubre", "October 5". */
export const formatDayMonth = dayMonth;

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Cuántos días antes de acabar la prueba avisamos. */
export const REMINDER_DAYS_BEFORE = 2;

export const plusFeatures = [
  {
    key: 'colors',
    symbol: 'sparkles',
    tint: '#9FE3F0',
    title: tr({
      es: 'Más especies y colores de luz',
      en: 'More species and light colors',
      zh: '更多种类和光的颜色',
      hi: 'और प्रजातियाँ और रोशनी के रंग',
      fr: 'Plus d’espèces et de couleurs de lumière',
    }),
    sub: tr({
      es: 'Nuevas criaturas y luces en aguamarina, melocotón o lavanda.',
      en: 'New creatures and lights in aquamarine, peach or lavender.',
      zh: '新的小伙伴，还有海蓝、蜜桃和薰衣草色的光。',
      hi: 'नए जीव और फ़िरोज़ी, आड़ू या लैवेंडर रंग की रोशनी।',
      fr: 'De nouvelles créatures et des lumières aigue-marine, pêche ou lavande.',
    }),
  },
  {
    key: 'zones',
    symbol: 'map.fill',
    tint: '#FFB4A2',
    title: tr({
      es: 'Zonas exclusivas y capítulos de historia',
      en: 'Exclusive places and story chapters',
      zh: '专属地点和故事章节',
      hi: 'ख़ास जगहें और कहानी के अध्याय',
      fr: 'Lieux exclusifs et chapitres d’histoire',
    }),
    sub: tr({
      es: 'Lugares nuevos que explorar y más capítulos en sus postales.',
      en: 'New places to explore and more chapters in her postcards.',
      zh: '可以探索的新地方，明信片里更多的章节。',
      hi: 'घूमने के लिए नई जगहें और उसके पोस्टकार्डों में और अध्याय।',
      fr: 'De nouveaux lieux à explorer et plus de chapitres dans ses cartes.',
    }),
  },
  {
    key: 'control',
    symbol: 'moon.stars.fill',
    tint: '#C9BFF2',
    title: tr({
      es: 'Varios horarios, bloqueo estricto y estadísticas',
      en: 'Multiple schedules, strict blocking and stats',
      zh: '多个时段、严格屏蔽和统计',
      hi: 'कई समय-सारणियाँ, सख़्त ब्लॉक और आँकड़े',
      fr: 'Plusieurs horaires, blocage strict et statistiques',
    }),
    sub: tr({
      es: 'Para afinar: horarios distintos, un escudo sin «5 min más» y tus semanas en detalle.',
      en: 'To fine-tune: different schedules, a shield without “5 more min” and your weeks in detail.',
      zh: '更精细：不同的时段、没有“再 5 分钟”的护盾，以及每周详情。',
      hi: 'बारीकी के लिए: अलग-अलग समय, बिना "5 मिनट और" वाली ढाल और तुम्हारे हफ़्तों का पूरा ब्योरा।',
      fr: 'Pour affiner : des horaires différents, un bouclier sans « 5 min de plus » et tes semaines en détail.',
    }),
  },
  {
    key: 'burrow',
    symbol: 'house.fill',
    tint: '#FFC96B',
    title: tr({
      es: 'Decoración premium para la madriguera',
      en: 'Premium decor for her burrow',
      zh: '小窝的高级装饰',
      hi: 'उसके घर के लिए ख़ास सजावट',
      fr: 'Décoration premium pour son terrier',
    }),
    sub: tr({
      es: 'Muebles y lucecitas especiales para su hogar.',
      en: 'Special furniture and little lights for her home.',
      zh: '给她家的特别家具和小灯。',
      hi: 'उसके घर के लिए ख़ास फ़र्नीचर और छोटी बत्तियाँ।',
      fr: 'Des meubles et des petites lumières spéciales pour sa maison.',
    }),
  },
] as const;

export const freeForever = tr({
  es: ['Tu Lumi y su escudo', 'El límite diario', 'Expediciones y postales', 'El widget', 'El modo noche'],
  en: ['Your Lumi and her shield', 'The daily limit', 'Expeditions and postcards', 'The widget', 'Night mode'],
  zh: ['你的 Lumi 和她的护盾', '每日上限', '探险和明信片', '小组件', '夜间模式'],
  hi: ['तुम्हारी Lumi और उसकी ढाल', 'रोज़ की सीमा', 'सफ़र और पोस्टकार्ड', 'विजेट', 'रात का मोड'],
  fr: [
    'Ta Lumi et son bouclier',
    'La limite quotidienne',
    'Expéditions et cartes postales',
    'Le widget',
    'Le mode nuit',
  ],
});

const dayN = (day: number) =>
  tr({ es: `Día ${day}`, en: `Day ${day}`, zh: `第${day}天`, hi: `दिन ${day}`, fr: `Jour ${day}` });

export const paywallCopy = {
  title: 'Lumi Plus',
  subtitle: (name: string) =>
    tr({
      es: `Para quien quiere ir un poco más lejos con ${name}.`,
      en: `For those who want to go a little further with ${name}.`,
      zh: `给想和${name}走得更远一点的你。`,
      hi: `उनके लिए जो ${name} के साथ थोड़ा और आगे जाना चाहते हैं।`,
      fr: `Pour qui veut aller un peu plus loin avec ${name}.`,
    }),
  colorsTease: tr({
    es: 'Más colores de luz',
    en: 'More light colors',
    zh: '更多光的颜色',
    hi: 'रोशनी के और रंग',
    fr: 'Plus de couleurs de lumière',
  }),
  plusSection: tr({ es: 'Con Plus', en: 'With Plus', zh: 'Plus 包含', hi: 'Plus के साथ', fr: 'Avec Plus' }),
  freeTitle: tr({
    es: 'Gratis para siempre',
    en: 'Free forever',
    zh: '永久免费',
    hi: 'हमेशा मुफ़्त',
    fr: 'Gratuit pour toujours',
  }),
  freeNote: (name: string) =>
    tr({
      es: `Lo importante no se paga: ${name} te acompaña igual.`,
      en: `The important stuff is free: ${name} stays with you either way.`,
      zh: `重要的东西不用付钱：${name}一样陪着你。`,
      hi: `ज़रूरी चीज़ों के पैसे नहीं लगते: ${name} वैसे भी तुम्हारे साथ है।`,
      fr: `L’essentiel ne se paie pas : ${name} reste avec toi quoi qu’il arrive.`,
    }),
  plansSection: tr({
    es: 'Elige tu plan',
    en: 'Choose your plan',
    zh: '选择方案',
    hi: 'अपना प्लान चुनो',
    fr: 'Choisis ton offre',
  }),
  badgeSavings: (pct: number) =>
    tr({ es: `Ahorra ${pct} %`, en: `Save ${pct}%`, zh: `省 ${pct}%`, hi: `${pct}% बचाओ`, fr: `Économise ${pct} %` }),
  badgeTrial: (days: number) =>
    tr({
      es: `${days} días gratis`,
      en: `${days} days free`,
      zh: `免费 ${days} 天`,
      hi: `${days} दिन मुफ़्त`,
      fr: `${days} jours gratuits`,
    }),
  planLine: (p: PlusPackage) =>
    p.trialDays > 0
      ? tr({
          es: `${p.trialDays} días gratis, luego ${p.price} al año`,
          en: `${p.trialDays} days free, then ${p.price} a year`,
          zh: `免费 ${p.trialDays} 天，之后每年 ${p.price}`,
          hi: `${p.trialDays} दिन मुफ़्त, फिर ${p.price} सालाना`,
          fr: `${p.trialDays} jours gratuits, puis ${p.price} par an`,
        })
      : tr({
          es: `${p.price} al mes, sin prueba gratis`,
          en: `${p.price} a month, no free trial`,
          zh: `每月 ${p.price}，无免费试用`,
          hi: `${p.price} महीना, बिना मुफ़्त ट्रायल`,
          fr: `${p.price} par mois, sans essai gratuit`,
        }),
  timelineToday: tr({ es: 'Hoy', en: 'Today', zh: '今天', hi: 'आज', fr: 'Aujourd’hui' }),
  timelineTodayText: tr({
    es: 'Todo Plus, gratis',
    en: 'All of Plus, free',
    zh: 'Plus 全部免费',
    hi: 'पूरा Plus, मुफ़्त',
    fr: 'Tout Plus, gratuit',
  }),
  timelineReminder: dayN,
  timelineReminderText: tr({
    es: 'Te avisamos',
    en: 'We remind you',
    zh: '我们提醒你',
    hi: 'हम याद दिलाएँगे',
    fr: 'On te prévient',
  }),
  timelineCharge: dayN,
  timelineChargeText: tr({
    es: 'Primer cobro',
    en: 'First charge',
    zh: '首次扣款',
    hi: 'पहला भुगतान',
    fr: 'Premier paiement',
  }),
  reminderNote: tr({
    es: `Te avisamos ${REMINDER_DAYS_BEFORE} días antes de que acabe la prueba.`,
    en: `We’ll remind you ${REMINDER_DAYS_BEFORE} days before the trial ends.`,
    zh: `试用结束前 ${REMINDER_DAYS_BEFORE} 天我们会提醒你。`,
    hi: `ट्रायल ख़त्म होने से ${REMINDER_DAYS_BEFORE} दिन पहले हम याद दिलाएँगे।`,
    fr: `On te prévient ${REMINDER_DAYS_BEFORE} jours avant la fin de l’essai.`,
  }),

  cta: (p: PlusPackage) =>
    p.trialDays > 0
      ? tr({
          es: `Empezar ${p.trialDays} días gratis`,
          en: `Start ${p.trialDays} days free`,
          zh: `开始免费试用 ${p.trialDays} 天`,
          hi: `${p.trialDays} दिन मुफ़्त शुरू करो`,
          fr: `Commencer ${p.trialDays} jours gratuits`,
        })
      : tr({
          es: `Suscribirme por ${p.price} al mes`,
          en: `Subscribe for ${p.price} a month`,
          zh: `以每月 ${p.price} 订阅`,
          hi: `${p.price} महीने में सब्सक्राइब करो`,
          fr: `M’abonner pour ${p.price} par mois`,
        }),
  ctaFallback: tr({
    es: 'Empezar 7 días gratis',
    en: 'Start 7 days free',
    zh: '开始免费试用 7 天',
    hi: '7 दिन मुफ़्त शुरू करो',
    fr: 'Commencer 7 jours gratuits',
  }),
  honest: (p: PlusPackage, now: Date) => {
    if (p.trialDays <= 0)
      return tr({
        es: `${p.price} al mes. Se renueva cada mes. Cancela cuando quieras.`,
        en: `${p.price} a month. Renews monthly. Cancel anytime.`,
        zh: `每月 ${p.price}。按月自动续订。随时可以取消。`,
        hi: `${p.price} महीना। हर महीने रिन्यू होता है। जब चाहो रद्द करो।`,
        fr: `${p.price} par mois. Renouvelé chaque mois. Annule quand tu veux.`,
      });
    const until = formatDayMonth(addDays(now, p.trialDays));
    return tr({
      es: `Gratis hasta el ${until}. Luego ${p.price} al año. Cancela cuando quieras.`,
      en: `Free until ${until}. Then ${p.price} a year. Cancel anytime.`,
      zh: `${until}前免费。之后每年 ${p.price}。随时可以取消。`,
      hi: `${until} तक मुफ़्त। फिर ${p.price} सालाना। जब चाहो रद्द करो।`,
      fr: `Gratuit jusqu’au ${until}. Puis ${p.price} par an. Annule quand tu veux.`,
    });
  },
  restore: tr({
    es: 'Restaurar compras',
    en: 'Restore purchases',
    zh: '恢复购买',
    hi: 'ख़रीदारी वापस लाओ',
    fr: 'Restaurer les achats',
  }),
  restoring: tr({
    es: 'Restaurando…',
    en: 'Restoring…',
    zh: '正在恢复……',
    hi: 'वापस ला रहे हैं…',
    fr: 'Restauration…',
  }),
  terms: tr({ es: 'Términos', en: 'Terms', zh: '条款', hi: 'शर्तें', fr: 'Conditions' }),
  privacy: tr({ es: 'Privacidad', en: 'Privacy', zh: '隐私', hi: 'गोपनीयता', fr: 'Confidentialité' }),
  noPressure: tr({
    es: 'Lumi no se pone triste si no lo pruebas.',
    en: 'Lumi won’t be sad if you don’t try it.',
    zh: '你不试，Lumi 也不会难过。',
    hi: 'अगर तुम नहीं आज़माओगे, तो Lumi उदास नहीं होगी।',
    fr: 'Lumi ne sera pas triste si tu ne l’essaies pas.',
  }),

  loadingPlans: tr({
    es: 'Buscando los planes…',
    en: 'Loading plans…',
    zh: '正在加载方案……',
    hi: 'प्लान ढूँढ रहे हैं…',
    fr: 'Chargement des offres…',
  }),
  purchaseError: tr({
    es: 'No se ha podido completar. Inténtalo otra vez cuando quieras, no hay prisa.',
    en: 'That didn’t go through. Try again whenever you like, no rush.',
    zh: '没能完成。随时再试一次，不着急。',
    hi: 'पूरा नहीं हो सका। जब चाहो फिर से कोशिश करो, कोई जल्दी नहीं।',
    fr: 'Ça n’a pas pu aboutir. Réessaie quand tu veux, rien ne presse.',
  }),
  restoreNone: tr({
    es: 'No hemos encontrado compras anteriores con esta cuenta.',
    en: 'We didn’t find any previous purchases on this account.',
    zh: '没有找到此账户之前的购买记录。',
    hi: 'इस खाते पर पिछली कोई ख़रीदारी नहीं मिली।',
    fr: 'Aucun achat précédent trouvé sur ce compte.',
  }),
  restoreError: tr({
    es: 'No hemos podido restaurar ahora. Prueba otra vez en un ratito.',
    en: 'We couldn’t restore right now. Try again in a little while.',
    zh: '现在无法恢复。请稍后再试。',
    hi: 'अभी वापस नहीं ला सके। थोड़ी देर में फिर कोशिश करो।',
    fr: 'Impossible de restaurer pour l’instant. Réessaie dans un moment.',
  }),

  successTitle: tr({
    es: '¡Te damos la bienvenida a Plus!',
    en: 'Welcome to Plus!',
    zh: '欢迎加入 Plus！',
    hi: 'Plus में तुम्हारा स्वागत है!',
    fr: 'Bienvenue dans Plus !',
  }),
  successBody: (name: string) =>
    tr({
      es: `${name} ya brilla de colores ✨`,
      en: `${name} is shining in color now ✨`,
      zh: `${name}已经闪着彩色的光了 ✨`,
      hi: `${name} अब रंग-बिरंगी चमक रही है ✨`,
      fr: `${name} brille déjà de toutes les couleurs ✨`,
    }),
  restoredTitle: tr({
    es: '¡Ya tienes Plus de vuelta!',
    en: 'Plus is back!',
    zh: 'Plus 回来了！',
    hi: 'Plus वापस आ गया!',
    fr: 'Plus est de retour !',
  }),

  ownedTitle: tr({
    es: 'Ya tienes Lumi Plus',
    en: 'You have Lumi Plus',
    zh: '你已拥有 Lumi Plus',
    hi: 'तुम्हारे पास Lumi Plus है',
    fr: 'Tu as Lumi Plus',
  }),
  ownedBody: (name: string) =>
    tr({
      es: `${name} brilla de colores. Gracias por acompañarla un poco más lejos.`,
      en: `${name} shines in color. Thanks for going a little further with her.`,
      zh: `${name}闪着彩色的光。谢谢你陪她走得更远一点。`,
      hi: `${name} रंग-बिरंगी चमकती है। उसके साथ थोड़ा और आगे चलने के लिए शुक्रिया।`,
      fr: `${name} brille de toutes les couleurs. Merci de l’accompagner un peu plus loin.`,
    }),
  close: tr({ es: 'Cerrar', en: 'Close', zh: '关闭', hi: 'बंद करो', fr: 'Fermer' }),
  closeA11y: tr({
    es: 'Cerrar Lumi Plus',
    en: 'Close Lumi Plus',
    zh: '关闭 Lumi Plus',
    hi: 'Lumi Plus बंद करो',
    fr: 'Fermer Lumi Plus',
  }),
  devRemove: 'Quitar Plus (desarrollo)',
};
