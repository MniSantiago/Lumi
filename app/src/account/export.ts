import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';

import { exportData, type UserDto } from '@/api/generated';
import type { GameState } from '@/game/engine';
import { tr } from '@/i18n';
import type { Settings } from '@/lumi/store';

/**
 * "Descargar mis datos" (derecho de acceso): lo que hay en este iPhone y, con
 * cuenta, lo que guarda el servidor, en un JSON legible que se comparte con la
 * hoja del sistema (Archivos, correo, AirDrop…).
 */
export async function exportMyData({
  settings,
  game,
  user,
}: {
  settings: Settings;
  game: GameState;
  user: UserDto | null;
}): Promise<void> {
  const data = {
    app: 'Lumi',
    exportedAt: new Date().toISOString(),
    thisDevice: { settings, progress: game },
    // Si falla (sin conexión), la exportación sigue con lo del dispositivo.
    account: user
      ? await exportData().catch(() => ({
          error: tr({
            es: 'No se pudo conectar con tu cuenta',
            en: 'Couldn’t connect to your account',
            zh: '无法连接到你的账户',
            hi: 'तुम्हारे खाते से जुड़ नहीं सके',
            fr: 'Impossible de se connecter à ton compte',
          }),
        }))
      : null,
  };
  const json = JSON.stringify(data, null, 2);

  if (!(await Sharing.isAvailableAsync())) {
    await Share.share({ message: json });
    return;
  }
  const file = new File(Paths.cache, 'lumi-mis-datos.json');
  file.create({ overwrite: true });
  file.write(json);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: tr({
      es: 'Tus datos de Lumi',
      en: 'Your Lumi data',
      zh: '你的 Lumi 数据',
      hi: 'तुम्हारा Lumi डेटा',
      fr: 'Tes données Lumi',
    }),
  });
}
