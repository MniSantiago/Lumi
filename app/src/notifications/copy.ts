/**
 * Textos de los avisos locales. Lumi escribe como una amiga: cuenta, invita
 * y nunca reprocha. Nada de "¡No te lo pierdas!" ni prisas.
 */
import type { Destination } from '@/game/types';
import { tr } from '@/i18n';

/** Cuerpos de la vuelta nocturna; se elige uno según el día. */
const NIGHTLY_BODIES = tr({
  es: [
    'Trae una postal y los bolsillos llenos. Te espera despierta para enseñártelo.',
    'Viene con los mofletes fríos y una historia nueva. Cuando quieras, te la cuenta.',
    'Ha guardado algo para ti en el fondo del bolsillo. Sin prisa, te espera.',
    'Ya está en casa, envuelta en su mantita, con una postal recién escrita para ti.',
  ],
  en: [
    'She brings a postcard and full pockets. She’s staying up to show you.',
    'She’s back with cold cheeks and a new story. She’ll tell you whenever you like.',
    'She saved something for you at the bottom of her pocket. No rush, she’ll wait.',
    'She’s home, wrapped in her little blanket, with a freshly written postcard for you.',
  ],
  zh: [
    '她带回了一张明信片，口袋装得满满的。她醒着等你，想给你看看。',
    '她脸蛋冻得凉凉的，带回了一个新故事。你想听的时候，她就讲给你听。',
    '她在口袋最底下给你留了一样东西。不着急，她等你。',
    '她已经到家了，裹着小毯子，还有一张刚写好的明信片给你。',
  ],
  hi: [
    'वो एक पोस्टकार्ड और भरी जेबें लाई है। तुम्हें दिखाने के लिए जागकर इंतज़ार कर रही है।',
    'ठंडे गालों और एक नई कहानी के साथ लौटी है। जब चाहो, सुना देगी।',
    'उसने जेब में सबसे नीचे तुम्हारे लिए कुछ रखा है। कोई जल्दी नहीं, वो इंतज़ार करेगी।',
    'वो घर आ गई है, अपने छोटे कंबल में लिपटी, तुम्हारे लिए ताज़ा लिखा पोस्टकार्ड लेकर।',
  ],
  fr: [
    'Elle rapporte une carte postale et des poches pleines. Elle t’attend pour te montrer.',
    'Elle rentre les joues froides avec une nouvelle histoire. Elle te la raconte quand tu veux.',
    'Elle t’a gardé quelque chose au fond de sa poche. Rien ne presse, elle t’attend.',
    'Elle est à la maison, emmitouflée dans sa petite couverture, avec une carte tout juste écrite pour toi.',
  ],
});

/** Índice estable para un día local: la misma fecha siempre da el mismo texto. */
function dayIndex(at: Date, n: number) {
  const key = at.getFullYear() * 372 + at.getMonth() * 31 + at.getDate();
  return key % n;
}

export function nightlyReturnContent(lumiName: string, destination: Pick<Destination, 'from'>, at: Date) {
  const from = destination.from;
  return {
    title: tr({
      es: `${lumiName} ha vuelto ${from} 🌙`,
      en: `${lumiName} is back ${from} 🌙`,
      zh: `${lumiName}从${from}回来了 🌙`,
      hi: `${lumiName} ${from} से लौट आई 🌙`,
      fr: `${lumiName} est rentrée ${from} 🌙`,
    }),
    body: NIGHTLY_BODIES[dayIndex(at, NIGHTLY_BODIES.length)],
  };
}

export function weeklySummaryContent(lumiName: string) {
  return {
    title: tr({
      es: `Tu semana con ${lumiName} ✨`,
      en: `Your week with ${lumiName} ✨`,
      zh: `你和${lumiName}的一周 ✨`,
      hi: `${lumiName} के साथ तुम्हारा हफ़्ता ✨`,
      fr: `Ta semaine avec ${lumiName} ✨`,
    }),
    body: tr({
      es: 'Ya está listo tu resumen: lo que ha brillado y las postales que ha traído. Por si te apetece compartirlo.',
      en: 'Your summary is ready: how much she shone and the postcards she brought. In case you feel like sharing it.',
      zh: '你的每周总结好了：她亮了多少、带回了哪些明信片。想分享的话随时可以。',
      hi: 'तुम्हारा सारांश तैयार है: वो कितना चमकी और कौन-से पोस्टकार्ड लाई। मन हो तो शेयर कर सकते हो।',
      fr: 'Ton bilan est prêt : combien elle a brillé et les cartes qu’elle a rapportées. Si tu as envie de le partager.',
    }),
  };
}

export function trialReminderContent(lumiName: string) {
  return {
    title: tr({
      es: 'Tu prueba de Lumi Plus acaba en 2 días',
      en: 'Your Lumi Plus trial ends in 2 days',
      zh: '你的 Lumi Plus 试用还有 2 天结束',
      hi: 'तुम्हारा Lumi Plus ट्रायल 2 दिन में ख़त्म होगा',
      fr: 'Ton essai Lumi Plus se termine dans 2 jours',
    }),
    body: tr({
      es: `Si no quieres seguir, puedes cancelarla en Ajustes de iOS. ${lumiName} te quiere igual ✨`,
      en: `If you don’t want to continue, you can cancel it in iOS Settings. ${lumiName} loves you just the same ✨`,
      zh: `如果不想继续，可以在 iOS 设置里取消。${lumiName}一样爱你 ✨`,
      hi: `अगर आगे नहीं जारी रखना, तो iOS सेटिंग्स में रद्द कर सकते हो। ${lumiName} तुम्हें फिर भी उतना ही प्यार करती है ✨`,
      fr: `Si tu ne veux pas continuer, tu peux l’annuler dans les Réglages d’iOS. ${lumiName} t’aime tout pareil ✨`,
    }),
  };
}

/** Alerta amable cuando iOS no deja mandar avisos. */
export const permissionDeniedCopy = {
  title: tr({
    es: 'Los avisos están desactivados',
    en: 'Notifications are turned off',
    zh: '通知已关闭',
    hi: 'सूचनाएँ बंद हैं',
    fr: 'Les notifications sont désactivées',
  }),
  body: (lumiName: string) =>
    tr({
      es: `Para que ${lumiName} te avise al volver de su viaje, activa las notificaciones de Lumi en Ajustes de iOS. Si prefieres no hacerlo, no pasa nada: la postal te esperará igual al abrir la app.`,
      en: `So ${lumiName} can let you know when she’s back from her trip, turn on Lumi’s notifications in iOS Settings. If you’d rather not, that’s fine: the postcard will be waiting when you open the app.`,
      zh: `想让${lumiName}旅行回来时告诉你，请在 iOS 设置里打开 Lumi 的通知。不想打开也没关系：打开 App 时明信片一样在等你。`,
      hi: `ताकि ${lumiName} सफ़र से लौटकर तुम्हें बता सके, iOS सेटिंग्स में Lumi की सूचनाएँ चालू करो। न करना चाहो तो कोई बात नहीं: ऐप खोलने पर पोस्टकार्ड तुम्हारा इंतज़ार करेगा।`,
      fr: `Pour que ${lumiName} te prévienne à son retour de voyage, active les notifications de Lumi dans les Réglages d’iOS. Sinon, pas de souci : la carte t’attendra quand tu ouvriras l’app.`,
    }),
  openSettings: tr({
    es: 'Abrir Ajustes',
    en: 'Open Settings',
    zh: '打开设置',
    hi: 'सेटिंग्स खोलो',
    fr: 'Ouvrir les Réglages',
  }),
  notNow: tr({ es: 'Ahora no', en: 'Not now', zh: '以后再说', hi: 'अभी नहीं', fr: 'Pas maintenant' }),
};
