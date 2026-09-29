import type { ImageSourcePropType } from 'react-native';

import { tr } from '@/i18n';

/**
 * iOS no deja leer los minutos exactos de Screen Time: solo avisa cuando se
 * cruza un umbral (`DeviceActivityMonitor`). Por eso todo el estado de Lumi se
 * deriva del último umbral alcanzado, no de un contador de minutos.
 */
export type Threshold = 0 | 25 | 50 | 75 | 100;
export const THRESHOLDS: readonly Threshold[] = [0, 25, 50, 75, 100];

export type LumiStateKey = 'radiante' | 'contenta' | 'cansada' | 'apagadita';

export type LumiState = {
  key: LumiStateKey;
  label: string;
  /** Tramos encendidos del medidor "Luz de hoy" (de 4). */
  lit: 1 | 2 | 3 | 4;
  /** Intensidad del halo y de las luciérnagas, 0-1. */
  glow: number;
  /** Cuánto se oscurece el mundo, 0-1 ("tu atención es luz"). */
  dim: number;
  /** Mientras está por encima del 50 %, sale de expedición. */
  exploring: boolean;
  image: ImageSourcePropType;
  bubble: string;
  /** Lo que dice al tocarla, por turnos. Siempre con cariño, nunca riñe. */
  chatter: string[];
};

export const LUMI_STATES: Record<LumiStateKey, LumiState> = {
  radiante: {
    key: 'radiante',
    label: tr({ es: 'Radiante', en: 'Radiant', zh: '闪闪发光', hi: 'जगमग', fr: 'Radieuse' }),
    lit: 4,
    glow: 1,
    dim: 0,
    exploring: true,
    image: require('@/assets/lumi/radiante.png'),
    bubble: tr({
      es: '¡Hoy brillo muchísimo! Me voy de viaje, te traigo algo bonito.',
      en: 'I’m shining so bright today! I’m off on a trip, I’ll bring you something nice.',
      zh: '我今天好亮好亮！我去旅行啦，给你带点好东西回来。',
      hi: 'आज मैं ख़ूब चमक रही हूँ! सफ़र पर जा रही हूँ, तुम्हारे लिए कुछ प्यारा लाऊँगी।',
      fr: 'Je brille énormément aujourd’hui ! Je pars en voyage, je te rapporte un joli souvenir.',
    }),
    chatter: tr({
      es: [
        '¡Jiji! Me haces cosquillas en la luz.',
        '¿Sabes? Hoy el mundo se ve más bonito desde aquí.',
        'Te guardo un sitio en la postal de esta noche.',
        '¡Mira cómo brillo! Es gracias a ti.',
      ],
      en: [
        'Hehe! You’re tickling my light.',
        'You know what? The world looks prettier from here today.',
        'I’m saving you a spot on tonight’s postcard.',
        'Look how I shine! It’s thanks to you.',
      ],
      zh: [
        '嘻嘻！你挠到我的光了。',
        '你知道吗？今天从这里看，世界更漂亮了。',
        '今晚的明信片上给你留个位置。',
        '看我多亮！都是因为你。',
      ],
      hi: [
        'हीही! तुम मेरी रोशनी में गुदगुदी कर रहे हो।',
        'पता है? आज यहाँ से दुनिया और सुंदर दिखती है।',
        'आज रात के पोस्टकार्ड में तुम्हारे लिए जगह रखूँगी।',
        'देखो मैं कैसे चमक रही हूँ! ये तुम्हारी वजह से है।',
      ],
      fr: [
        'Hihi ! Tu chatouilles ma lumière.',
        'Tu sais quoi ? Aujourd’hui, le monde est plus joli d’ici.',
        'Je te garde une place sur la carte de ce soir.',
        'Regarde comme je brille ! C’est grâce à toi.',
      ],
    }),
  },
  contenta: {
    key: 'contenta',
    label: tr({ es: 'Contenta', en: 'Happy', zh: '开心', hi: 'ख़ुश', fr: 'Contente' }),
    lit: 3,
    glow: 0.75,
    dim: 0.08,
    exploring: true,
    image: require('@/assets/lumi/contenta.png'),
    bubble: tr({
      es: 'Hoy vamos bien. Si aguantas un ratito más, esta noche te traigo una postal.',
      en: 'We’re doing well today. Hold on a little longer and I’ll bring you a postcard tonight.',
      zh: '今天挺好的。再坚持一小会儿，今晚我给你带张明信片。',
      hi: 'आज हम अच्छा कर रहे हैं। थोड़ी देर और रुको, तो आज रात तुम्हारे लिए पोस्टकार्ड लाऊँगी।',
      fr: 'Ça se passe bien aujourd’hui. Tiens encore un peu et je te rapporte une carte ce soir.',
    }),
    chatter: tr({
      es: [
        'Voy tarareando por el camino. ¿Me oyes?',
        'Un ratito más sin scroll y llego lejísimos.',
        'Me gusta cuando me saludas.',
        'Hoy huele a musgo y a aventura.',
      ],
      en: [
        'I’m humming along the way. Can you hear me?',
        'A little longer without scrolling and I’ll get so far.',
        'I like it when you say hi.',
        'Today smells like moss and adventure.',
      ],
      zh: [
        '我一边走一边哼歌。你听到了吗？',
        '再少刷一会儿，我就能走得好远好远。',
        '我喜欢你跟我打招呼。',
        '今天闻起来有苔藓和冒险的味道。',
      ],
      hi: [
        'मैं रास्ते भर गुनगुना रही हूँ। सुन रहे हो?',
        'थोड़ी देर और बिना स्क्रॉल के, और मैं बहुत दूर पहुँच जाऊँगी।',
        'मुझे अच्छा लगता है जब तुम मुझे हाय कहते हो।',
        'आज काई और रोमांच की ख़ुशबू आ रही है।',
      ],
      fr: [
        'Je fredonne en chemin. Tu m’entends ?',
        'Encore un peu sans scroll et j’irai super loin.',
        'J’aime bien quand tu me dis coucou.',
        'Aujourd’hui, ça sent la mousse et l’aventure.',
      ],
    }),
  },
  cansada: {
    key: 'cansada',
    label: tr({ es: 'Cansada', en: 'Tired', zh: '有点累', hi: 'थकी हुई', fr: 'Fatiguée' }),
    lit: 2,
    glow: 0.42,
    dim: 0.22,
    exploring: false,
    image: require('@/assets/lumi/cansada.png'),
    bubble: tr({
      es: 'Uff, se me está gastando la luz… ¿dejamos el móvil un rato y miramos las estrellas?',
      en: 'Phew, my light is running low… shall we put the phone down and look at the stars?',
      zh: '唉，我的光快用完了……我们放下手机，看一会儿星星好不好？',
      hi: 'उफ़, मेरी रोशनी कम हो रही है… थोड़ी देर फ़ोन रखकर तारे देखें?',
      fr: 'Ouf, ma lumière s’épuise… on pose le téléphone et on regarde les étoiles ?',
    }),
    chatter: tr({
      es: [
        'Uaaah… perdona, se me escapó un bostezo.',
        '¿Y si miramos por la ventana un ratito?',
        'Me recargo mejor cuando el móvil descansa.',
        'Con un poquito de calma vuelvo a brillar.',
      ],
      en: [
        'Yaaawn… sorry, a yawn slipped out.',
        'How about we look out the window for a bit?',
        'I recharge better when the phone rests.',
        'With a little calm, I’ll shine again.',
      ],
      zh: [
        '哈啊……不好意思，打了个哈欠。',
        '我们看一会儿窗外好不好？',
        '手机休息的时候，我充电更快。',
        '安静一会儿，我就又亮起来了。',
      ],
      hi: [
        'उआँह… माफ़ करना, जम्हाई निकल गई।',
        'क्यों न थोड़ी देर खिड़की से बाहर देखें?',
        'जब फ़ोन आराम करता है, मैं बेहतर चार्ज होती हूँ।',
        'थोड़े सुकून से मैं फिर चमकने लगूँगी।',
      ],
      fr: [
        'Aaaah… pardon, un bâillement m’a échappé.',
        'Et si on regardait par la fenêtre un moment ?',
        'Je me recharge mieux quand le téléphone se repose.',
        'Avec un peu de calme, je brillerai de nouveau.',
      ],
    }),
  },
  apagadita: {
    key: 'apagadita',
    label: tr({ es: 'Apagadita', en: 'Dim', zh: '暗暗的', hi: 'मद्धम', fr: 'Éteinte' }),
    lit: 1,
    glow: 0.16,
    dim: 0.38,
    exploring: false,
    image: require('@/assets/lumi/apagadita.png'),
    bubble: tr({
      es: 'Me echo una siestecita. Te echaba de menos, mañana empezamos de cero.',
      en: 'I’m taking a little nap. I missed you. Tomorrow we start fresh.',
      zh: '我先睡一小会儿。我想你了，明天我们重新开始。',
      hi: 'मैं थोड़ी झपकी ले रही हूँ। तुम्हारी याद आई, कल से नई शुरुआत करेंगे।',
      fr: 'Je fais une petite sieste. Tu m’as manqué, demain on repart de zéro.',
    }),
    chatter: tr({
      es: [
        'Zzz… cinco minutitos más…',
        '*se da la vuelta y sonríe en sueños*',
        'Mmm… mañana brillamos juntos…',
        'Zzz… te quiero… zzz…',
      ],
      en: [
        'Zzz… five more minutes…',
        '*rolls over and smiles in her sleep*',
        'Mmm… tomorrow we’ll shine together…',
        'Zzz… love you… zzz…',
      ],
      zh: ['Zzz……再睡五分钟……', '*翻了个身，在梦里笑了*', '嗯……明天我们一起发光……', 'Zzz……爱你……zzz……'],
      hi: ['Zzz… बस पाँच मिनट और…', '*करवट लेकर नींद में मुस्कुराती है*', 'हम्म… कल साथ चमकेंगे…', 'Zzz… प्यार… zzz…'],
      fr: [
        'Zzz… encore cinq minutes…',
        '*se retourne et sourit en dormant*',
        'Mmm… demain on brillera ensemble…',
        'Zzz… je t’aime… zzz…',
      ],
    }),
  },
};

export function stateForThreshold(t: Threshold): LumiState {
  if (t >= 75) return LUMI_STATES.apagadita;
  if (t >= 50) return LUMI_STATES.cansada;
  if (t >= 25) return LUMI_STATES.contenta;
  return LUMI_STATES.radiante;
}
