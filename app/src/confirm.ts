import { Alert, Platform } from 'react-native';

/**
 * Pregunta antes de algo importante (borrar la cuenta, cerrar sesión). En iOS,
 * el diálogo nativo; en la web (solo desarrollo) Alert no hace nada, así que
 * se usa `confirm()` del navegador.
 */
export function confirmAction({
  title,
  message,
  cancel,
  confirm,
  destructive = false,
  onConfirm,
}: {
  title: string;
  message: string;
  cancel: string;
  confirm: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: confirm, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ]);
}
