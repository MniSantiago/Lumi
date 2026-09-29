import { useEffect, useRef } from 'react';

import { useSession } from '@/account/session';
import { useLumi } from '@/lumi/store';
import { purchases, realStore } from '@/purchases';

/**
 * Con tienda de verdad, `settings.isPlus` sigue a la suscripción: al arrancar,
 * cuando cambia (renovación, caducidad, compra en otro iPhone) y al entrar o
 * salir de la cuenta, que es a quien queda ligada la compra.
 * Con el mock no hace nada: `isPlus` lo pone el paywall.
 */
export function PlusSync() {
  const { ready, updateSettings } = useLumi();
  const { user } = useSession();
  const userId = user?.id ?? null;

  const setPlus = useRef((isPlus: boolean) => updateSettings({ isPlus }));
  useEffect(() => {
    setPlus.current = (isPlus: boolean) => updateSettings({ isPlus });
  });

  useEffect(() => {
    if (!realStore || !ready) return;
    return purchases.onPlusChange?.((isPlus) => setPlus.current(isPlus));
  }, [ready]);

  useEffect(() => {
    if (!realStore || !ready) return;
    (async () => {
      try {
        await purchases.setUser?.(userId);
        const isPlus = await purchases.getIsPlus?.();
        if (isPlus !== undefined) setPlus.current(isPlus);
      } catch {
        // Sin conexión: se queda el último estado conocido.
      }
    })();
  }, [ready, userId]);

  return null;
}
