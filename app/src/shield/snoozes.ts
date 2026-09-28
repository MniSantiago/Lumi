import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cuántas veces se ha pedido "5 min más" hoy. Se guarda por día (fecha local),
 * así que cada mañana vuelve a cero: nada se arrastra de un día a otro.
 *
 * En iOS real lo contará la extensión `ShieldAction` en el App Group; aquí vive
 * en AsyncStorage para que la maqueta se comporte igual entre aperturas.
 */
const PREFIX = 'lumi.shield.snoozes.';

function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${PREFIX}${y}-${m}-${d}`;
}

/** Caché del día en memoria para no esperar a AsyncStorage al reabrir el escudo. */
let cache: { key: string; count: number } | null = null;

/** Lectura inmediata de la caché (0 si aún no se ha leído hoy), para el primer render. */
export function peekSnoozesToday(): number {
  return cache?.key === dayKey() ? cache.count : 0;
}

export async function getSnoozesToday(): Promise<number> {
  const key = dayKey();
  if (cache?.key === key) return cache.count;
  let count = 0;
  try {
    count = Number(await AsyncStorage.getItem(key)) || 0;
  } catch {}
  cache = { key, count };
  return count;
}

/** Concede otros 5 minutos y devuelve cuántos van hoy (incluido este). */
export async function grantSnooze(): Promise<number> {
  const key = dayKey();
  const count = (await getSnoozesToday()) + 1;
  cache = { key, count };
  try {
    await AsyncStorage.setItem(key, String(count));
    // Limpiamos los contadores de días anteriores.
    const old = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX) && k !== key);
    if (old.length) await AsyncStorage.multiRemove(old);
  } catch {}
  return count;
}
