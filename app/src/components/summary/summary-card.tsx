import { Image } from 'expo-image';
import { useMemo, type Ref } from 'react';
import { StyleSheet, Text, View, type TextProps } from 'react-native';

import { CollectionIcon } from '@/components/collection-icon';
import { Colors, Fonts } from '@/constants/theme';
import type { WeekDay } from '@/game/store';
import { SITE_DOMAIN } from '@/constants/site';

import type { Treasure, WeekSummary } from './week-summary';

/** Proporción de story (9:16). Todo se diseña sobre 360 × 640 unidades. */
export const CARD_ASPECT = 16 / 9;
const DESIGN_WIDTH = 360;

export type CardTheme = 'noche' | 'amanecer';

type Palette = {
  base: string;
  sky: (u: number) => string;
  ink: string;
  soft: string;
  faint: string;
  numeral: string;
  numeralGlow: string;
  halo: string;
  barLit: string;
  barGlow: string;
  barEmpty: string;
  barRest: string;
  today: string;
  accent: string;
  hairline: string;
  stars: boolean;
};

const PALETTES: Record<CardTheme, Palette> = {
  noche: {
    base: Colors.nightDeep,
    sky: (u) =>
      `radial-gradient(ellipse ${230 * u}px ${230 * u}px at 72% 40%, rgba(255, 201, 107, 0.2) 0%, transparent 70%), ` +
      `radial-gradient(ellipse ${420 * u}px ${300 * u}px at 15% -8%, rgba(140, 123, 216, 0.42) 0%, transparent 70%), ` +
      `linear-gradient(180deg, ${Colors.night} 0%, ${Colors.nightDeep} 58%, #0D0B24 100%)`,
    ink: Colors.text,
    soft: Colors.textSecondary,
    faint: Colors.textTertiary,
    numeral: Colors.amberPale,
    numeralGlow: 'rgba(255, 201, 107, 0.55)',
    halo: `radial-gradient(circle, ${Colors.amber}99 0%, ${Colors.amber}26 45%, transparent 70%)`,
    barLit: `linear-gradient(180deg, ${Colors.amberPale}, ${Colors.amber})`,
    barGlow: 'rgba(255, 201, 107, 0.45)',
    barEmpty: 'rgba(201, 191, 242, 0.14)',
    barRest: 'rgba(201, 191, 242, 0.45)',
    today: Colors.amberPale,
    accent: Colors.amber,
    hairline: 'rgba(201, 191, 242, 0.24)',
    stars: true,
  },
  amanecer: {
    base: '#FFE3C4',
    sky: (u) =>
      `radial-gradient(ellipse ${230 * u}px ${230 * u}px at 72% 40%, rgba(255, 255, 255, 0.55) 0%, transparent 70%), ` +
      `linear-gradient(180deg, #FFEDCB 0%, #FFD7B6 55%, #F6B8AA 100%)`,
    ink: Colors.night,
    soft: '#4A4278',
    faint: Colors.paperInk,
    numeral: Colors.indigo,
    numeralGlow: 'rgba(255, 255, 255, 0.8)',
    halo: `radial-gradient(circle, #FFFFFFCC 0%, ${Colors.amber}55 45%, transparent 70%)`,
    barLit: `linear-gradient(180deg, ${Colors.violet}, ${Colors.indigo})`,
    barGlow: 'rgba(42, 37, 96, 0.25)',
    barEmpty: 'rgba(42, 37, 96, 0.12)',
    barRest: 'rgba(42, 37, 96, 0.4)',
    today: '#5A48B8',
    accent: '#5A48B8',
    hairline: 'rgba(42, 37, 96, 0.22)',
    stars: false,
  },
};

/** Estrellas fijas del cielo (posición en %, radio en unidades). */
const STARS = Array.from({ length: 18 }, (_, i) => {
  const rnd = (n: number) => (Math.sin(i * 127.1 + n * 311.7) + 1) / 2;
  return {
    x: 4 + rnd(1) * 92,
    y: 2 + rnd(2) * 46,
    r: 0.7 + rnd(3) * 1.3,
    o: 0.35 + rnd(4) * 0.5,
  };
});

/** Texto de la tarjeta: tamaño fijo, sin escalar con la accesibilidad, para que la imagen salga igual siempre. */
function T(props: TextProps) {
  return <Text allowFontScaling={false} {...props} />;
}

/**
 * La tarjeta vertical del resumen semanal. Se pinta a su tamaño real de salida
 * (`width` en puntos) y es lo único que se captura: fondo sólido, sin esquinas
 * redondeadas, sin animaciones.
 */
export function SummaryCard({
  summary,
  width,
  theme = 'noche',
  ref,
}: {
  summary: WeekSummary;
  width: number;
  theme?: CardTheme;
  ref?: Ref<View>;
}) {
  const u = width / DESIGN_WIDTH;
  const p = PALETTES[theme];
  const s = useMemo(() => makeStyles(u, p), [u, p]);
  const { shone, mood, lumiName } = summary;

  return (
    <View ref={ref} collapsable={false} style={[s.card, { width, height: width * CARD_ASPECT }]}>
      <View pointerEvents="none" style={s.sky} />
      {p.stars
        ? STARS.map((st, i) => (
            <View
              key={i}
              style={[
                s.star,
                {
                  left: `${st.x}%`,
                  top: `${st.y}%`,
                  width: st.r * 2 * u,
                  height: st.r * 2 * u,
                  opacity: st.o,
                },
              ]}
            />
          ))
        : null}

      <View style={s.top}>
        <T style={s.range}>{summary.range}</T>
        {summary.streak >= 2 ? (
          <View style={s.streak}>
            <T style={s.streakText}>Racha de {summary.streak} días</T>
          </View>
        ) : null}
      </View>

      <T style={s.headline} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
        {`Mi semana\ncon ${lumiName}`}
      </T>

      <View style={s.hero}>
        <View style={s.heroText}>
          {shone > 0 ? <T style={s.numeral}>{shone}</T> : null}
          <T style={s.heroNote}>{shone > 0 ? 'de 7 días\nbrillando' : 'Nuestra semana\nacaba de empezar'}</T>
        </View>
        <View style={s.lumiWrap}>
          <View style={s.halo} />
          <Image
            source={mood.image}
            style={s.lumi}
            contentFit="contain"
            accessibilityLabel={`${lumiName}, ${mood.label.toLowerCase()}`}
          />
        </View>
      </View>

      <WeekBars week={summary.week} s={s} />

      <View style={s.keepsakes}>
        <Places summary={summary} s={s} />
        <TreasureView treasure={summary.treasure} s={s} />
      </View>

      <View style={s.spacer} />

      <View style={s.quoteBlock}>
        <T style={s.quote} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.8}>
          {summary.line}
        </T>
        <T style={s.signature}>— {lumiName}</T>
      </View>

      <View style={s.footer}>
        <View style={s.brand}>
          <View style={s.brandDot} />
          <T style={s.wordmark}>lumi</T>
        </View>
        <T style={s.tagline} numberOfLines={2}>
          Suelta el móvil y tu Lumi sale de aventura
        </T>
        {SITE_DOMAIN ? <T style={s.url}>{SITE_DOMAIN}</T> : null}
      </View>
    </View>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function WeekBars({ week, s }: { week: WeekDay[]; s: Styles }) {
  return (
    <View style={s.bars}>
      {week.map((d) => {
        const empty = d.lit === 0 && !d.restDay;
        return (
          <View key={d.date} style={s.barCol}>
            <View style={s.barTrack}>
              {d.restDay ? (
                <View style={[s.bar, s.barRest, { height: '30%' }]} />
              ) : d.future ? (
                <View style={s.barFuture} />
              ) : empty ? (
                <View style={[s.bar, s.barEmpty, { height: '14%' }]} />
              ) : (
                <View style={[s.bar, s.barLit, { height: `${(d.lit / 4) * 100}%` }]} />
              )}
            </View>
            <T style={[s.dayLabel, d.isToday && s.dayToday]}>{d.label}</T>
          </View>
        );
      })}
    </View>
  );
}

const TILTS = [-6, 4, -2];

function Places({ summary, s }: { summary: WeekSummary; s: Styles }) {
  const { places } = summary;
  const n = places.length;
  return (
    <View style={s.places}>
      <View style={s.fan}>
        {n === 0 ? (
          <View style={[s.mini, s.miniEmpty, { transform: [{ rotate: '-4deg' }] }]}>
            <T style={s.miniEmptyMark}>✦</T>
          </View>
        ) : (
          places.slice(0, 3).map((d, i) => (
            <View
              key={d.id}
              style={[s.mini, i > 0 && s.miniOverlap, { transform: [{ rotate: `${TILTS[i]}deg` }], zIndex: 3 - i }]}>
              <View style={[s.miniArt, { experimental_backgroundImage: d.art }]} />
              <T style={s.miniTitle} numberOfLines={2}>
                {d.name}
              </T>
            </View>
          ))
        )}
      </View>
      <T style={s.caption} numberOfLines={1}>
        {n === 0 ? 'Su primera postal, muy pronto' : n === 1 ? '1 postal esta semana' : `${n} postales esta semana`}
      </T>
    </View>
  );
}

function TreasureView({ treasure, s }: { treasure: Treasure; s: Styles }) {
  const caption =
    treasure.kind === 'stage'
      ? 'Su etapa de luz'
      : treasure.kind === 'friend'
        ? treasure.isNew
          ? 'Amistad nueva'
          : 'Amistad de la semana'
        : treasure.isNew
          ? 'Tesoro nuevo'
          : 'Tesoro de la semana';
  const name = treasure.kind === 'stage' ? treasure.name : treasure.entry.name;
  return (
    <View style={s.treasure}>
      {treasure.kind === 'stage' ? (
        <View style={[s.orb, { experimental_backgroundImage: treasure.orb }]} />
      ) : (
        <View style={s.orb}>
          <View style={s.orbGlow} />
          <CollectionIcon name={treasure.entry.icon} size={s.icon.width} />
        </View>
      )}
      <T style={s.treasureName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8}>
        {name}
      </T>
      <T style={s.caption}>{caption}</T>
    </View>
  );
}

function makeStyles(u: number, p: Palette) {
  const pad = 26 * u;
  return StyleSheet.create({
    card: {
      overflow: 'hidden',
      backgroundColor: p.base,
      paddingTop: 30 * u,
      paddingBottom: 22 * u,
      paddingHorizontal: pad,
    },
    sky: {
      position: 'absolute',
      inset: 0,
      experimental_backgroundImage: p.sky(u),
    },
    star: {
      position: 'absolute',
      borderRadius: 99 * u,
      backgroundColor: Colors.lavenderPale,
    },

    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 22 * u,
    },
    range: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 14 * u,
      lineHeight: 18 * u,
      color: p.soft,
    },
    streak: {
      borderRadius: 99 * u,
      borderWidth: Math.max(1, u),
      borderColor: p.hairline,
      paddingHorizontal: 10 * u,
      paddingVertical: 3 * u,
    },
    streakText: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 11.5 * u,
      lineHeight: 15 * u,
      color: p.soft,
    },

    headline: {
      marginTop: 8 * u,
      fontFamily: Fonts.displayExtraBold,
      fontSize: 36 * u,
      lineHeight: 38 * u,
      letterSpacing: -0.6 * u,
      color: p.ink,
    },

    hero: { height: 154 * u, marginTop: 14 * u },
    heroText: { position: 'absolute', left: 0, bottom: 4 * u },
    numeral: {
      marginLeft: -6 * u,
      fontFamily: Fonts.displayExtraBold,
      fontSize: 116 * u,
      lineHeight: 108 * u,
      letterSpacing: -6 * u,
      color: p.numeral,
      textShadowColor: p.numeralGlow,
      textShadowRadius: 28 * u,
      fontVariant: ['tabular-nums'],
    },
    heroNote: {
      fontFamily: Fonts.display,
      fontSize: 19 * u,
      lineHeight: 23 * u,
      color: p.ink,
    },
    lumiWrap: {
      position: 'absolute',
      right: -8 * u,
      bottom: -4 * u,
      width: 148 * u,
      height: 158 * u,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    halo: {
      position: 'absolute',
      width: 230 * u,
      height: 230 * u,
      bottom: -30 * u,
      borderRadius: 999 * u,
      experimental_backgroundImage: p.halo,
    },
    lumi: { width: 168 * u, height: 168 * u },

    bars: {
      flexDirection: 'row',
      gap: 10 * u,
      height: 70 * u,
      marginTop: 8 * u,
    },
    barCol: { flex: 1, alignItems: 'center', gap: 5 * u },
    barTrack: {
      flex: 1,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    bar: {
      width: '100%',
      maxWidth: 26 * u,
      borderRadius: 9 * u,
      borderCurve: 'continuous',
    },
    barLit: {
      experimental_backgroundImage: p.barLit,
      boxShadow: `0 0 ${12 * u}px ${p.barGlow}`,
    },
    barEmpty: { backgroundColor: p.barEmpty },
    barRest: {
      borderWidth: Math.max(1, u),
      borderStyle: 'dashed',
      borderColor: p.barRest,
    },
    barFuture: {
      width: 6 * u,
      height: 6 * u,
      borderRadius: 3 * u,
      borderWidth: Math.max(1, 0.8 * u),
      borderColor: p.barRest,
    },
    dayLabel: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 11.5 * u,
      lineHeight: 15 * u,
      color: p.faint,
    },
    dayToday: { color: p.today, fontFamily: Fonts.bodyBold },

    keepsakes: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 14 * u,
      marginTop: 20 * u,
    },
    places: { flex: 1, gap: 8 * u },
    fan: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 84 * u,
      paddingLeft: 2 * u,
    },
    mini: {
      width: 64 * u,
      padding: 4 * u,
      paddingBottom: 6 * u,
      borderRadius: 8 * u,
      borderCurve: 'continuous',
      backgroundColor: Colors.paper,
      boxShadow: `0 ${6 * u}px ${14 * u}px -${4 * u}px rgba(0, 0, 0, 0.45)`,
    },
    miniOverlap: { marginLeft: -12 * u },
    miniArt: { height: 44 * u, borderRadius: 5 * u, borderCurve: 'continuous' },
    miniTitle: {
      marginTop: 4 * u,
      height: 22 * u,
      fontFamily: Fonts.displayBold,
      fontSize: 9 * u,
      lineHeight: 11 * u,
      color: Colors.night,
    },
    miniEmpty: {
      height: 78 * u,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderWidth: Math.max(1, u),
      borderStyle: 'dashed',
      borderColor: p.barRest,
    },
    miniEmptyMark: { fontSize: 18 * u, lineHeight: 22 * u, color: p.faint },
    caption: {
      fontFamily: Fonts.body,
      fontSize: 11.5 * u,
      lineHeight: 15 * u,
      color: p.soft,
    },

    treasure: { width: 116 * u, alignItems: 'center', gap: 2 * u },
    orb: {
      width: 62 * u,
      height: 62 * u,
      borderRadius: 31 * u,
      alignItems: 'center',
      justifyContent: 'center',
    },
    orbGlow: {
      position: 'absolute',
      inset: 0,
      borderRadius: 31 * u,
      experimental_backgroundImage: p.halo,
    },
    icon: { width: 44 * u },
    treasureName: {
      marginTop: 4 * u,
      fontFamily: Fonts.displayBold,
      fontSize: 15 * u,
      lineHeight: 18 * u,
      color: p.ink,
      textAlign: 'center',
    },

    spacer: { flex: 1, minHeight: 10 * u },

    quoteBlock: { gap: 4 * u },
    quote: {
      fontFamily: Fonts.display,
      fontSize: 18 * u,
      lineHeight: 23 * u,
      color: p.ink,
    },
    signature: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 12.5 * u,
      lineHeight: 16 * u,
      color: p.accent,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10 * u,
      marginTop: 10 * u,
      paddingTop: 10 * u,
      borderTopWidth: Math.max(1, 0.8 * u),
      borderTopColor: p.hairline,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 5 * u },
    brandDot: {
      width: 9 * u,
      height: 9 * u,
      borderRadius: 5 * u,
      backgroundColor: Colors.amber,
      boxShadow: `0 0 ${8 * u}px ${Colors.amber}`,
    },
    wordmark: {
      fontFamily: Fonts.displayExtraBold,
      fontSize: 21 * u,
      lineHeight: 24 * u,
      letterSpacing: -0.4 * u,
      color: p.ink,
    },
    tagline: {
      flex: 1,
      fontFamily: Fonts.body,
      fontSize: 10.5 * u,
      lineHeight: 13 * u,
      color: p.soft,
    },
    url: {
      fontFamily: Fonts.bodySemiBold,
      fontSize: 11.5 * u,
      lineHeight: 15 * u,
      color: p.ink,
    },
  });
}
