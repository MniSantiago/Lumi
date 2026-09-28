import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fireflies } from '@/components/fireflies';
import { NightPostcard } from '@/components/nightly/night-postcard';
import { buildTimeline, stageProgress, useReveal } from '@/components/nightly/reveal';
import { CardIn, FadeUp, RewardTile, SparksCounter } from '@/components/nightly/reveal-parts';
import { ShieldButton } from '@/components/shield/shield-parts';
import { Colors, Fonts } from '@/constants/theme';
import { POSTCARDS, type Postcard } from '@/lumi/data';
import { useLumi } from '@/lumi/store';
import { nightlyCopy as copy, shareReread, shareTonight } from '@/nightly/copy';
import { TONIGHT } from '@/nightly/tonight';

/** Cuánto se queda la despedida en pantalla antes de cerrar. */
const GOODBYE_MS = 1500;
const TILT = -2.5;
const easeOut = Easing.out(Easing.cubic);

/**
 * La postal nocturna: Lumi vuelve de su expedición con una postal, un trozo de
 * historia y lo que lleva en el bolsillo. Param opcional `id` de `POSTCARDS`:
 * relectura tranquila de una postal ya recibida, sin la secuencia de premios.
 */
export default function PostcardScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postcard = id ? POSTCARDS.find((p) => p.id === id) : undefined;
  return postcard ? <RereadPostcard postcard={postcard} /> : <TonightPostcard />;
}

function TonightPostcard() {
  const { settings } = useLumi();
  const insets = useSafeAreaInsets();
  const { cardWidth, window } = useSizes();
  const artHeight = Math.round(Math.min(cardWidth * 0.62, window.height * 0.21));

  const rewards = useMemo(
    () => [
      ...TONIGHT.keepsakes.map((k) => ({ key: k.item.id, icon: k.item.icon, name: k.item.name, badge: undefined })),
      ...(TONIGHT.newFriend
        ? [{ key: TONIGHT.newFriend.id, icon: TONIGHT.newFriend.icon, name: TONIGHT.newFriend.name, badge: copy.newFriend }]
        : []),
    ],
    [],
  );
  const timeline = useMemo(() => buildTimeline(rewards.length), [rewards.length]);
  const { t, done, skip } = useReveal(timeline.end, true);

  const [saved, setSaved] = useState(false);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onSave = () => {
    if (busy.current) return;
    busy.current = true;
    setSaved(true);
    AccessibilityInfo.announceForAccessibility(copy.saved);
    timer.current = setTimeout(close, GOODBYE_MS);
  };

  const actionsStyle = useAnimatedStyle(() => {
    const p = easeOut(stageProgress(t.value, timeline.actions));
    return { opacity: p, transform: [{ translateY: 12 * (1 - p) }] };
  });
  const hintStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * stageProgress(t.value, timeline.header) * (1 - stageProgress(t.value, timeline.actions)),
  }));

  return (
    <Pressable style={styles.screen} onPress={skip} disabled={done} accessible={false}>
      <View pointerEvents="none" style={styles.background} />
      <Fireflies glow={1} count={14} />

      <ScrollView
          style={styles.fill}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
          showsVerticalScrollIndicator={false}>
          <FadeUp t={t} stage={timeline.header} style={styles.headerPill}>
            <Text style={styles.headerText}>{copy.header(settings.lumiName)}</Text>
          </FadeUp>

          <CardIn t={t} stage={timeline.card} tilt={TILT}>
            <NightPostcard
              title={TONIGHT.zone}
              caption={TONIGHT.caption}
              art={TONIGHT.art}
              width={cardWidth}
              artHeight={artHeight}
              stamp={`Cap. ${TONIGHT.chapter}`}
            />
          </CardIn>

          <FadeUp t={t} stage={timeline.story} style={styles.story}>
            <Text style={styles.chapter}>{copy.chapter(TONIGHT.chapter, TONIGHT.chapterTitle)}</Text>
            <Text style={styles.storyText}>{TONIGHT.story}</Text>
          </FadeUp>

          <View style={styles.rewards}>
            <FadeUp t={t} stage={timeline.rewards[0] ?? timeline.story} lift={4}>
              <Text style={styles.label}>{copy.broughtLabel}</Text>
            </FadeUp>
            <View style={styles.rewardRow}>
              {rewards.map((r, i) => (
                <RewardTile key={r.key} t={t} stage={timeline.rewards[i]} icon={r.icon} name={r.name} badge={r.badge} />
              ))}
            </View>
            <SparksCounter t={t} stage={timeline.sparks} total={TONIGHT.sparks} unit={copy.sparksUnit} />
          </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <Animated.Text pointerEvents="none" style={[styles.hint, hintStyle]}>
          {copy.skipHint}
        </Animated.Text>
        <Animated.View style={[styles.actions, actionsStyle]} pointerEvents={done && !saved ? 'auto' : 'none'}>
          {saved ? (
            <Text style={styles.saved}>{copy.saved}</Text>
          ) : (
            <>
              <ShieldButton label={copy.save} onPress={onSave} disabled={!done} />
              <ShieldButton
                ghost
                label={copy.share}
                onPress={() => share(shareTonight(settings.lumiName, TONIGHT))}
                disabled={!done}
              />
            </>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

function RereadPostcard({ postcard }: { postcard: Postcard }) {
  const { settings } = useLumi();
  const insets = useSafeAreaInsets();
  const { cardWidth, window } = useSizes();
  const artHeight = Math.round(Math.min(cardWidth * 0.72, window.height * 0.3));

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.background} />
      <Fireflies glow={0.7} count={10} />

      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.rereadHeader}>
          <Text style={styles.label}>{copy.chapter(postcard.chapter)}</Text>
          <Text style={styles.rereadTitle}>{copy.rereadHeader(postcard.place)}</Text>
        </View>

        <View style={{ transform: [{ rotate: `${TILT}deg` }] }}>
          <NightPostcard
            title={postcard.place}
            caption={postcard.quote}
            art={postcard.art}
            width={cardWidth}
            artHeight={artHeight}
            stamp={`Cap. ${postcard.chapter}`}
          />
        </View>

        <View style={styles.story}>
          <Text style={styles.quote}>«{postcard.quote}»</Text>
          <Text style={styles.signature}>— {settings.lumiName}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <View style={styles.actions}>
          <ShieldButton label={copy.close} onPress={close} />
          <ShieldButton ghost label={copy.share} onPress={() => share(shareReread(settings.lumiName, postcard))} />
        </View>
      </View>
    </View>
  );
}

function useSizes() {
  const window = useWindowDimensions();
  return { window, cardWidth: Math.min(window.width - 64, 340) };
}

async function share(message: string) {
  try {
    await Share.share({ message });
  } catch {
    // Si no se puede compartir, no pasa nada: la postal sigue aquí.
  }
}

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  fill: { flex: 1 },
  // Noche con un halo ámbar donde aterriza la postal y un toque lavanda arriba.
  background: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 340px 300px at 50% 32%, rgba(255, 201, 107, 0.16) 0%, transparent 70%), radial-gradient(ellipse 420px 260px at 50% -40px, rgba(140, 123, 216, 0.35) 0%, transparent 70%), linear-gradient(180deg, #100E28, ${Colors.night})`,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 20,
  },
  headerPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: 'rgba(42, 37, 96, 0.5)',
  },
  headerText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, lineHeight: 18, color: Colors.lavenderPale },
  story: { alignItems: 'center', gap: 6, maxWidth: 340 },
  chapter: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11.5,
    lineHeight: 15,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.amberPale,
    textAlign: 'center',
  },
  storyText: {
    fontFamily: Fonts.display,
    fontSize: 16.5,
    lineHeight: 23,
    color: Colors.text,
    textAlign: 'center',
  },
  rewards: { alignItems: 'center', gap: 12 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  rewardRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  bottom: { paddingHorizontal: 28, paddingTop: 8 },
  actions: { gap: 10, minHeight: 110, justifyContent: 'center' },
  hint: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 110,
    textAlignVertical: 'center',
    lineHeight: 110,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  saved: {
    fontFamily: Fonts.display,
    fontSize: 21,
    lineHeight: 28,
    color: Colors.amberPale,
    textAlign: 'center',
  },
  rereadHeader: { alignItems: 'center', gap: 6 },
  rereadTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    lineHeight: 31,
    color: Colors.text,
    textAlign: 'center',
  },
  quote: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 27,
    color: Colors.lavenderPale,
    textAlign: 'center',
  },
  signature: { fontFamily: Fonts.bodyMedium, fontSize: 14, lineHeight: 20, color: Colors.amberPale },
});
