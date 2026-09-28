/**
 * Textos de los avisos locales. Lumi escribe como una amiga: cuenta, invita
 * y nunca reprocha. Nada de "¡No te lo pierdas!" ni prisas.
 */
import { fromDestination } from '@/game/destinations';
import type { Destination } from '@/game/types';

/** Cuerpos de la vuelta nocturna; se elige uno según el día. */
const NIGHTLY_BODIES = [
  'Trae una postal y los bolsillos llenos. Te espera despierta para enseñártelo.',
  'Viene con los mofletes fríos y una historia nueva. Cuando quieras, te la cuenta.',
  'Ha guardado algo para ti en el fondo del bolsillo. Sin prisa, te espera.',
  'Ya está en casa, envuelta en su mantita, con una postal recién escrita para ti.',
];

/** Índice estable para un día local: la misma fecha siempre da el mismo texto. */
function dayIndex(at: Date, n: number) {
  const key = at.getFullYear() * 372 + at.getMonth() * 31 + at.getDate();
  return key % n;
}

export function nightlyReturnContent(lumiName: string, destination: Pick<Destination, 'name' | 'article'>, at: Date) {
  return {
    title: `${lumiName} ha vuelto ${fromDestination(destination)} 🌙`,
    body: NIGHTLY_BODIES[dayIndex(at, NIGHTLY_BODIES.length)],
  };
}

export function trialReminderContent(lumiName: string) {
  return {
    title: 'Tu prueba de Lumi Plus acaba en 2 días',
    body: `Si no quieres seguir, puedes cancelarla en Ajustes de iOS. ${lumiName} te quiere igual ✨`,
  };
}

/** Alerta amable cuando iOS no deja mandar avisos. */
export const permissionDeniedCopy = {
  title: 'Los avisos están desactivados',
  body: (lumiName: string) =>
    `Para que ${lumiName} te avise al volver de su viaje, activa las notificaciones de Lumi en Ajustes de iOS. Si prefieres no hacerlo, no pasa nada: la postal te esperará igual al abrir la app.`,
  openSettings: 'Abrir Ajustes',
  notNow: 'Ahora no',
};
