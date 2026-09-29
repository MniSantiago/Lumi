/**
 * Correos de Lumi. Mismo tono que la app: habla Lumi, con cariño y sin prisas.
 * HTML sencillo con estilos en línea (lo que mejor aguantan los clientes de correo).
 */

import { currentLang, tr } from '../i18n.js';

export type MailContent = {
  subject: string;
  html: string;
  text: string;
  /** Cabeceras extra (p. ej. List-Unsubscribe en la lista de espera). */
  headers?: Record<string, string>;
};

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const footer = () =>
  tr({
    es: 'Si no has sido tú, puedes ignorar este correo. Tu cuenta sigue a salvo.',
    en: 'If this wasn’t you, you can ignore this email. Your account is still safe.',
    zh: '如果不是你本人操作，可以忽略这封邮件。你的账户依然安全。',
    hi: 'अगर यह तुमने नहीं किया, तो इस ईमेल को अनदेखा कर सकते हो। तुम्हारा खाता सुरक्षित है।',
    fr: 'Si ce n’était pas toi, tu peux ignorer cet e-mail. Ton compte reste en sécurité.',
  });

const ignoreLine = () =>
  tr({
    es: 'Si no has sido tú, ignora este correo.',
    en: 'If this wasn’t you, ignore this email.',
    zh: '如果不是你本人操作，请忽略这封邮件。',
    hi: 'अगर यह तुमने नहीं किया, तो इस ईमेल को अनदेखा करो।',
    fr: 'Si ce n’était pas toi, ignore cet e-mail.',
  });

const expires = () =>
  tr({
    es: 'Caduca en 15 minutos.',
    en: 'It expires in 15 minutes.',
    zh: '15 分钟内有效。',
    hi: 'यह 15 मिनट में ख़त्म हो जाएगा।',
    fr: 'Il expire dans 15 minutes.',
  });

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
  return `<!doctype html><html lang="${currentLang()}"><body style="margin:0;background:#13112E;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#1B1840;border-radius:24px;padding:28px" cellpadding="0" cellspacing="0"><tr><td>
<p style="margin:0 0 18px;font-size:26px;font-weight:800;color:#FFE3A3;font-family:Georgia,serif">Lumi</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#F4F0FF;font-family:Georgia,serif">${title}</h1>
${body}${codeBlock}
<p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#A69FD8">${footer()}</p>
</td></tr></table></td></tr></table></body></html>`;
}

const hello = (name: string) =>
  name
    ? tr({
        es: `¡Hola, ${esc(name)}!`,
        en: `Hi, ${esc(name)}!`,
        zh: `你好，${esc(name)}！`,
        hi: `नमस्ते, ${esc(name)}!`,
        fr: `Coucou, ${esc(name)} !`,
      })
    : tr({
        es: '¡Hola!',
        en: 'Hi!',
        zh: '你好！',
        hi: 'नमस्ते!',
        fr: 'Coucou !',
      });

export function verifyEmailMail(code: string, name: string): MailContent {
  const hi = hello(name);
  const line = tr({
    es: 'Para confirmar tu correo, escribe este código en la app.',
    en: 'To confirm your email, enter this code in the app.',
    zh: '请在 App 中输入这个验证码，确认你的邮箱。',
    hi: 'अपना ईमेल पक्का करने के लिए, ऐप में यह कोड डालो।',
    fr: 'Pour confirmer ton e-mail, saisis ce code dans l’app.',
  });
  return {
    subject: tr({
      es: `${code} es tu código para Lumi`,
      en: `${code} is your Lumi code`,
      zh: `${code} 是你的 Lumi 验证码`,
      hi: `${code} तुम्हारा Lumi कोड है`,
      fr: `${code} est ton code pour Lumi`,
    }),
    html: layout(hi, [`${line} ${expires()}`], code),
    text: `${hi}\n\n${line} ${code}\n${expires()}\n\n${ignoreLine()}`,
  };
}

export function resetPasswordMail(code: string, name: string): MailContent {
  const hi = name
    ? tr({
        es: `${esc(name)}, ¿se te olvidó la contraseña?`,
        en: `${esc(name)}, forgot your password?`,
        zh: `${esc(name)}，忘记密码了吗？`,
        hi: `${esc(name)}, पासवर्ड भूल गए?`,
        fr: `${esc(name)}, tu as oublié ton mot de passe ?`,
      })
    : tr({
        es: '¿Se te olvidó la contraseña?',
        en: 'Forgot your password?',
        zh: '忘记密码了吗？',
        hi: 'पासवर्ड भूल गए?',
        fr: 'Tu as oublié ton mot de passe ?',
      });
  const line = tr({
    es: 'Escribe este código en la app para elegir una contraseña nueva.',
    en: 'Enter this code in the app to choose a new password.',
    zh: '在 App 中输入这个验证码，设置新密码。',
    hi: 'नया पासवर्ड चुनने के लिए ऐप में यह कोड डालो।',
    fr: 'Saisis ce code dans l’app pour choisir un nouveau mot de passe.',
  });
  const comfort = tr({
    es: 'No pasa nada, a Lumi también se le olvidan cosas.',
    en: 'No worries, Lumi forgets things too.',
    zh: '没关系，Lumi 也会忘事。',
    hi: 'कोई बात नहीं, Lumi भी चीज़ें भूल जाती है।',
    fr: 'Pas de souci, Lumi aussi oublie des choses.',
  });
  return {
    subject: tr({
      es: `${code} es tu código para cambiar la contraseña`,
      en: `${code} is your code to change your password`,
      zh: `${code} 是你修改密码的验证码`,
      hi: `${code} पासवर्ड बदलने का तुम्हारा कोड है`,
      fr: `${code} est ton code pour changer le mot de passe`,
    }),
    html: layout(hi, [`${comfort} ${line} ${expires()}`], code),
    text: `${hi}\n\n${line} ${code}\n${expires()}\n\n${ignoreLine()}`,
  };
}

export function passwordChangedMail(name: string): MailContent {
  const hi = name
    ? tr({
        es: `${esc(name)}, tu contraseña ha cambiado`,
        en: `${esc(name)}, your password has changed`,
        zh: `${esc(name)}，你的密码已修改`,
        hi: `${esc(name)}, तुम्हारा पासवर्ड बदल गया है`,
        fr: `${esc(name)}, ton mot de passe a changé`,
      })
    : tr({
        es: 'Tu contraseña ha cambiado',
        en: 'Your password has changed',
        zh: '你的密码已修改',
        hi: 'तुम्हारा पासवर्ड बदल गया है',
        fr: 'Ton mot de passe a changé',
      });
  const signedOut = tr({
    es: 'Hemos cerrado la sesión en tus otros dispositivos.',
    en: 'We’ve signed you out on your other devices.',
    zh: '我们已让你的其他设备退出登录。',
    hi: 'हमने तुम्हारे दूसरे डिवाइस से साइन आउट कर दिया है।',
    fr: 'Nous t’avons déconnecté de tes autres appareils.',
  });
  return {
    subject: tr({
      es: 'Tu contraseña de Lumi ha cambiado',
      en: 'Your Lumi password has changed',
      zh: '你的 Lumi 密码已修改',
      hi: 'तुम्हारा Lumi पासवर्ड बदल गया है',
      fr: 'Ton mot de passe Lumi a changé',
    }),
    html: layout(hi, [
      `${tr({
        es: 'Te lo contamos por si acaso.',
        en: 'Just letting you know.',
        zh: '以防万一，告诉你一声。',
        hi: 'बस तुम्हें बता रहे हैं।',
        fr: 'On te le dit au cas où.',
      })} ${signedOut}`,
    ]),
    text: `${hi}.\n\n${signedOut} ${tr({
      es: 'Si no has sido tú, responde a este correo.',
      en: 'If this wasn’t you, reply to this email.',
      zh: '如果不是你本人操作，请回复这封邮件。',
      hi: 'अगर यह तुमने नहीं किया, तो इस ईमेल का जवाब दो।',
      fr: 'Si ce n’était pas toi, réponds à cet e-mail.',
    })}`,
  };
}

export function accountDeletedMail(name: string): MailContent {
  const hi = name
    ? tr({
        es: `Hasta pronto, ${esc(name)}`,
        en: `See you soon, ${esc(name)}`,
        zh: `再见，${esc(name)}`,
        hi: `फिर मिलेंगे, ${esc(name)}`,
        fr: `À bientôt, ${esc(name)}`,
      })
    : tr({
        es: 'Hasta pronto',
        en: 'See you soon',
        zh: '再见',
        hi: 'फिर मिलेंगे',
        fr: 'À bientôt',
      });
  const deleted = tr({
    es: 'Hemos borrado tu cuenta y todos sus datos.',
    en: 'We’ve deleted your account and all its data.',
    zh: '我们已删除你的账户及其所有数据。',
    hi: 'हमने तुम्हारा खाता और उसका सारा डेटा मिटा दिया है।',
    fr: 'Nous avons supprimé ton compte et toutes ses données.',
  });
  const back = tr({
    es: 'Si algún día vuelves, Lumi te estará esperando.',
    en: 'If you ever come back, Lumi will be waiting for you.',
    zh: '如果有一天你回来，Lumi 会一直等你。',
    hi: 'अगर कभी लौटो, तो Lumi तुम्हारा इंतज़ार करेगी।',
    fr: 'Si un jour tu reviens, Lumi t’attendra.',
  });
  return {
    subject: tr({
      es: 'Tu cuenta de Lumi se ha eliminado',
      en: 'Your Lumi account has been deleted',
      zh: '你的 Lumi 账户已删除',
      hi: 'तुम्हारा Lumi खाता हटा दिया गया है',
      fr: 'Ton compte Lumi a été supprimé',
    }),
    html: layout(hi, [
      `${deleted} ${tr({
        es: 'Lumi se queda con un recuerdo bonito de vosotros.',
        en: 'Lumi keeps a lovely memory of your time together.',
        zh: 'Lumi 会留下你们在一起的美好回忆。',
        hi: 'Lumi तुम्हारे साथ की एक प्यारी याद रखेगी।',
        fr: 'Lumi garde un joli souvenir de vous deux.',
      })} ${back}`,
    ]),
    text: `${hi}.\n\n${deleted} ${back}`,
  };
}

/** `unsubscribeUrl`: enlace firmado para darse de baja (ver `waitlist/unsubscribe.ts`). */
export function waitlistWelcomeMail(unsubscribeUrl?: string): MailContent {
  const title = tr({
    es: '¡Ya estás en la lista!',
    en: 'You’re on the list!',
    zh: '你已经在名单上了！',
    hi: 'तुम सूची में आ गए!',
    fr: 'Tu es sur la liste !',
  });
  const hop = tr({
    es: 'Lumi ha dado tres saltitos al leer tu nombre. Te escribiremos en cuanto pueda mudarse a tu iPhone.',
    en: 'Lumi did three little hops when she read your name. We’ll write as soon as she can move into your iPhone.',
    zh: 'Lumi 看到你的名字，开心地跳了三下。她一能搬进你的 iPhone，我们就写信告诉你。',
    hi: 'तुम्हारा नाम पढ़कर Lumi तीन बार उछली। जैसे ही वो तुम्हारे iPhone में आ सकेगी, हम तुम्हें लिखेंगे।',
    fr: 'Lumi a fait trois petits bonds en lisant ton nom. On t’écrit dès qu’elle peut emménager dans ton iPhone.',
  });
  const tip = tr({
    es: 'Mientras tanto, un truco suyo: deja el móvil en otra habitación durante la cena. Brilla muchísimo.',
    en: 'Meanwhile, one of her tricks: leave your phone in another room during dinner. It makes her shine so bright.',
    zh: '在那之前，教你她的一个小窍门：吃晚饭时把手机放在另一个房间。她会亮得不得了。',
    hi: 'तब तक, उसकी एक तरकीब: रात के खाने के समय फ़ोन दूसरे कमरे में रख दो। वो ख़ूब चमकती है।',
    fr: 'En attendant, une de ses astuces : laisse ton téléphone dans une autre pièce pendant le dîner. Elle brille énormément.',
  });
  const subject = tr({
    es: '¡Ya estás en la lista de Lumi! ✨',
    en: 'You’re on Lumi’s list! ✨',
    zh: '你已加入 Lumi 的名单！✨',
    hi: 'तुम Lumi की सूची में हो! ✨',
    fr: 'Tu es sur la liste de Lumi ! ✨',
  });
  const leave = tr({
    es: 'Darme de baja de la lista',
    en: 'Unsubscribe from the list',
    zh: '退出名单',
    hi: 'सूची से नाम हटाओ',
    fr: 'Me désinscrire de la liste',
  });
  return {
    subject,
    html: layout(title, [
      hop,
      tip,
      ...(unsubscribeUrl
        ? [
            `<a href="${esc(unsubscribeUrl)}" style="color:#A69FD8;font-size:13px">${leave}</a>`,
          ]
        : []),
    ]),
    text: `${title}\n\n${hop}\n\n${tip}${unsubscribeUrl ? `\n\n${leave}: ${unsubscribeUrl}` : ''}`,
    ...(unsubscribeUrl
      ? {
          headers: {
            'List-Unsubscribe': `<${unsubscribeUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }
      : {}),
  };
}
