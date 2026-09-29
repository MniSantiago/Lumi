import { describe, expect, it, jest } from '@jest/globals';

import { nightlyCopy } from '@/nightly/copy';

describe('streakMilestone', () => {
  it('celebra solo las rachas redondas', () => {
    expect(nightlyCopy.streakMilestone(7)).toBe('✨ 7 días seguidos brillando. ¡Qué racha más bonita!');
    expect(nightlyCopy.streakMilestone(3)).not.toBeNull();
    for (const days of [0, 1, 2, 4, 6, 8, 29]) expect(nightlyCopy.streakMilestone(days)).toBeNull();
  });
});

describe('compartir postal', () => {
  it('sin dominio configurado, el texto va sin enlace', () => {
    const { siteLink, withSiteLink } = jest.requireActual<typeof import('@/constants/site')>('@/constants/site');
    expect(siteLink('postal')).toBe('');
    expect(withSiteLink('Hola', 'postal')).toBe('Hola');
  });

  it('con dominio, añade el enlace con su origen', () => {
    jest.resetModules();
    process.env.EXPO_PUBLIC_SITE_DOMAIN = 'lumi.app';
    const { withSiteLink } = jest.requireActual<typeof import('@/constants/site')>('@/constants/site');
    expect(withSiteLink('Hola', 'postal')).toBe('Hola\nhttps://lumi.app/?ref=postal');
    delete process.env.EXPO_PUBLIC_SITE_DOMAIN;
  });
});
