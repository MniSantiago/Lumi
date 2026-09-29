import { describe, expect, it } from '@jest/globals';

import { nightlyCopy } from '@/nightly/copy';

describe('streakMilestone', () => {
  it('celebra solo las rachas redondas', () => {
    expect(nightlyCopy.streakMilestone(7)).toBe('✨ 7 días seguidos brillando. ¡Qué racha más bonita!');
    expect(nightlyCopy.streakMilestone(3)).not.toBeNull();
    for (const days of [0, 1, 2, 4, 6, 8, 29]) expect(nightlyCopy.streakMilestone(days)).toBeNull();
  });
});
