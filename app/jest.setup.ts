import { jest } from '@jest/globals';

// AsyncStorage en memoria para los tests (el reloj del juego lo importa).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
