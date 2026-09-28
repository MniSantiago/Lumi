import type { PlusPackage } from '@/purchases';

/** Textos del paywall. Lumi invita, nunca presiona. */

const MONTHS = [
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
];

/** "5 de octubre". A mano para no depender de los datos de Intl del motor. */
export function formatDayMonth(date: Date) {
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

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
    title: 'Más especies y colores de luz',
    sub: 'Nuevas criaturas y luces en aguamarina, melocotón o lavanda.',
  },
  {
    key: 'zones',
    symbol: 'map.fill',
    tint: '#FFB4A2',
    title: 'Zonas exclusivas y capítulos de historia',
    sub: 'Lugares nuevos que explorar y más capítulos en sus postales.',
  },
  {
    key: 'control',
    symbol: 'moon.stars.fill',
    tint: '#C9BFF2',
    title: 'Varios horarios, bloqueo estricto y estadísticas',
    sub: 'Para afinar: horarios distintos, un escudo sin «5 min más» y tus semanas en detalle.',
  },
  {
    key: 'burrow',
    symbol: 'house.fill',
    tint: '#FFC96B',
    title: 'Decoración premium para la madriguera',
    sub: 'Muebles y lucecitas especiales para su hogar.',
  },
] as const;

export const freeForever = [
  'Tu Lumi y su escudo',
  'El límite diario',
  'Expediciones y postales',
  'El widget',
  'El modo noche',
];

export const paywallCopy = {
  title: 'Lumi Plus',
  subtitle: (name: string) => `Para quien quiere ir un poco más lejos con ${name}.`,
  colorsTease: 'Más colores de luz',
  plusSection: 'Con Plus',
  freeTitle: 'Gratis para siempre',
  freeNote: (name: string) => `Lo importante no se paga: ${name} te acompaña igual.`,
  plansSection: 'Elige tu plan',
  badgeSavings: (pct: number) => `Ahorra ${pct} %`,
  badgeTrial: (days: number) => `${days} días gratis`,
  planLine: (p: PlusPackage) =>
    p.trialDays > 0
      ? `${p.trialDays} días gratis, luego ${p.price} al año`
      : `${p.price} al mes, sin prueba gratis`,
  timelineToday: 'Hoy',
  timelineTodayText: 'Todo Plus, gratis',
  timelineReminder: (day: number) => `Día ${day}`,
  timelineReminderText: 'Te avisamos',
  timelineCharge: (day: number) => `Día ${day}`,
  timelineChargeText: 'Primer cobro',
  reminderNote: `Te avisamos ${REMINDER_DAYS_BEFORE} días antes de que acabe la prueba.`,

  cta: (p: PlusPackage) =>
    p.trialDays > 0 ? `Empezar ${p.trialDays} días gratis` : `Suscribirme por ${p.price} al mes`,
  ctaFallback: 'Empezar 7 días gratis',
  honest: (p: PlusPackage, now: Date) =>
    p.trialDays > 0
      ? `Gratis hasta el ${formatDayMonth(addDays(now, p.trialDays))}. Luego ${p.price} al año. Cancela cuando quieras.`
      : `${p.price} al mes. Se renueva cada mes. Cancela cuando quieras.`,
  restore: 'Restaurar compras',
  restoring: 'Restaurando…',
  terms: 'Términos',
  privacy: 'Privacidad',
  noPressure: 'Lumi no se pone triste si no lo pruebas.',

  loadingPlans: 'Buscando los planes…',
  purchaseError: 'No se ha podido completar. Inténtalo otra vez cuando quieras, no hay prisa.',
  restoreNone: 'No hemos encontrado compras anteriores con esta cuenta.',
  restoreError: 'No hemos podido restaurar ahora. Prueba otra vez en un ratito.',

  successTitle: '¡Te damos la bienvenida a Plus!',
  successBody: (name: string) => `${name} ya brilla de colores ✨`,
  restoredTitle: '¡Ya tienes Plus de vuelta!',

  ownedTitle: 'Ya tienes Lumi Plus',
  ownedBody: (name: string) => `${name} brilla de colores. Gracias por acompañarla un poco más lejos.`,
  close: 'Cerrar',
  closeA11y: 'Cerrar Lumi Plus',
  devRemove: 'Quitar Plus (desarrollo)',
};
