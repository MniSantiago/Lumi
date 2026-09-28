import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Fireflies } from '@/components/fireflies';
import { LumiAvatar } from '@/components/lumi-avatar';
import { Field, SpeechBubble } from '@/components/onboarding/controls';
import { useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { Colors } from '@/constants/theme';
import { LUMI_STATES } from '@/lumi/states';

/** Paso 1: Lumi se presenta y os ponéis nombre. */
export default function MeetLumiStep() {
  const { draft, setDraft } = useOnboardingDraft();
  const scrollRef = useRef<ScrollView>(null);
  const lumiNameRef = useRef<TextInput>(null);
  const userName = draft.userName.trim();

  // Los campos están al final: al enfocarlos, bajamos para que el teclado no los tape.
  const revealFields = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250);

  return (
    <StepShell
      step={1}
      title="Conoce a Lumi"
      subtitle="Una lucecita que vive contigo y brilla cuando descansas del móvil."
      scrollRef={scrollRef}
      background={<NightBackground />}
      cta={{
        label: 'Continuar',
        disabled: !userName,
        onPress: () => router.push('/onboarding/apps' as Href),
      }}>
      <View style={styles.stage}>
        <SpeechBubble>
          {userName
            ? `¡Encantada, ${userName}! Cuando sueltas el móvil, brillo y salgo de aventura.`
            : '¡Hola! Soy una lucecita. Cuando sueltas el móvil, brillo y salgo de aventura.'}
        </SpeechBubble>
        <LumiAvatar state={LUMI_STATES.radiante} size={160} />
      </View>

      <View style={styles.fields}>
        <Field
          label="¿Cómo te llamas?"
          placeholder="Tu nombre"
          value={draft.userName}
          onChangeText={(userName) => setDraft({ userName })}
          onFocus={revealFields}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lumiNameRef.current?.focus()}
        />
        <Field
          ref={lumiNameRef}
          label="¿Y cómo me llamas tú?"
          placeholder="Lumi"
          value={draft.lumiName}
          onChangeText={(lumiName) => setDraft({ lumiName })}
          onFocus={revealFields}
          autoCapitalize="words"
          returnKeyType="done"
        />
      </View>
    </StepShell>
  );
}

/** El mundo del Hogar, oscurecido para que se lea bien el texto. */
function NightBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={require('@/assets/images/fondo-hogar.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <Fireflies glow={1} count={10} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.nightDeep, opacity: 0.35 }]} />
      <LinearGradient
        colors={[`${Colors.nightDeep}F0`, `${Colors.nightDeep}00`]}
        style={[styles.shade, { top: 0, height: 260 }]}
      />
      <LinearGradient
        colors={[`${Colors.nightDeep}00`, `${Colors.nightDeep}F2`]}
        style={[styles.shade, { bottom: 0, height: 380 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  fields: { gap: 16 },
  shade: { position: 'absolute', left: 0, right: 0 },
});
