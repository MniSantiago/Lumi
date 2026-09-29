import { Capsule, HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { containerBackground, font, foregroundStyle, frame, padding, widgetURL } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

/** Lo que la app le pasa al widget (ver `widget/sync.tsx`). */
export type LumiWidgetProps = {
  lumiName: string;
  /** "Radiante", "Contenta"… */
  label: string;
  /** 'radiante' | 'contenta' | 'cansada' | 'apagadita' */
  stateKey: string;
  /** Tramos de luz encendidos, 1-4. */
  lit: number;
  /** "Explorando el Bosque de Musgo", "Se queda en casa"… */
  status: string;
};

/**
 * El widget de Lumi: su luz de hoy de un vistazo (BRIEF.md, "Superficies clave").
 *
 * La directiva 'widget' hace que Babel convierta esta función en código que
 * se ejecuta dentro de la extensión, sin el resto de la app: por eso los
 * colores y los símbolos van escritos aquí dentro, y los componentes de
 * `@expo/ui` llegan como globales.
 */
function LumiWidgetLayout(props: LumiWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const amber = '#FFC96B';
  const lavender = '#C9BFF2';
  const text = '#F4F0FF';
  const off = '#3A3380';
  const symbol =
    props.stateKey === 'radiante'
      ? 'sun.max.fill'
      : props.stateKey === 'contenta'
        ? 'sparkles'
        : props.stateKey === 'cansada'
          ? 'moon.haze.fill'
          : 'moon.zzz.fill';
  const glow = props.lit >= 3 ? amber : lavender;
  const background = containerBackground(
    { type: 'linearGradient', colors: ['#2A2560', '#13112E'], startPoint: { x: 0.5, y: 0 }, endPoint: { x: 0.5, y: 1 } },
    'widget',
  );
  const segments = (
    <HStack spacing={4}>
      {[1, 2, 3, 4].map((i) => (
        <Capsule key={i} modifiers={[foregroundStyle(i <= props.lit ? amber : off), frame({ height: 6 })]} />
      ))}
    </HStack>
  );

  // Pantalla de bloqueo, redondo: solo el símbolo.
  if (environment.widgetFamily === 'accessoryCircular') {
    return <Image systemName={symbol} size={26} modifiers={[widgetURL('lumi://')]} />;
  }

  if (environment.widgetFamily === 'systemMedium') {
    return (
      <HStack spacing={16} modifiers={[background, padding({ all: 16 }), widgetURL('lumi://')]}>
        <Image systemName={symbol} size={52} color={glow} />
        <VStack alignment="leading" spacing={6}>
          <Text modifiers={[font({ size: 20, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>
            {props.lumiName}
          </Text>
          <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(glow)]}>{props.label}</Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(lavender)]}>{props.status}</Text>
          <Spacer />
          {segments}
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={6} modifiers={[background, padding({ all: 14 }), widgetURL('lumi://')]}>
      <HStack>
        <Image systemName={symbol} size={30} color={glow} />
        <Spacer />
      </HStack>
      <Spacer />
      <Text modifiers={[font({ size: 17, weight: 'bold', design: 'rounded' }), foregroundStyle(text)]}>
        {props.lumiName}
      </Text>
      <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(glow)]}>{props.label}</Text>
      {segments}
    </VStack>
  );
}

export const lumiWidget = createWidget<LumiWidgetProps>('LumiWidget', LumiWidgetLayout);
