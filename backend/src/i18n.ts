import { AsyncLocalStorage } from 'node:async_hooks';
import type { NextFunction, Request, Response } from 'express';

/**
 * Idioma de cada petición, sacado de `Accept-Language` (la app manda el suyo).
 * Los mensajes se escriben en español en el código y se traducen al responder;
 * los correos eligen su texto con `currentLang()`.
 */
export const LANGS = ['es', 'en', 'zh', 'hi', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

const storage = new AsyncLocalStorage<Lang>();

/** "fr-FR,fr;q=0.9,en;q=0.8" → 'fr'. Sin cabecera, español; con un idioma que no hablamos, inglés. */
export function langFrom(header: string | undefined): Lang {
  if (!header?.trim()) return 'es';
  const ranked = header
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = Number(
        params.find((p) => p.trim().startsWith('q='))?.split('=')[1] ?? 1,
      );
      return {
        base: tag.toLowerCase().split(/[-_]/)[0],
        q: Number.isFinite(q) ? q : 0,
        i,
      };
    })
    .sort((a, b) => b.q - a.q || a.i - b.i);
  const hit = ranked.find((r) => (LANGS as readonly string[]).includes(r.base));
  return (hit?.base as Lang | undefined) ?? 'en';
}

export const currentLang = (): Lang => storage.getStore() ?? 'es';

/** Elige el texto del idioma de la petición. */
export function tr<T>(
  texts: { es: T } & Record<Exclude<Lang, 'es'>, NoInfer<T>>,
): T {
  return texts[currentLang()];
}

type Translations = Record<Exclude<Lang, 'es'>, string>;

/** Mensajes de error que ve el usuario, por su texto en español. */
const MESSAGES: Record<string, Translations> = {
  'Ese correo no parece completo': {
    en: 'That email doesn’t look complete',
    zh: '这个邮箱地址好像不完整',
    hi: 'यह ईमेल पूरा नहीं लगता',
    fr: 'Cet e-mail semble incomplet',
  },
  'La contraseña necesita al menos 8 caracteres': {
    en: 'The password needs at least 8 characters',
    zh: '密码至少需要 8 个字符',
    hi: 'पासवर्ड में कम से कम 8 अक्षर चाहिए',
    fr: 'Le mot de passe doit contenir au moins 8 caractères',
  },
  'El código tiene 6 cifras': {
    en: 'The code has 6 digits',
    zh: '验证码是 6 位数字',
    hi: 'कोड में 6 अंक होते हैं',
    fr: 'Le code comporte 6 chiffres',
  },
  'Correo o contraseña incorrectos': {
    en: 'Wrong email or password',
    zh: '邮箱或密码不正确',
    hi: 'ईमेल या पासवर्ड ग़लत है',
    fr: 'E-mail ou mot de passe incorrect',
  },
  'La sesión ha caducado': {
    en: 'Your session has expired',
    zh: '登录已过期',
    hi: 'सत्र समाप्त हो गया है',
    fr: 'La session a expiré',
  },
  'El código no es válido o ha caducado': {
    en: 'The code isn’t valid or has expired',
    zh: '验证码无效或已过期',
    hi: 'कोड सही नहीं है या उसकी समय-सीमा ख़त्म हो गई है',
    fr: 'Le code n’est pas valide ou a expiré',
  },
  'La contraseña actual no es correcta': {
    en: 'The current password isn’t correct',
    zh: '当前密码不正确',
    hi: 'मौजूदा पासवर्ड सही नहीं है',
    fr: 'Le mot de passe actuel n’est pas correct',
  },
  'La contraseña no es correcta': {
    en: 'The password isn’t correct',
    zh: '密码不正确',
    hi: 'पासवर्ड सही नहीं है',
    fr: 'Le mot de passe n’est pas correct',
  },
  'El progreso es demasiado grande': {
    en: 'The progress is too large',
    zh: '进度数据太大',
    hi: 'प्रगति बहुत बड़ी है',
    fr: 'La progression est trop volumineuse',
  },
  'Ya hay una cuenta con ese correo. Prueba a entrar.': {
    en: 'There’s already an account with that email. Try signing in.',
    zh: '这个邮箱已经注册过账户。试试登录吧。',
    hi: 'इस ईमेल से पहले से एक खाता है। साइन इन करके देखो।',
    fr: 'Un compte existe déjà avec cet e-mail. Essaie de te connecter.',
  },
  'Demasiados intentos con esta cuenta. Espera unos minutos o cambia la contraseña.':
    {
      en: 'Too many attempts on this account. Wait a few minutes or change the password.',
      zh: '此账户尝试次数过多。请等几分钟或修改密码。',
      hi: 'इस खाते पर बहुत ज़्यादा कोशिशें हुईं। कुछ मिनट रुको या पासवर्ड बदलो।',
      fr: 'Trop de tentatives sur ce compte. Attends quelques minutes ou change le mot de passe.',
    },
};

export function translateMessage(message: string, lang: Lang): string {
  return lang === 'es' ? message : (MESSAGES[message]?.[lang] ?? message);
}

/** Guarda el idioma de la petición y traduce el `message` de las respuestas de error. */
export function languageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const lang = langFrom(req.headers['accept-language']);
  res.setHeader('Content-Language', lang);
  if (lang !== 'es') {
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      if (
        res.statusCode >= 400 &&
        body &&
        typeof body === 'object' &&
        'message' in body
      ) {
        const b = body as { message: unknown };
        if (typeof b.message === 'string')
          b.message = translateMessage(b.message, lang);
        else if (Array.isArray(b.message))
          b.message = b.message.map((m) =>
            typeof m === 'string' ? translateMessage(m, lang) : m,
          );
      }
      return json(body);
    };
  }
  storage.run(lang, next);
}
