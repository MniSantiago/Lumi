import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from 'react-native';

import { haptic } from '@/haptics';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { tr } from '@/i18n';
import type { ThiefApp } from '@/lumi/data';

/* Listas con el mismo aspecto que las de Ajustes. */

export function List({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

export function Row({ children, last }: { children: ReactNode; last?: boolean }) {
  return <View style={[styles.row, !last && styles.rowDivider]}>{children}</View>;
}

export function Label({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.lbl}>
      <Text style={styles.lblTitle}>{title}</Text>
      {sub ? <Text style={styles.lblSub}>{sub}</Text> : null}
    </View>
  );
}

/** Icono provisional de app: letra blanca sobre el color de la marca. */
export function AppIcon({ app }: { app: ThiefApp }) {
  return (
    <View style={[styles.ic, { experimental_backgroundImage: app.icon }]}>
      <Text style={[styles.icLetter, app.ink ? { color: app.ink } : null]}>{app.letter}</Text>
    </View>
  );
}

/** Fila seleccionable, como una celda del `FamilyActivityPicker`. */
export function SelectRow({
  app,
  selected,
  onToggle,
  last,
}: {
  app: ThiefApp;
  selected: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={app.name}
      accessibilityHint={app.note}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, !last && styles.rowDivider, pressed && styles.rowPressed]}>
      <AppIcon app={app} />
      <Label title={app.name} sub={app.note} />
      <View style={[styles.check, selected ? styles.checkOn : styles.checkOff]}>
        {selected ? <SymbolView name="checkmark" size={13} weight="bold" tintColor={Colors.onAmber} /> : null}
      </View>
    </Pressable>
  );
}

export function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
  canDecrease = true,
  canIncrease = true,
  decreaseLabel,
  increaseLabel,
}: {
  /** Qué se ajusta. Con VoiceOver, el control es uno solo: se sube y se baja deslizando. */
  label: string;
  value: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease?: boolean;
  canIncrease?: boolean;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  return (
    <View
      style={styles.stepper}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      accessibilityHint={`${decreaseLabel} · ${increaseLabel}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && canIncrease) onIncrease();
        if (e.nativeEvent.actionName === 'decrement' && canDecrease) onDecrease();
      }}>
      <StepButton
        label="−"
        a11y={decreaseLabel}
        disabled={!canDecrease}
        onPress={() => {
          haptic.selection();
          onDecrease();
        }}
      />
      <Text style={styles.stepValue} maxFontSizeMultiplier={1.6}>
        {value}
      </Text>
      <StepButton
        label="+"
        a11y={increaseLabel}
        disabled={!canIncrease}
        onPress={() => {
          haptic.selection();
          onIncrease();
        }}
      />
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
  a11y,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  a11y: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.stepBtn, disabled && { opacity: 0.35 }, pressed && { opacity: 0.7 }]}>
      <Text style={styles.stepBtnText}>{label}</Text>
    </Pressable>
  );
}

/** Interruptor del tema (violeta encendido). */
export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.violet, false: 'rgba(201, 191, 242, 0.25)' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="rgba(201, 191, 242, 0.25)"
    />
  );
}

/** Largo máximo de los nombres (el tuyo y el de Lumi): caben en la cabecera, el escudo y las postales. La API admite 40 y 24. */
export const NAME_MAX = 24;

/** Campo de texto del tema: tarjeta redondeada, borde fino y ámbar al enfocar. */
export function Field({
  label,
  ref,
  onFocus,
  onBlur,
  ...input
}: TextInputProps & { label: string; ref?: Ref<TextInput> }) {
  const [focused, setFocused] = useState(false);
  // Las contraseñas se pueden enseñar un momento para comprobar lo escrito.
  const secret = !!input.secureTextEntry;
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.fieldHead}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {secret ? (
          <Pressable
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={
              revealed
                ? tr({
                    es: 'Ocultar la contraseña',
                    en: 'Hide password',
                    zh: '隐藏密码',
                    hi: 'पासवर्ड छिपाओ',
                    fr: 'Masquer le mot de passe',
                  })
                : tr({
                    es: 'Mostrar la contraseña',
                    en: 'Show password',
                    zh: '显示密码',
                    hi: 'पासवर्ड दिखाओ',
                    fr: 'Afficher le mot de passe',
                  })
            }
            onPress={() => setRevealed((r) => !r)}>
            <Text style={styles.fieldToggle}>
              {revealed
                ? tr({ es: 'Ocultar', en: 'Hide', zh: '隐藏', hi: 'छिपाओ', fr: 'Masquer' })
                : tr({ es: 'Mostrar', en: 'Show', zh: '显示', hi: 'दिखाओ', fr: 'Afficher' })}
            </Text>
          </Pressable>
        ) : null}
      </View>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor={Colors.textTertiary}
        selectionColor={Colors.amber}
        cursorColor={Colors.amber}
        keyboardAppearance="dark"
        autoCorrect={false}
        {...input}
        secureTextEntry={secret && !revealed}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused]}
      />
    </View>
  );
}

/** Bocadillo de Lumi, como el del Hogar. */
export function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bubble}>
      <Text style={styles.bubbleText}>{children}</Text>
      <View style={styles.bubbleTail} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  rowPressed: { backgroundColor: 'rgba(201, 191, 242, 0.08)' },
  ic: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icLetter: { fontFamily: Fonts.bodyBold, fontSize: 13, color: '#FFFFFF' },
  lbl: { flex: 1, minWidth: 0 },
  lblTitle: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 20, color: Colors.text },
  lblSub: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16, color: Colors.textTertiary },
  check: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: Colors.amber, boxShadow: `0 0 10px ${Colors.amber}66` },
  checkOff: { borderWidth: 1.5, borderColor: 'rgba(201, 191, 242, 0.35)' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: 'rgba(201, 191, 242, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontFamily: Fonts.body, fontSize: 17, lineHeight: 20, color: Colors.text },
  stepValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.text,
    minWidth: 50,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  fieldHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  fieldToggle: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.amberPale },
  fieldLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.lavenderPale },
  input: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    color: Colors.text,
  },
  inputFocused: { borderColor: 'rgba(255, 201, 107, 0.6)', boxShadow: '0 0 0 3px rgba(255, 201, 107, 0.12)' },
  bubble: {
    backgroundColor: Colors.lavenderPale,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 300,
    alignSelf: 'center',
  },
  bubbleText: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: Colors.night, textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: Colors.lavenderPale,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
});
