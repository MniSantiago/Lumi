import { tr } from '@/i18n';

/**
 * Fechas a mano, sin depender de los datos de Intl del motor (Hermes no los
 * trae completos en todos los idiomas).
 */
const MONTHS = tr({
  es: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
  fr: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
});

/** Domingo primero, como `Date.getDay()`. */
export const WEEKDAYS = tr({
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
});

export const monthName = (date: Date) => MONTHS[date.getMonth()];

/** "5 de octubre", "October 5", "10月5日", "5 अक्टूबर", "5 octobre". */
export function dayMonth(date: Date) {
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  return tr({ es: `${d} de ${m}`, en: `${m} ${d}`, zh: `${m}${d}日`, hi: `${d} ${m}`, fr: `${d} ${m}` });
}
