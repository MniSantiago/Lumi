import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useRef } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { apiAvailable } from '@/api/client';
import { Fireflies } from '@/components/fireflies';
import { LivingBackground } from '@/components/living-background';
import { LumiAvatar } from '@/components/lumi-avatar';
import { SecondaryLink } from '@/components/account/form';
import { Field, NAME_MAX, SpeechBubble } from '@/components/onboarding/controls';
import { useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { Colors } from '@/constants/theme';
import { LUMI_STATES } from '@/lumi/states';
import { tr } from '@/i18n';

/** Paso 1: Lampi se presenta y os ponéis nombre. */
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
      title={tr({
        es: 'Conoce a Lampi',
        en: 'Meet Lampi',
        zh: '认识 Lampi',
        hi: 'Lampi से मिलो',
        fr: 'Voici Lampi',
      })}
      subtitle={tr({
        es: 'Una lucecita que vive contigo y brilla cuando descansas del móvil.',
        en: 'A little light that lives with you and shines when you take a break from your phone.',
        zh: '一束和你住在一起的小光，你放下手机休息时，她就发光。',
        hi: 'एक नन्ही रोशनी जो तुम्हारे साथ रहती है और तब चमकती है जब तुम फ़ोन से आराम लेते हो।',
        fr: 'Une petite lumière qui vit avec toi et brille quand tu fais une pause de ton téléphone.',
      })}
      scrollRef={scrollRef}
      background={<NightBackground />}
      cta={{
        label: tr({ es: 'Continuar', en: 'Continue', zh: '继续', hi: 'आगे बढ़ो', fr: 'Continuer' }),
        disabled: !userName,
        onPress: () => router.push('/onboarding/apps' as Href),
      }}>
      <View style={styles.stage}>
        <SpeechBubble>
          {userName
            ? tr({
                es: `¡Encantada, ${userName}! Cuando sueltas el móvil, brillo y salgo de aventura.`,
                en: `Nice to meet you, ${userName}! When you put your phone down, I shine and go on adventures.`,
                zh: `很高兴认识你，${userName}！你放下手机，我就会发光，出去冒险。`,
                hi: `तुमसे मिलकर ख़ुशी हुई, ${userName}! जब तुम फ़ोन रखते हो, मैं चमकती हूँ और सफ़र पर निकलती हूँ।`,
                fr: `Enchantée, ${userName} ! Quand tu poses ton téléphone, je brille et je pars à l’aventure.`,
              })
            : tr({
                es: '¡Hola! Soy una lucecita. Cuando sueltas el móvil, brillo y salgo de aventura.',
                en: 'Hi! I’m a little light. When you put your phone down, I shine and go on adventures.',
                zh: '你好！我是一束小光。你放下手机，我就会发光，出去冒险。',
                hi: 'नमस्ते! मैं एक नन्ही रोशनी हूँ। जब तुम फ़ोन रखते हो, मैं चमकती हूँ और सफ़र पर निकलती हूँ।',
                fr: 'Coucou ! Je suis une petite lumière. Quand tu poses ton téléphone, je brille et je pars à l’aventure.',
              })}
        </SpeechBubble>
        <LumiAvatar state={LUMI_STATES.radiante} size={160} />
      </View>

      <View style={styles.fields}>
        <Field
          label={tr({
            es: '¿Cómo te llamas?',
            en: 'What’s your name?',
            zh: '你叫什么名字？',
            hi: 'तुम्हारा नाम क्या है?',
            fr: 'Comment tu t’appelles ?',
          })}
          placeholder={tr({
            es: 'Tu nombre',
            en: 'Your name',
            zh: '你的名字',
            hi: 'तुम्हारा नाम',
            fr: 'Ton prénom',
          })}
          value={draft.userName}
          onChangeText={(userName) => setDraft({ userName })}
          maxLength={NAME_MAX}
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
          label={tr({
            es: '¿Y cómo me llamas tú?',
            en: 'And what will you call me?',
            zh: '那你叫我什么呢？',
            hi: 'और तुम मुझे क्या बुलाओगे?',
            fr: 'Et toi, comment tu m’appelles ?',
          })}
          placeholder="Lampi"
          value={draft.lumiName}
          onChangeText={(lumiName) => setDraft({ lumiName })}
          maxLength={NAME_MAX}
          onFocus={revealFields}
          autoCapitalize="words"
          returnKeyType="done"
        />
        {apiAvailable ? (
          <SecondaryLink
            label={tr({
              es: '¿Ya tenías a Lampi? Entra en tu cuenta',
              en: 'Already had Lampi? Sign in',
              zh: '已经有 Lampi 了？登录账户',
              hi: 'पहले से Lampi है? अपने खाते में जाओ',
              fr: 'Tu avais déjà Lampi ? Connecte-toi',
            })}
            onPress={() => router.push('/cuenta?modo=entrar')}
          />
        ) : null}
      </View>
    </StepShell>
  );
}

/** El mundo del Hogar, oscurecido para que se lea bien el texto. */
function NightBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LivingBackground />
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
