import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform } from 'react-native';

import { useSession } from '@/account/session';
import { getProgress, saveProgress } from '@/api/generated';
import type { GameState } from '@/game/engine';
import { toGameState, useGame } from '@/game/store';
import { useLumi, type Settings } from '@/lumi/store';

/**
 * Copia del progreso en la cuenta, para no perder a Lumi al cambiar de iPhone.
 *
 * - Al entrar en una cuenta por primera vez en este dispositivo: si la cuenta
 *   ya tiene progreso y aquí también hay, se pregunta cuál conservar; si solo
 *   hay en uno de los dos lados, se usa ese sin preguntar.
 * - Después, cada cambio se sube a los pocos segundos (y al salir de la app).
 *   Gana la última escritura: pensado para un iPhone a la vez.
 */

const SYNCED = ['userName', 'lumiName', 'limitMinutes', 'thiefApps', 'nightStart', 'nightEnd', 'nightlyPostcard', 'restDays'] as const;
type SyncedSettings = Pick<Settings, (typeof SYNCED)[number]>;
type Payload = { schema: 1; game: GameState; settings: SyncedSettings };

const UPLOAD_DELAY_MS = 3000;
const linkedKey = (userId: string) => `lumi.sync.linked.${userId}`;

const pickSettings = (s: Settings) => Object.fromEntries(SYNCED.map((k) => [k, s[k]])) as SyncedSettings;

function readPayload(data: unknown): Payload | null {
  const p = data as Partial<Payload> | null;
  if (!p || p.schema !== 1 || !p.game || !p.settings) return null;
  return { schema: 1, game: toGameState(p.game), settings: p.settings };
}

/** Hay algo que perder: más de un día jugado o postales guardadas (el primer día de una instalación nueva no cuenta). */
const hasProgress = (g: GameState) => Object.keys(g.days).length > 1 || g.album.length > 0;

function ask(title: string, message: string, keepLocal: string, useRemote: string): Promise<'local' | 'remote'> {
  if (Platform.OS === 'web') {
    // En web (solo desarrollo) Alert no hace nada.
    return Promise.resolve(globalThis.confirm?.(`${title}\n\n${message}\n\nAceptar: ${useRemote}`) ? 'remote' : 'local');
  }
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: keepLocal, onPress: () => resolve('local') },
        { text: useRemote, onPress: () => resolve('remote') },
      ],
      { cancelable: false },
    ),
  );
}

export function ProgressSync() {
  const { user } = useSession();
  const { ready, settings, updateSettings } = useLumi();
  const game = useGame();
  const userId = user?.id ?? null;

  /** Cuenta cuyo progreso ya está enlazado con este dispositivo (se puede subir). */
  const [linked, setLinked] = useState<string | null>(null);
  const latest = useRef({ game: game.snapshot, settings, linked, userId });
  useEffect(() => {
    latest.current = { game: game.snapshot, settings, linked, userId };
  });

  // Enlazar al entrar (y olvidar el enlace al salir o borrar la cuenta).
  const previousUser = useRef<string | null>(null);
  useEffect(() => {
    if (previousUser.current && previousUser.current !== userId) {
      void AsyncStorage.removeItem(linkedKey(previousUser.current)).catch(() => {});
    }
    previousUser.current = userId;
    // `linked` puede quedarse con la cuenta anterior un momento: `upload` comprueba que coincida.
    if (!userId || !ready || !game.ready) return;

    let alive = true;
    (async () => {
      if (await AsyncStorage.getItem(linkedKey(userId)).catch(() => null)) {
        if (alive) setLinked(userId);
        return;
      }
      let remote;
      try {
        remote = await getProgress();
      } catch {
        return; // Sin conexión: se intentará en el próximo arranque.
      }
      const payload = readPayload(remote.data);
      if (payload && alive) {
        const choice = hasProgress(latest.current.game)
          ? await ask(
              'Tienes progreso guardado',
              `Tu cuenta tiene progreso guardado${remote.updatedAt ? ` el ${new Date(remote.updatedAt).toLocaleDateString('es')}` : ''}. ¿Con cuál te quedas?`,
              'El de este iPhone',
              'El de la cuenta',
            )
          : 'remote';
        if (choice === 'remote') {
          game.restore(payload.game);
          updateSettings(payload.settings);
        }
      }
      await AsyncStorage.setItem(linkedKey(userId), '1').catch(() => {});
      if (alive) setLinked(userId);
    })();
    return () => {
      alive = false;
    };
    // Solo al cambiar de cuenta o al terminar de cargar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, ready, game.ready]);

  // Subir los cambios.
  const lastUploaded = useRef<string | null>(null);
  const upload = useCallback(async () => {
    const { linked: linkedUser, userId: currentUser, game: snapshot, settings: current } = latest.current;
    if (!linkedUser || linkedUser !== currentUser) return;
    const payload: Payload = { schema: 1, game: snapshot, settings: pickSettings(current) };
    const body = JSON.stringify(payload);
    if (body === lastUploaded.current) return;
    try {
      await saveProgress({ data: payload });
      lastUploaded.current = body;
    } catch {
      // Se reintenta con el siguiente cambio o al volver a la app.
    }
  }, []);

  const syncedSettings = JSON.stringify(pickSettings(settings));
  useEffect(() => {
    if (!linked) return;
    const t = setTimeout(() => void upload(), UPLOAD_DELAY_MS);
    return () => clearTimeout(t);
  }, [linked, game.snapshot, syncedSettings, upload]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') void upload();
    });
    return () => sub.remove();
  }, [upload]);

  return null;
}
