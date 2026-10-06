import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const FILES = {
  /** Tocar a Lampi. */
  tap: require('../assets/sounds/tap.wav'),
  /** Subir o bajar un valor. */
  select: require('../assets/sounds/select.wav'),
  /** Guardar, soltar la app, despertar a Lampi, empezar Plus. */
  success: require('../assets/sounds/success.wav'),
  /** Guardar la postal. */
  postcard: require('../assets/sounds/postcard.wav'),
  /** Un paso del tutorial que celebra. */
  reward: require('../assets/sounds/reward.wav'),
  /** Lampi vuelve de la expedición. */
  arrival: require('../assets/sounds/arrival.wav'),
} as const;

export type SoundName = keyof typeof FILES;

let enabled = true;
let configured = false;
const players = new Map<SoundName, AudioPlayer>();

/** Lo llama el store de ajustes: el interruptor «Sonidos» de Ajustes. */
export function setSoundsEnabled(on: boolean) {
  enabled = on;
}

function configure() {
  if (configured) return;
  configured = true;
  // Respeta el interruptor de silencio del iPhone y no corta la música ni el podcast del usuario.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
}

function play(name: SoundName, volume: number) {
  if (!enabled) return;
  try {
    configure();
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(FILES[name]);
      players.set(name, player);
    }
    player.volume = volume;
    void player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Sin audio (web, simulador sin salida…): la app sigue igual.
  }
}

/**
 * Sonidos de Lampi: campanitas suaves, solo en los momentos que cuentan, a
 * juego con `haptic`. Respetan el modo silencio y el ajuste «Sonidos».
 */
export const sfx = {
  tap: () => play('tap', 0.5),
  select: () => play('select', 0.35),
  success: () => play('success', 0.55),
  postcard: () => play('postcard', 0.6),
  reward: () => play('reward', 0.55),
  arrival: () => play('arrival', 0.6),
};
