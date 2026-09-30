import { requireNativeView } from 'expo';
import type { ComponentType } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  /** Súbelo para que la vista vuelva a leer la selección (por ejemplo, tras el selector). */
  revision: number;
  style?: StyleProp<ViewStyle>;
};

function load(): ComponentType<Props> | null {
  try {
    return requireNativeView<Props>('LampiScreenTime', 'SelectedAppsView');
  } catch {
    return null;
  }
}

/** `null` si no hay módulo nativo (Expo Go, web). */
export default load();

/** Alto de cada fila de la vista nativa, en puntos. */
export const SELECTED_APP_ROW_HEIGHT = 44;
