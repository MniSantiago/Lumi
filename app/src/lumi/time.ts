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

export const stepTime = (hhmm: string, dir: -1 | 1) => toHHMM(toMinutes(hhmm) + dir * 30);
