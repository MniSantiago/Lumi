import type { ImageSource } from 'expo-image';

import { tr } from '@/i18n';
import type { TourId } from '@/tour/engine';

/** Dibujos de los pasos (hoja de APIMart, `tools/apimart_generate.py tutorial`). */
export const TOUR_ICONS = {
  mano: require('@/assets/tutorial/mano.webp'),
  estrella: require('@/assets/tutorial/estrella.webp'),
  flecha: require('@/assets/tutorial/flecha.webp'),
  brillos: require('@/assets/tutorial/brillos.webp'),
  corazon: require('@/assets/tutorial/corazon.webp'),
  varita: require('@/assets/tutorial/varita.webp'),
  medalla: require('@/assets/tutorial/medalla.webp'),
  pergamino: require('@/assets/tutorial/pergamino.webp'),
} satisfies Record<string, ImageSource>;
export type TourIcon = keyof typeof TOUR_ICONS;

export type TourStep = {
  /** Id de un `<TourTarget>` de la pantalla; sin él, la tarjeta sale centrada (presentación y cierre). */
  target: string | null;
  /** `tap`: hay que tocar el elemento de verdad para seguir; `next`: botón «Siguiente». */
  action: 'next' | 'tap';
  icon: TourIcon;
  title: string;
  body: string;
};

type Text = { title: string; body: string };
const step = (target: string | null, icon: TourIcon, text: Text, action: TourStep['action'] = 'next'): TourStep => ({
  target,
  action,
  icon,
  ...text,
});

/** El último paso de cada tour: sin foco, con la medalla. */
const finale = (text: Text) => step(null, 'medalla', text);

/** Los pasos de un tour; `name` es cómo se llama su lucecita. */
export function tourSteps(id: TourId, name: string): TourStep[] {
  switch (id) {
    case 'home':
      return [
        step(null, 'varita', {
          title: tr({
            es: `¡Hola, soy ${name}!`,
            en: `Hi, I’m ${name}!`,
            zh: `你好，我是${name}！`,
            hi: `नमस्ते, मैं ${name} हूँ!`,
            fr: `Coucou, moi c’est ${name} !`,
          }),
          body: tr({
            es: 'Te enseño mi casa en un minuto. Toca «Siguiente» y yo te guío.',
            en: 'Let me show you around my home in a minute. Tap “Next” and I’ll guide you.',
            zh: '我带你花一分钟逛逛我的小窝。点“下一步”，我来带路。',
            hi: 'एक मिनट में तुम्हें अपना घर दिखाती हूँ। “आगे” दबाओ, मैं रास्ता दिखाऊँगी।',
            fr: 'Je te fais visiter ma maison en une minute. Touche « Suivant » et je te guide.',
          }),
        }),
        step('home.meter', 'brillos', {
          title: tr({
            es: 'Mi luz de hoy',
            en: 'My light today',
            zh: '我今天的光',
            hi: 'आज की मेरी रोशनी',
            fr: 'Ma lumière du jour',
          }),
          body: tr({
            es: 'Las apps ladronas me la gastan. Cuanta más luz me quede, más lejos llego en mis viajes.',
            en: 'Thief apps drain it. The more light I keep, the farther I travel.',
            zh: '“偷时间”的应用会消耗它。光越多，我就能走得越远。',
            hi: 'चोर ऐप्स इसे खर्च करते हैं। जितनी ज़्यादा रोशनी बचेगी, मैं उतनी दूर जाऊँगी।',
            fr: 'Les applis voleuses l’usent. Plus il m’en reste, plus je vais loin.',
          }),
        }),
        step(
          'home.lumi',
          'corazon',
          {
            title: tr({ es: 'Tócame', en: 'Poke me', zh: '戳戳我', hi: 'मुझे छुओ', fr: 'Touche-moi' }),
            body: tr({
              es: 'Prueba: dame un toquecito. Siempre tengo algo que contarte.',
              en: 'Go on, give me a tap. I always have something to tell you.',
              zh: '试试轻轻点我一下。我总有话想跟你说。',
              hi: 'ज़रा सा छूकर देखो। मेरे पास हमेशा तुम्हें बताने को कुछ होता है।',
              fr: 'Vas-y, un petit tapotement. J’ai toujours quelque chose à te dire.',
            }),
          },
          'tap',
        ),
        step('home.expedition', 'pergamino', {
          title: tr({
            es: 'Mis expediciones',
            en: 'My expeditions',
            zh: '我的探险',
            hi: 'मेरे सफ़र',
            fr: 'Mes expéditions',
          }),
          body: tr({
            es: 'Si hoy no pasas de la mitad de tu límite, salgo de viaje y vuelvo esta noche con una postal.',
            en: 'Stay under half your limit today and I set off on a trip, back tonight with a postcard.',
            zh: '今天用量不超过上限的一半，我就出发旅行，今晚带着明信片回来。',
            hi: 'आज सीमा का आधा भी पार न हो, तो मैं सफ़र पर निकलती हूँ और आज रात पोस्टकार्ड लेकर लौटती हूँ।',
            fr: 'Reste sous la moitié de ta limite et je pars en voyage, de retour ce soir avec une carte.',
          }),
        }),
        step('home.sparks', 'estrella', {
          title: tr({
            es: 'Chispas ✦',
            en: 'Sparks ✦',
            zh: '火花 ✦',
            hi: 'चिंगारियाँ ✦',
            fr: 'Étincelles ✦',
          }),
          body: tr({
            es: 'Las gano en cada viaje y en las noches bien dormidas. Tócalas y te cuento más.',
            en: 'I earn them on every trip and on well-slept nights. Tap them to learn more.',
            zh: '每次旅行、每个睡得好的夜晚我都会赚到火花。点一下，我告诉你更多。',
            hi: 'हर सफ़र और अच्छी नींद वाली रात पर मुझे ये मिलती हैं। छूकर और जानो।',
            fr: 'J’en gagne à chaque voyage et après une bonne nuit. Touche-les pour en savoir plus.',
          }),
        }),
        finale({
          title: tr({
            es: '¡Eso es todo!',
            en: 'That’s it!',
            zh: '就这些啦！',
            hi: 'बस इतना ही!',
            fr: 'Voilà, c’est tout !',
          }),
          body: tr({
            es: 'Puedes repetir este tutorial cuando quieras desde Ajustes.',
            en: 'You can replay this tutorial any time from Settings.',
            zh: '你随时可以在“设置”里重看这个教程。',
            hi: 'चाहो तो सेटिंग्स से कभी भी यह ट्यूटोरियल दोबारा देख सकते हो।',
            fr: 'Tu peux revoir ce tutoriel quand tu veux dans Réglages.',
          }),
        }),
      ];
    case 'expediciones':
      return [
        step('exp.trail', 'flecha', {
          title: tr({
            es: 'Un camino de lugares',
            en: 'A trail of places',
            zh: '一条通往各地的小路',
            hi: 'जगहों का रास्ता',
            fr: 'Un chemin de lieux',
          }),
          body: tr({
            es: 'Cada día que me dejas brillar descubro uno nuevo. Los candados se abren con días brillantes.',
            en: 'Every day you let me shine, I discover a new one. Locks open with bright days.',
            zh: '每个让我发光的日子，我都会发现一个新地方。亮起来的日子会打开锁。',
            hi: 'जिस दिन तुम मुझे चमकने देते हो, मैं एक नई जगह खोजती हूँ। ताले चमकीले दिनों से खुलते हैं।',
            fr: 'Chaque jour où tu me laisses briller, j’en découvre un nouveau. Les cadenas s’ouvrent avec les jours lumineux.',
          }),
        }),
        finale({
          title: tr({
            es: 'Y cada noche, una postal',
            en: 'And every night, a postcard',
            zh: '每天夜里，一张明信片',
            hi: 'और हर रात, एक पोस्टकार्ड',
            fr: 'Et chaque nuit, une carte',
          }),
          body: tr({
            es: 'Las que reciba se guardan aquí abajo y en la Colección.',
            en: 'The ones I get are kept down below and in the Collection.',
            zh: '收到的明信片会存放在下方和“收藏”里。',
            hi: 'जो भी मिलते हैं, वे नीचे और संग्रह में सुरक्षित रहते हैं।',
            fr: 'Celles que je reçois se rangent plus bas et dans la Collection.',
          }),
        }),
      ];
    case 'coleccion':
      return [
        step(
          'col.tabs',
          'estrella',
          {
            title: tr({
              es: 'Tres álbumes',
              en: 'Three albums',
              zh: '三本相册',
              hi: 'तीन एल्बम',
              fr: 'Trois albums',
            }),
            body: tr({
              es: 'Postales, objetos y amigos. Toca una pestaña para cambiar de álbum.',
              en: 'Postcards, items and friends. Tap a tab to switch albums.',
              zh: '明信片、物品和朋友。点一个标签页就能切换。',
              hi: 'पोस्टकार्ड, चीज़ें और दोस्त। एल्बम बदलने के लिए टैब छुओ।',
              fr: 'Cartes, objets et amis. Touche un onglet pour changer d’album.',
            }),
          },
          'tap',
        ),
        step(null, 'corazon', {
          title: tr({
            es: 'Todo lo que encuentre',
            en: 'Everything I find',
            zh: '我找到的一切',
            hi: 'जो कुछ भी मुझे मिले',
            fr: 'Tout ce que je trouve',
          }),
          body: tr({
            es: 'Los huecos sellados son sorpresas por descubrir ✨',
            en: 'Sealed spots are surprises still to be discovered ✨',
            zh: '封住的格子是等待发现的惊喜 ✨',
            hi: 'बंद जगहें वो सरप्राइज़ हैं जो अभी खोजने बाकी हैं ✨',
            fr: 'Les cases scellées sont des surprises à découvrir ✨',
          }),
        }),
      ];
    case 'progreso':
      return [
        step('prog.streak', 'estrella', {
          title: tr({ es: 'Tu racha', en: 'Your streak', zh: '你的连续记录', hi: 'तुम्हारा सिलसिला', fr: 'Ta série' }),
          body: tr({
            es: 'Días seguidos dejándome brillar. Los días de descanso no la rompen.',
            en: 'Days in a row you let me shine. Rest days don’t break it.',
            zh: '连续让我发光的天数。休息日不会打断它。',
            hi: 'लगातार वो दिन जब तुमने मुझे चमकने दिया। आराम के दिन इसे नहीं तोड़ते।',
            fr: 'Les jours d’affilée où tu me laisses briller. Les jours de repos ne l’interrompent pas.',
          }),
        }),
        step('prog.week', 'brillos', {
          title: tr({
            es: 'Cómo brilló la semana',
            en: 'How the week shone',
            zh: '这一周的光',
            hi: 'इस हफ़्ते की चमक',
            fr: 'La lumière de la semaine',
          }),
          body: tr({
            es: 'Cada barrita es la luz que me quedó al acabar el día.',
            en: 'Each bar is the light I had left at the end of the day.',
            zh: '每根小柱子都是那天结束时我剩下的光。',
            hi: 'हर पट्टी दिन के अंत में मेरी बची हुई रोशनी है।',
            fr: 'Chaque barre, c’est la lumière qui me restait en fin de journée.',
          }),
        }),
        step(null, 'corazon', {
          title: tr({
            es: 'Sin culpas',
            en: 'No guilt',
            zh: '不用自责',
            hi: 'कोई अपराधबोध नहीं',
            fr: 'Sans culpabilité',
          }),
          body: tr({
            es: 'Si un día flojea, mañana empezamos de nuevo. A mí nunca me pasa nada malo.',
            en: 'If a day goes badly, we start fresh tomorrow. Nothing bad ever happens to me.',
            zh: '如果某天不太顺，明天我们重新开始。我永远不会出事的。',
            hi: 'अगर कोई दिन फीका रहे, तो कल फिर से शुरू करेंगे। मेरे साथ कभी कुछ बुरा नहीं होता।',
            fr: 'Si une journée est molle, on recommence demain. Il ne m’arrive jamais rien de grave.',
          }),
        }),
      ];
    case 'ajustes':
      return [
        step('set.apps', 'flecha', {
          title: tr({
            es: 'Apps ladronas',
            en: 'Thief apps',
            zh: '偷时间的 App',
            hi: 'चोर ऐप्स',
            fr: 'Applis voleuses',
          }),
          body: tr({
            es: 'Elige cuáles me apagan la luz. Yo vigilo solo esas.',
            en: 'Pick the ones that dim my light. I only watch over those.',
            zh: '选出会让我变暗的应用。我只盯着它们。',
            hi: 'चुनो कौन-सी मेरी रोशनी बुझाती हैं। मैं सिर्फ़ उन्हीं पर नज़र रखती हूँ।',
            fr: 'Choisis celles qui éteignent ma lumière. Je ne surveille que celles-là.',
          }),
        }),
        step('set.limit', 'varita', {
          title: tr({
            es: 'Límite y noche',
            en: 'Limit and night',
            zh: '上限和夜晚',
            hi: 'सीमा और रात',
            fr: 'Limite et nuit',
          }),
          body: tr({
            es: 'Tu límite diario es suave, y de noche me voy a dormir a la hora que elijas.',
            en: 'Your daily limit is gentle, and at night I go to sleep whenever you choose.',
            zh: '你的每日上限很温和，夜里我会在你定的时间去睡觉。',
            hi: 'रोज़ की सीमा नरम है, और रात को मैं तुम्हारी चुनी हुई घड़ी पर सोने चली जाती हूँ।',
            fr: 'Ta limite quotidienne est douce, et la nuit je vais dormir à l’heure que tu choisis.',
          }),
        }),
        step(null, 'pergamino', {
          title: tr({
            es: '¿Quieres repasar algo?',
            en: 'Want a refresher?',
            zh: '想再看一遍吗？',
            hi: 'कुछ दोबारा देखना है?',
            fr: 'Un petit rappel ?',
          }),
          body: tr({
            es: 'Más abajo, en esta pantalla, puedes volver a ver cualquier tutorial.',
            en: 'Further down this screen you can replay any tutorial.',
            zh: '在这个页面往下滑，可以重看任何教程。',
            hi: 'इसी स्क्रीन पर नीचे जाकर कोई भी ट्यूटोरियल फिर से देख सकते हो।',
            fr: 'Plus bas sur cet écran, tu peux revoir n’importe quel tutoriel.',
          }),
        }),
      ];
  }
}

/** Nombre de cada tour, para la lista de Ajustes. */
export function tourTitle(id: TourId): string {
  switch (id) {
    case 'home':
      return tr({ es: 'Hogar', en: 'Home', zh: '家', hi: 'घर', fr: 'Maison' });
    case 'expediciones':
      return tr({ es: 'Expediciones', en: 'Expeditions', zh: '探险', hi: 'सफ़र', fr: 'Expéditions' });
    case 'coleccion':
      return tr({ es: 'Colección', en: 'Collection', zh: '收藏', hi: 'संग्रह', fr: 'Collection' });
    case 'progreso':
      return tr({ es: 'Progreso', en: 'Progress', zh: '进度', hi: 'प्रगति', fr: 'Progrès' });
    case 'ajustes':
      return tr({ es: 'Ajustes', en: 'Settings', zh: '设置', hi: 'सेटिंग्स', fr: 'Réglages' });
  }
}

/** Ruta de la pestaña donde vive cada tour. */
export const TOUR_ROUTE: Record<TourId, '/' | '/expediciones' | '/coleccion' | '/progreso' | '/ajustes'> = {
  home: '/',
  expediciones: '/expediciones',
  coleccion: '/coleccion',
  progreso: '/progreso',
  ajustes: '/ajustes',
};

export const tourCopy = {
  next: tr({ es: 'Siguiente', en: 'Next', zh: '下一步', hi: 'आगे', fr: 'Suivant' }),
  done: tr({ es: '¡Listo!', en: 'Done!', zh: '完成！', hi: 'हो गया!', fr: 'Terminé !' }),
  skip: tr({ es: 'Saltar', en: 'Skip', zh: '跳过', hi: 'छोड़ो', fr: 'Passer' }),
  tapHint: tr({
    es: 'Toca lo resaltado',
    en: 'Tap the glowing spot',
    zh: '点一下发光的地方',
    hi: 'चमकती जगह को छुओ',
    fr: 'Touche la zone lumineuse',
  }),
  stepOf: (i: number, n: number) =>
    tr({
      es: `Paso ${i} de ${n}`,
      en: `Step ${i} of ${n}`,
      zh: `第 ${i} 步，共 ${n} 步`,
      hi: `${n} में से चरण ${i}`,
      fr: `Étape ${i} sur ${n}`,
    }),
};
