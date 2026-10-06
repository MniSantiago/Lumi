import { jest } from '@jest/globals';

// AsyncStorage en memoria para los tests (el reloj del juego lo importa).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Los tests hablan español (los textos de referencia están en español).
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'es', languageTag: 'es-ES' }],
}));

// Sin audio nativo en los tests: el módulo de sonidos solo necesita un reproductor que no haga nada.
jest.mock('expo-audio', () => ({
  setAudioModeAsync: () => Promise.resolve(),
  createAudioPlayer: () => ({ volume: 1, seekTo: () => Promise.resolve(), play: () => {} }),
}));
