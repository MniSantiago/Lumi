/** Horas "HH:MM" del horario de noche, en pasos de media hora que dan la vuelta a medianoche. */

const DAY = 24 * 60;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return ((h || 0) * 60 + (m || 0)) % DAY;
};

export const toHHMM = (minutes: number) => {
  const t = ((minutes % DAY) + DAY) % DAY;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/** Media hora antes o después. Con `avoid` (la otra hora del horario) se la salta: si empiezan y acaban igual, no hay noche. */
export function stepTime(hhmm: string, dir: -1 | 1, avoid?: string) {
  const next = toHHMM(toMinutes(hhmm) + dir * 30);
  return avoid !== undefined && toMinutes(next) === toMinutes(avoid) ? toHHMM(toMinutes(next) + dir * 30) : next;
}

/** `date` cae dentro del horario de noche [inicio, fin), que puede cruzar la medianoche. */
export function isNightTime(start: string, end: string, date = new Date()) {
  const now = date.getHours() * 60 + date.getMinutes();
  const from = toMinutes(start);
  const to = toMinutes(end);
  if (from === to) return false;
  return from < to ? now >= from && now < to : now >= from || now < to;
}
