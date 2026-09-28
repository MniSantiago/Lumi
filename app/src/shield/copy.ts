/**
 * Textos del escudo (BRIEF.md, "La pantalla de bloqueo ES Lumi"). Fricción
 * emocional, nunca castigo: Lumi no regaña, solo recuerda que está dormida.
 */
export const shieldCopy = {
  appTag: (appName: string) => `${appName} está tapada hasta mañana`,
  title: (lumiName: string) => `${lumiName} se estaba echando la siesta… ¿de verdad entramos?`,
  body: 'Ya habéis pasado de tu hora de hoy. Si lo dejas ahora, mañana se despierta con más luz.',

  leave: 'Vale, lo dejo',
  leaveThanks: 'Gracias. Me quedo soñando contigo 💤',

  /** `used` = veces que ya se ha pedido hoy, antes de esta. */
  snooze: (used: number) => (used === 0 ? '5 min más' : 'Vale… 5 min, pero te espero despierta'),
  snoozeNote: (used: number) =>
    used === 0
      ? null
      : used === 1
        ? 'Hoy ya te he dado un ratito de 5 min. No pasa nada.'
        : `Hoy ya van ${used} ratitos de 5 min. No pasa nada, aquí sigo.`,
  /** `count` = veces que se ha pedido hoy, contando esta. */
  snoozeGranted: (count: number) =>
    count === 1 ? 'Vale, 5 minutitos. Aquí te espero 🌙' : 'Otros 5, vale. Te espero despierta 🌙',
};
