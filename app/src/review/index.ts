import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';

/**
 * Pedir una valoración en un buen momento: justo después de guardar la 3.ª,
 * 10.ª o 25.ª postal, nunca más de una vez por hito y con al menos 60 días
 * entre peticiones. iOS decide además si enseña el diálogo (máx. 3 al año).
 */
const KEY = 'lumi.review.v1';
const MILESTONES = [3, 10, 25];
const MIN_GAP_MS = 60 * 24 * 60 * 60 * 1000;
/** Tras la despedida de la postal, para no taparla. */
const DELAY_MS = 1800;

type Stored = { milestones: number[]; lastAskedAt: number | null };

export async function maybeAskForReview(postcards: number): Promise<void> {
  if (!MILESTONES.includes(postcards)) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const stored: Stored = raw ? JSON.parse(raw) : { milestones: [], lastAskedAt: null };
    if (stored.milestones.includes(postcards)) return;
    if (stored.lastAskedAt && Date.now() - stored.lastAskedAt < MIN_GAP_MS) return;
    if (!(await StoreReview.isAvailableAsync())) return;

    await AsyncStorage.setItem(
      KEY,
      JSON.stringify({ milestones: [...stored.milestones, postcards], lastAskedAt: Date.now() } satisfies Stored),
    );
    setTimeout(() => void StoreReview.requestReview().catch(() => {}), DELAY_MS);
  } catch {
    // Pedir valoración nunca debe romper nada.
  }
}
