import { View } from 'react-native';

import { Label, List, Row } from '@/components/onboarding/controls';
import { SectionTitle, TextLink } from '@/components/ui';
import { haptic } from '@/haptics';
import { tr } from '@/i18n';
import { useTour } from '@/tour/context';
import { tourTitle } from '@/tour/definitions';
import { TOUR_IDS } from '@/tour/engine';

/** Ajustes → Tutoriales: volver a ver cualquiera de los tours guiados. */
export function TutorialsSection() {
  const { replay, seen } = useTour();
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle>{tr({ es: 'Tutoriales', en: 'Tutorials', zh: '教程', hi: 'ट्यूटोरियल', fr: 'Tutoriels' })}</SectionTitle>
      <List>
        {TOUR_IDS.map((id, i) => (
          <Row key={id} last={i === TOUR_IDS.length - 1}>
            <Label
              title={tourTitle(id)}
              sub={
                seen[id]
                  ? tr({ es: 'Ya lo viste', en: 'Already seen', zh: '已看过', hi: 'देख चुके हो', fr: 'Déjà vu' })
                  : tr({ es: 'Sale la primera vez que entras', en: 'Shows the first time you visit', zh: '第一次进入时出现', hi: 'पहली बार आने पर दिखता है', fr: 'Apparaît à ta première visite' })
              }
            />
            <TextLink
              label={tr({ es: 'Ver', en: 'Watch', zh: '观看', hi: 'देखो', fr: 'Voir' })}
              onPress={() => {
                haptic.light();
                replay(id);
              }}
            />
          </Row>
        ))}
      </List>
    </View>
  );
}
