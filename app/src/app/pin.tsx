import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { ApiError } from '@/api/client';
import { FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { parentalCopy as c } from '@/parental/copy';
import { hoursLeft, isValidPin, isWeakPin, PIN_LENGTH, resetRemainingMs, sanitizePin } from '@/parental/pin';
import { useParental } from '@/parental/store';

type Mode = 'crear' | 'cambiar' | 'verificar' | 'quitar' | 'olvido';

const pinInput = {
  keyboardType: 'number-pad',
  secureTextEntry: true,
  maxLength: PIN_LENGTH,
  autoComplete: 'off',
  textContentType: 'none',
} as const;

/**
 * Hoja del PIN parental: crear, cambiar, verificar (desbloquea los ajustes protegidos),
 * quitar y recuperar el acceso. Se abre con `/pin?modo=...`.
 */
export default function PinSheet() {
  const params = useLocalSearchParams<{ modo?: string }>();
  const parental = useParental();
  const requested = (params.modo ?? 'verificar') as Mode;
  const [mode, setMode] = useState<Mode>(requested);

  // Sin PIN solo se puede crear; con PIN no se puede volver a crear sin cambiarlo.
  const effective: Mode = !parental.loaded ? mode : !parental.hasPin ? 'crear' : mode === 'crear' ? 'cambiar' : mode;

  switch (effective) {
    case 'crear':
      return <CreateOrChange />;
    case 'cambiar':
      return <CreateOrChange changing />;
    case 'quitar':
      return <VerifyForm remove onForgot={() => setMode('olvido')} />;
    case 'olvido':
      return <ForgotForm />;
    default:
      return <VerifyForm onForgot={() => setMode('olvido')} />;
  }
}

/** Texto de error de un intento fallido (con los intentos que quedan o la espera). */
function failureMessage(res: { waitSeconds: number; attemptsLeft: number }) {
  return res.waitSeconds > 0 ? c.waitFor(res.waitSeconds) : c.wrong(res.attemptsLeft);
}

function VerifyForm({ remove, onForgot }: { remove?: boolean; onForgot: () => void }) {
  const parental = useParental();
  const [pin, setPin] = useState('');
  const { busy, error, setError, run } = useSubmit();

  const submit = () =>
    run(async () => {
      const res = remove ? await parental.check(pin) : await parental.verify(pin);
      if (!res.ok) {
        setPin('');
        setError(failureMessage(res));
        return;
      }
      if (remove) {
        await parental.removePin();
        closeSheet();
        return;
      }
      // Cerramos primero y luego se hace lo que estaba esperando el PIN (el cambio de ajuste).
      const pending = parental.takePending();
      closeSheet();
      pending?.();
    });

  return (
    <Sheet
      title={remove ? c.removeTitle : c.verifyTitle}
      subtitle={remove ? c.removeSub : c.verifySub}
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={busy ? c.busy : remove ? c.remove : c.continue}
            onPress={submit}
            disabled={busy || !isValidPin(pin)}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={c.pinLabel}
          placeholder={c.pinPlaceholder}
          value={pin}
          onChangeText={(t) => setPin(sanitizePin(t))}
          {...pinInput}
          secretKind="pin"
          autoFocus
          returnKeyType="go"
          onSubmitEditing={() => isValidPin(pin) && submit()}
        />
        <SecondaryLink label={c.forgot} onPress={onForgot} />
      </View>
    </Sheet>
  );
}

/** Crear el PIN (con confirmación) o cambiarlo (pidiendo antes el actual). */
function CreateOrChange({ changing }: { changing?: boolean }) {
  const parental = useParental();
  const [current, setCurrent] = useState('');
  const [pin, setPin] = useState('');
  const [again, setAgain] = useState('');
  const pinRef = useRef<TextInput>(null);
  const againRef = useRef<TextInput>(null);
  const { busy, error, setError, run } = useSubmit();

  const ready = isValidPin(pin) && isValidPin(again) && (!changing || isValidPin(current));

  const submit = () =>
    run(async () => {
      if (pin !== again) return setError(c.mismatch);
      if (isWeakPin(pin)) return setError(c.weak);
      if (changing) {
        const res = await parental.check(current);
        if (!res.ok) {
          setCurrent('');
          return setError(failureMessage(res));
        }
      }
      await parental.setPin(pin);
      closeSheet();
    });

  return (
    <Sheet
      title={changing ? c.changeTitle : c.createTitle}
      subtitle={changing ? c.changeSub : c.createSub}
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton label={busy ? c.busy : c.save} onPress={submit} disabled={busy || !ready} />
        </>
      }>
      <View style={{ gap: 16 }}>
        {changing ? (
          <Field
            label={c.currentPin}
            placeholder={c.pinPlaceholder}
            value={current}
            onChangeText={(t) => setCurrent(sanitizePin(t))}
            {...pinInput}
          secretKind="pin"
            autoFocus
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => pinRef.current?.focus()}
          />
        ) : null}
        <Field
          ref={pinRef}
          label={changing ? c.newPin : c.pinLabel}
          placeholder={c.pinPlaceholder}
          value={pin}
          onChangeText={(t) => setPin(sanitizePin(t))}
          {...pinInput}
          secretKind="pin"
          autoFocus={!changing}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => againRef.current?.focus()}
        />
        <Field
          ref={againRef}
          label={c.repeatPin}
          placeholder={c.pinPlaceholder}
          value={again}
          onChangeText={(t) => setAgain(sanitizePin(t))}
          {...pinInput}
          secretKind="pin"
          returnKeyType="go"
          onSubmitEditing={() => ready && submit()}
        />
      </View>
    </Sheet>
  );
}

/**
 * Recuperación. Con cuenta de Lampi: la contraseña de la cuenta quita el PIN (el menor no la
 * conoce, o ya tiene el poder de todos modos). Sin cuenta: se pide y se puede quitar a las 24 h.
 */
function ForgotForm() {
  const parental = useParental();
  const { user, signIn } = useSession();
  const [password, setPassword] = useState('');
  const { busy, error, setError, run } = useSubmit();
  const [now, setNow] = useState(() => Date.now());

  // Refresca la cuenta atrás mientras la hoja está abierta.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (user) {
    const submit = () =>
      run(async () => {
        try {
          await signIn(user.email, password);
        } catch (e) {
          if (e instanceof ApiError && e.status !== 401 && e.status !== 400) throw e;
          setPassword('');
          setError(c.accountWrong);
          return;
        }
        await parental.removePin();
        closeSheet();
      });
    return (
      <Sheet
        title={c.forgotTitle}
        subtitle={c.forgotAccountSub}
        footer={
          <>
            <FormError message={error} />
            <PrimaryButton label={busy ? c.busy : c.remove} onPress={submit} disabled={busy || password.length === 0} />
          </>
        }>
        <Field
          label={c.accountPassword}
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => password && submit()}
        />
      </Sheet>
    );
  }

  const remaining = resetRemainingMs(parental.resetRequestedAt, now);
  const ready = remaining === 0;
  return (
    <Sheet
      title={c.forgotTitle}
      subtitle={c.forgotNoAccountSub}
      footer={
        <PrimaryButton
          label={ready ? c.remove : c.askReset}
          onPress={() =>
            void (ready
              ? parental.removePin().then(closeSheet)
              : parental.requestReset().then(() => setNow(Date.now())))
          }
          disabled={remaining != null && remaining > 0}
        />
      }>
      {remaining != null ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary }}>
          {ready ? c.resetReady : c.resetPending(hoursLeft(remaining))}
        </Text>
      ) : null}
    </Sheet>
  );
}
