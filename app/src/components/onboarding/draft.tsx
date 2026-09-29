import { createContext, use, useState, type ReactNode } from 'react';

import { haptic } from '@/haptics';
import { useLumi, type Settings } from '@/lumi/store';
import { ensureNotificationPermission } from '@/notifications';

/** Lo que se va respondiendo en el onboarding. No se guarda nada hasta el final. */
export type OnboardingDraft = Pick<
  Settings,
  'userName' | 'lumiName' | 'thiefApps' | 'limitMinutes' | 'nightStart' | 'nightEnd' | 'nightlyPostcard'
>;

type DraftContextValue = {
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  /**
   * Guarda todas las respuestas de una vez; el guard del Stack raíz lleva a las pestañas.
   * Si quiere la postal nocturna, pide aquí el permiso de avisos (en contexto, no de golpe en el Hogar).
   */
  finish: () => Promise<void>;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useLumi();
  // Parte de los ajustes actuales: si se repite el onboarding, salen las respuestas anteriores.
  const [draft, setDraftState] = useState<OnboardingDraft>(() => ({
    userName: settings.userName,
    lumiName: settings.lumiName || 'Lumi',
    thiefApps: settings.thiefApps,
    limitMinutes: settings.limitMinutes,
    nightStart: settings.nightStart,
    nightEnd: settings.nightEnd,
    nightlyPostcard: settings.nightlyPostcard,
  }));

  const setDraft = (patch: Partial<OnboardingDraft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const finish = async () => {
    haptic.success();
    // Si deniega el permiso, la postal nocturna queda apagada (se puede encender en Ajustes).
    const nightlyPostcard = draft.nightlyPostcard ? await ensureNotificationPermission() : false;
    updateSettings({
      userName: draft.userName.trim(),
      lumiName: draft.lumiName.trim() || 'Lumi',
      thiefApps: draft.thiefApps,
      limitMinutes: draft.limitMinutes,
      nightStart: draft.nightStart,
      nightEnd: draft.nightEnd,
      nightlyPostcard,
      onboarded: true,
    });
  };

  return <DraftContext value={{ draft, setDraft, finish }}>{children}</DraftContext>;
}

export function useOnboardingDraft() {
  const ctx = use(DraftContext);
  if (!ctx) throw new Error('useOnboardingDraft debe usarse dentro de <OnboardingDraftProvider>');
  return ctx;
}

/** El nombre que el usuario le ha puesto a Lumi, o "Lumi" mientras no escriba nada. */
export function useLumiName() {
  return useOnboardingDraft().draft.lumiName.trim() || 'Lumi';
}
