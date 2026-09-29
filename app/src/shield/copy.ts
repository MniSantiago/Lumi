import { tr } from '@/i18n';

/**
 * Textos del escudo (BRIEF.md, "La pantalla de bloqueo ES Lumi"). Fricción
 * emocional, nunca castigo: Lumi no regaña, solo recuerda que está dormida.
 */
export const shieldCopy = {
  appTag: (appName: string) =>
    tr({
      es: `${appName} está tapada hasta mañana`,
      en: `${appName} is tucked in until tomorrow`,
      zh: `${appName}盖上被子了，明天见`,
      hi: `${appName} कल तक ढकी हुई है`,
      fr: `${appName} est bordée jusqu’à demain`,
    }),
  title: (lumiName: string) =>
    tr({
      es: `${lumiName} se estaba echando la siesta… ¿de verdad entramos?`,
      en: `${lumiName} was taking a nap… are we really going in?`,
      zh: `${lumiName}正在打盹呢……真的要进去吗？`,
      hi: `${lumiName} झपकी ले रही थी… सच में अंदर जाएँ?`,
      fr: `${lumiName} faisait la sieste… on y va vraiment ?`,
    }),
  body: tr({
    es: 'Ya habéis pasado de tu hora de hoy. Si lo dejas ahora, mañana se despierta con más luz.',
    en: 'You’ve gone past today’s time. If you stop now, she’ll wake up brighter tomorrow.',
    zh: '今天的时间已经用完了。现在放下，她明天醒来会更亮。',
    hi: 'आज का समय पूरा हो चुका है। अभी छोड़ दो, तो कल वो और ज़्यादा रोशनी के साथ जागेगी।',
    fr: 'Vous avez dépassé ton temps du jour. Si tu arrêtes maintenant, elle se réveillera plus lumineuse demain.',
  }),

  leave: tr({
    es: 'Vale, lo dejo',
    en: 'Okay, I’ll stop',
    zh: '好，我放下',
    hi: 'ठीक है, छोड़ता हूँ',
    fr: 'D’accord, j’arrête',
  }),
  leaveThanks: tr({
    es: 'Gracias. Me quedo soñando contigo 💤',
    en: 'Thank you. I’ll keep dreaming of you 💤',
    zh: '谢谢你。我继续梦见你 💤',
    hi: 'शुक्रिया। मैं तुम्हारे सपने देखती रहूँगी 💤',
    fr: 'Merci. Je continue à rêver de toi 💤',
  }),

  /** `used` = veces que ya se ha pedido hoy, antes de esta. */
  snooze: (used: number) =>
    used === 0
      ? tr({ es: '5 min más', en: '5 more min', zh: '再 5 分钟', hi: '5 मिनट और', fr: '5 min de plus' })
      : tr({
          es: 'Vale… 5 min, pero te espero despierta',
          en: 'Okay… 5 min, but I’ll wait up for you',
          zh: '好吧……5 分钟，我醒着等你',
          hi: 'ठीक है… 5 मिनट, पर मैं जागकर इंतज़ार करूँगी',
          fr: 'D’accord… 5 min, mais je t’attends réveillée',
        }),
  snoozeNote: (used: number) =>
    used === 0
      ? null
      : used === 1
        ? tr({
            es: 'Hoy ya te he dado un ratito de 5 min. No pasa nada.',
            en: 'I already gave you 5 minutes today. That’s okay.',
            zh: '今天已经给过你一次 5 分钟了。没关系。',
            hi: 'आज मैं तुम्हें एक बार 5 मिनट दे चुकी हूँ। कोई बात नहीं।',
            fr: 'Je t’ai déjà donné 5 minutes aujourd’hui. Ce n’est pas grave.',
          })
        : tr({
            es: `Hoy ya van ${used} ratitos de 5 min. No pasa nada, aquí sigo.`,
            en: `That’s ${used} little 5-minute breaks today. That’s okay, I’m still here.`,
            zh: `今天已经有 ${used} 次 5 分钟了。没关系，我还在。`,
            hi: `आज ${used} बार 5-5 मिनट हो चुके हैं। कोई बात नहीं, मैं यहीं हूँ।`,
            fr: `Ça fait ${used} petites pauses de 5 min aujourd’hui. Pas grave, je suis là.`,
          }),
  /** `count` = veces que se ha pedido hoy, contando esta. */
  snoozeGranted: (count: number) =>
    count === 1
      ? tr({
          es: 'Vale, 5 minutitos. Aquí te espero 🌙',
          en: 'Okay, 5 little minutes. I’ll wait here 🌙',
          zh: '好，5 分钟。我在这儿等你 🌙',
          hi: 'ठीक है, 5 मिनट। मैं यहीं इंतज़ार करूँगी 🌙',
          fr: 'D’accord, 5 petites minutes. Je t’attends ici 🌙',
        })
      : tr({
          es: 'Otros 5, vale. Te espero despierta 🌙',
          en: 'Another 5, okay. I’ll wait up for you 🌙',
          zh: '再 5 分钟，好吧。我醒着等你 🌙',
          hi: 'और 5, ठीक है। मैं जागकर इंतज़ार करूँगी 🌙',
          fr: 'Encore 5, d’accord. Je t’attends réveillée 🌙',
        }),
};
