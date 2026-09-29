import { withLang } from '../i18n.js';
import { launchMail, waitlistWelcomeMail } from './templates.js';

describe('correos en cada idioma', () => {
  it('el aviso de lanzamiento lleva la tienda, la baja y el idioma pedido', () => {
    const mail = withLang('en', () => launchMail('https://apps.apple.com/app/id1', 'https://api.lumi/baja?x=1'));
    expect(mail.subject).toBe('Lumi is on the App Store! ✨');
    expect(mail.html).toContain('<html lang="en">');
    expect(mail.html).toContain('https://apps.apple.com/app/id1');
    expect(mail.text).toContain('Unsubscribe from the list: https://api.lumi/baja?x=1');
    expect(mail.headers?.['List-Unsubscribe']).toBe('<https://api.lumi/baja?x=1>');
  });

  it('sin enlace de baja, la bienvenida no lleva cabeceras de baja', () => {
    const mail = withLang('fr', () => waitlistWelcomeMail());
    expect(mail.subject).toBe('Tu es sur la liste de Lumi ! ✨');
    expect(mail.headers).toBeUndefined();
  });

  it('escapa el HTML de los enlaces', () => {
    const mail = withLang('es', () => launchMail('https://x/"><script>', 'https://y'));
    expect(mail.html).not.toContain('"><script>');
  });
});
