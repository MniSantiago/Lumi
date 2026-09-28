/**
 * Correos de Lumi. Mismo tono que la app: habla Lumi, con cariño y sin prisas.
 * HTML sencillo con estilos en línea (lo que mejor aguantan los clientes de correo).
 */

export type MailContent = { subject: string; html: string; text: string };

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function layout(title: string, paragraphs: string[], code?: string) {
  const body = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#E6E0FB">${p}</p>`,
    )
    .join('');
  const codeBlock = code
    ? `<p style="margin:22px 0;text-align:center"><span style="display:inline-block;padding:14px 22px;border-radius:14px;background:#2A2560;border:1px solid #8C7BD8;font-size:30px;letter-spacing:8px;font-weight:700;color:#FFE3A3;font-family:ui-monospace,Menlo,monospace">${code}</span></p>`
    : '';
  return `<!doctype html><html lang="es"><body style="margin:0;background:#13112E;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#1B1840;border-radius:24px;padding:28px" cellpadding="0" cellspacing="0"><tr><td>
<p style="margin:0 0 18px;font-size:26px;font-weight:800;color:#FFE3A3;font-family:Georgia,serif">Lumi</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F4F0FF;font-family:Georgia,serif">${title}</h1>
${body}${codeBlock}
<p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#A69FD8">Si no has sido tú, puedes ignorar este correo. Tu cuenta sigue a salvo.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export function verifyEmailMail(code: string, name: string): MailContent {
  const hi = name ? `¡Hola, ${esc(name)}!` : '¡Hola!';
  return {
    subject: `${code} es tu código para Lumi`,
    html: layout(
      hi,
      [
        'Para confirmar tu correo, escribe este código en la app. Caduca en 15 minutos.',
      ],
      code,
    ),
    text: `${hi}\n\nPara confirmar tu correo, escribe este código en la app: ${code}\nCaduca en 15 minutos.\n\nSi no has sido tú, ignora este correo.`,
  };
}

export function resetPasswordMail(code: string, name: string): MailContent {
  const hi = name
    ? `${esc(name)}, ¿se te olvidó la contraseña?`
    : '¿Se te olvidó la contraseña?';
  return {
    subject: `${code} es tu código para cambiar la contraseña`,
    html: layout(
      hi,
      [
        'No pasa nada, a Lumi también se le olvidan cosas. Escribe este código en la app para elegir una nueva. Caduca en 15 minutos.',
      ],
      code,
    ),
    text: `${hi}\n\nEscribe este código en la app para elegir una contraseña nueva: ${code}\nCaduca en 15 minutos.\n\nSi no has sido tú, ignora este correo.`,
  };
}

export function passwordChangedMail(name: string): MailContent {
  const hi = name
    ? `${esc(name)}, tu contraseña ha cambiado`
    : 'Tu contraseña ha cambiado';
  return {
    subject: 'Tu contraseña de Lumi ha cambiado',
    html: layout(hi, [
      'Te lo contamos por si acaso. Hemos cerrado la sesión en tus otros dispositivos.',
    ]),
    text: `${hi}.\n\nHemos cerrado la sesión en tus otros dispositivos. Si no has sido tú, responde a este correo.`,
  };
}

export function accountDeletedMail(name: string): MailContent {
  const hi = name ? `Hasta pronto, ${esc(name)}` : 'Hasta pronto';
  return {
    subject: 'Tu cuenta de Lumi se ha eliminado',
    html: layout(hi, [
      'Hemos borrado tu cuenta y todos sus datos. Lumi se queda con un recuerdo bonito de vosotros. Si algún día vuelves, te estará esperando.',
    ]),
    text: `${hi}.\n\nHemos borrado tu cuenta y todos sus datos. Si algún día vuelves, Lumi te estará esperando.`,
  };
}
