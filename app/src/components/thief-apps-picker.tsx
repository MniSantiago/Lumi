import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { PillButton, TextLink } from '@/components/ui';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { realScreenTime } from '@/screen-time';
import {
  getThiefAppsSelection,
  requestScreenTimeAuthorization,
  saveThiefAppsSelection,
  selectionSheetView,
  thiefAppsCount,
} from '@/screen-time/native';

/** La hoja nativa, cargada una vez y solo con Screen Time de verdad (no existe en Expo Go). */
const SelectionSheet = realScreenTime ? selectionSheetView() : null;

/**
 * Elegir las apps ladronas con el `FamilyActivityPicker` de Apple (solo con
 * Screen Time de verdad). Lumi nunca ve qué apps son: solo guarda el token.
 */
export function ThiefAppsPicker({ lumiName, onChange }: { lumiName: string; onChange?: (count: number) => void }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(() => thiefAppsCount());
  const [denied, setDenied] = useState(false);

  const pick = async () => {
    const ok = await requestScreenTimeAuthorization().catch(() => false);
    setDenied(!ok);
    if (ok) setOpen(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityLiveRegion="polite">
        {count === 0 ? 'Aún no has elegido ninguna' : `${count} ${count === 1 ? 'app o categoría elegida' : 'apps y categorías elegidas'}`}
      </Text>
      <Text style={styles.sub}>
        Se eligen con el selector de Apple. {lumiName} solo se entera de cuándo te acercas a tu límite, nunca de qué
        apps son ni de lo que haces dentro.
      </Text>
      <PillButton label={count === 0 ? 'Elegir apps' : 'Cambiar apps'} onPress={() => void pick()} />
      {denied ? (
        <View style={{ gap: 4 }}>
          <Text style={styles.denied}>
            Para que {lumiName} funcione hace falta el permiso de Tiempo de uso. Puedes darlo en Ajustes.
          </Text>
          <TextLink label="Abrir Ajustes" onPress={() => void Linking.openSettings()} />
        </View>
      ) : null}
      {open && SelectionSheet ? (
        <SelectionSheet
          style={styles.anchor}
          familyActivitySelection={getThiefAppsSelection() ?? null}
          onDismissRequest={() => setOpen(false)}
          onSelectionChange={(e) => {
            const { familyActivitySelection, applicationCount, categoryCount, webDomainCount } = e.nativeEvent;
            if (!familyActivitySelection) return;
            saveThiefAppsSelection(familyActivitySelection);
            const next = applicationCount + categoryCount + webDomainCount;
            setCount(next);
            onChange?.(next);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'flex-start',
  },
  title: { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: Colors.text },
  sub: { fontFamily: Fonts.body, fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  denied: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.peach },
  // La hoja nativa se presenta sola; esto es solo su ancla invisible.
  anchor: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
