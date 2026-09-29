import { createHmac, timingSafeEqual } from 'node:crypto';

import { tr } from '../i18n.js';

/**
 * Enlace para darse de baja de la lista de espera sin cuenta ni tokens
 * guardados: el token es una firma HMAC del correo con JWT_SECRET.
 */
export function unsubscribeToken(email: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`waitlist-unsubscribe:${email}`)
    .digest('base64url');
}

export function isValidUnsubscribeToken(
  email: string,
  token: string,
  secret: string,
): boolean {
  const expected = Buffer.from(unsubscribeToken(email, secret));
  const given = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export function unsubscribeUrl(
  base: string,
  email: string,
  secret: string,
): string {
  const params = new URLSearchParams({
    email,
    token: unsubscribeToken(email, secret),
  });
  return `${base}/waitlist/unsubscribe?${params}`;
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Página mínima con el tono de Lumi. `form`: botón para confirmar (GET no borra nada: los antivirus del correo abren los enlaces). */
export function unsubscribePage(
  kind: 'confirm' | 'done' | 'invalid',
  form?: { email: string; token: string },
): string {
  const title = {
    confirm: tr({
      es: '¿Te borramos de la lista?',
      en: 'Remove you from the list?',
      zh: '要把你从名单中移除吗？',
      hi: 'क्या तुम्हें सूची से हटा दें?',
      fr: 'On te retire de la liste ?',
    }),
    done: tr({
      es: 'Hecho. Ya no estás en la lista',
      en: 'Done. You’re off the list',
      zh: '好了。你已经不在名单上了',
      hi: 'हो गया। अब तुम सूची में नहीं हो',
      fr: 'C’est fait. Tu n’es plus sur la liste',
    }),
    invalid: tr({
      es: 'Este enlace no funciona',
      en: 'This link doesn’t work',
      zh: '这个链接无效',
      hi: 'यह लिंक काम नहीं करता',
      fr: 'Ce lien ne fonctionne pas',
    }),
  }[kind];
  const body = {
    confirm: tr({
      es: 'Borraremos tu correo y no te escribiremos más. Lumi lo entiende.',
      en: 'We’ll delete your email and won’t write again. Lumi understands.',
      zh: '我们会删除你的邮箱，不再给你写信。Lumi 能理解。',
      hi: 'हम तुम्हारा ईमेल मिटा देंगे और फिर नहीं लिखेंगे। Lumi समझती है।',
      fr: 'On supprime ton e-mail et on ne t’écrira plus. Lumi comprend.',
    }),
    done: tr({
      es: 'Hemos borrado tu correo. Si algún día quieres volver, Lumi te estará esperando.',
      en: 'We’ve deleted your email. If you ever want to come back, Lumi will be waiting.',
      zh: '我们已删除你的邮箱。如果有一天你想回来，Lumi 会一直等你。',
      hi: 'हमने तुम्हारा ईमेल मिटा दिया है। अगर कभी लौटना चाहो, Lumi तुम्हारा इंतज़ार करेगी।',
      fr: 'On a supprimé ton e-mail. Si un jour tu veux revenir, Lumi t’attendra.',
    }),
    invalid: tr({
      es: 'Puede que esté cortado. Copia el enlace completo del correo o escríbenos y te borramos a mano.',
      en: 'It may be cut off. Copy the full link from the email, or write to us and we’ll remove you by hand.',
      zh: '链接可能不完整。请复制邮件里的完整链接，或写信给我们，我们会手动移除。',
      hi: 'शायद लिंक अधूरा है। ईमेल से पूरा लिंक कॉपी करो, या हमें लिखो और हम ख़ुद हटा देंगे।',
      fr: 'Il est peut-être coupé. Copie le lien complet de l’e-mail, ou écris-nous et on te retire à la main.',
    }),
  }[kind];
  const button = tr({
    es: 'Sí, darme de baja',
    en: 'Yes, unsubscribe me',
    zh: '是的，退出名单',
    hi: 'हाँ, मेरा नाम हटाओ',
    fr: 'Oui, me désinscrire',
  });
  const action = form
    ? `<form method="post"><input type="hidden" name="email" value="${esc(form.email)}"><input type="hidden" name="token" value="${esc(form.token)}"><button style="margin-top:18px;padding:14px 22px;border:0;border-radius:999px;background:#FFC96B;color:#13112E;font-size:16px;font-weight:700">${esc(button)}</button></form>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lumi</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#13112E;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;padding:24px;box-sizing:border-box">
<main style="max-width:420px;background:#1B1840;border-radius:24px;padding:28px;color:#E6E0FB">
<p style="margin:0 0 14px;font-size:26px;font-weight:800;color:#FFE3A3;font-family:Georgia,serif">Lumi</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#F4F0FF;font-family:Georgia,serif">${esc(title)}</h1>
<p style="margin:0;font-size:16px;line-height:1.55">${esc(body)}</p>${action}
</main></body></html>`;
}
