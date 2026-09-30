import { langFrom, translateMessage } from './i18n.js';

describe('langFrom', () => {
  it('elige el idioma con más peso que Lampi habla', () => {
    expect(langFrom('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr');
    expect(langFrom('de-DE,de;q=0.9,zh-CN;q=0.8,en;q=0.5')).toBe('zh');
    expect(langFrom('en;q=0.2, hi;q=0.9')).toBe('hi');
    expect(langFrom('es')).toBe('es');
  });

  it('sin cabecera habla español; con un idioma desconocido, inglés', () => {
    expect(langFrom(undefined)).toBe('es');
    expect(langFrom('')).toBe('es');
    expect(langFrom('de-DE,ja;q=0.5')).toBe('en');
  });
});

describe('translateMessage', () => {
  it('traduce los mensajes conocidos y deja el resto', () => {
    expect(translateMessage('La sesión ha caducado', 'en')).toBe(
      'Your session has expired',
    );
    expect(translateMessage('La sesión ha caducado', 'es')).toBe(
      'La sesión ha caducado',
    );
    expect(translateMessage('Otro mensaje', 'fr')).toBe('Otro mensaje');
  });
});
