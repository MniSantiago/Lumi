import { withLang } from '../i18n.js';
import { accountDeletedMail, launchMail, waitlistWelcomeMail } from './templates.js';

describe('correos en cada idioma', () => {
  it('el aviso de lanzamiento lleva la tienda, la baja y el idioma pedido', () => {
    const mail = withLang('en', () => launchMail('https://apps.apple.com/app/id1', 'https://api.lumi/baja?x=1'));
    expect(mail.subject).toBe('Lampi is on the App Store! ✨');
    expect(mail.html).toContain('<html lang="en">');
    expect(mail.html).toContain('https://apps.apple.com/app/id1');
    expect(mail.text).toContain('Unsubscribe from the list: https://api.lumi/baja?x=1');
    expect(mail.headers?.['List-Unsubscribe']).toBe('<https://api.lumi/baja?x=1>');
  });

  it('sin enlace de baja, la bienvenida no lleva cabeceras de baja', () => {
    const mail = withLang('fr', () => waitlistWelcomeMail());
    expect(mail.subject).toBe('Tu es sur la liste de Lampi ! ✨');
    expect(mail.headers).toBeUndefined();
  });

  it('escapa el HTML de los enlaces', () => {
    const mail = withLang('es', () => launchMail('https://x/"><script>', 'https://y'));
    expect(mail.html).not.toContain('"><script>');
  });

  it('el texto plano no lleva entidades HTML del nombre', () => {
    const mail = withLang('es', () => accountDeletedMail('Tom & <Jerry>'));
    expect(mail.html).toContain('Tom &amp; &lt;Jerry&gt;');
    expect(mail.text).toContain('Tom & <Jerry>');
  });

  it('todas las plantillas hablan de Lampi, no de Lumi, en los 5 idiomas', () => {
    for (const lang of ['es', 'en', 'zh', 'hi', 'fr'] as const) {
      const mails = withLang(lang, () => [
        waitlistWelcomeMail('https://api/baja'),
        launchMail('https://apps.apple.com/app/id1', 'https://api/baja'),
        accountDeletedMail('Ana'),
      ]);
      for (const m of mails) {
        expect(m.subject + m.html + m.text).not.toMatch(/lumi/i);
        expect(m.subject + m.html).toContain('Lampi');
      }
    }
  });
});
