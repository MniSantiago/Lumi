import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { setSoundsEnabled, sfx } from '@/sound';

const mockPlay = jest.fn();
jest.mock('expo-audio', () => ({
  setAudioModeAsync: () => Promise.resolve(),
  createAudioPlayer: () => ({ volume: 1, seekTo: () => Promise.resolve(), play: () => mockPlay() }),
}));

describe('sfx', () => {
  beforeEach(() => {
    mockPlay.mockReset();
    setSoundsEnabled(true);
  });

  it('suena con los sonidos activados', () => {
    sfx.tap();
    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it('no suena con «Sonidos» apagado', () => {
    setSoundsEnabled(false);
    sfx.reward();
    sfx.postcard();
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('no rompe si el audio falla', () => {
    mockPlay.mockImplementation(() => {
      throw new Error('sin salida de audio');
    });
    expect(() => sfx.arrival()).not.toThrow();
  });
});
