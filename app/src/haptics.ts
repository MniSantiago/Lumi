import * as Haptics from 'expo-haptics';

/**
 * Vibraciones de Lumi, suaves y solo en los momentos que cuentan. Si el
 * dispositivo no vibra (o en la web), no pasa nada.
 */
export const haptic = {
  /** Tocar a Lumi, pedir un ratito. */
  light: () => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  /** Subir o bajar un valor. */
  selection: () => void Haptics.selectionAsync().catch(() => {}),
  /** Guardar la postal, soltar la app, despertar a Lumi, empezar Plus. */
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};
