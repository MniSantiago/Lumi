import { getLocales } from 'expo-localization';

/**
 * Idiomas de Lampi. La app habla el idioma del iPhone si es uno de estos y,
 * si no, inglés. iOS reinicia la app al cambiar de idioma, así que basta con
 * mirarlo una vez al arrancar.
 *
 * Los textos viven junto al código que los usa, con `tr({ es, en, zh, hi, fr })`.
 * El tipo sale del español: si falta una traducción o una clave, TypeScript falla.
 */
export const LANGS = ['es', 'en', 'zh', 'hi', 'fr'] as const;
export type Lang = (typeof LANGS)[number];

const FALLBACK: Lang = 'en';

/** Cada idioma escrito en sí mismo, para enseñarlo en Ajustes. */
export const LANG_NAMES: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
  zh: '简体中文',
  hi: 'हिन्दी',
  fr: 'Français',
};

export function detectLang(languageCodes: (string | null | undefined)[]): Lang {
  for (const code of languageCodes) {
    const base = code?.toLowerCase().split(/[-_]/)[0];
    if (base && (LANGS as readonly string[]).includes(base)) return base as Lang;
  }
  return FALLBACK;
}

function deviceLanguageCodes(): (string | null)[] {
  try {
    return getLocales().map((l) => l.languageCode);
  } catch {
    return [];
  }
}

export const lang: Lang = detectLang(deviceLanguageCodes());

/** Etiqueta BCP 47 para fechas y números (`toLocaleDateString`, `Intl`). */
export const locale = (
  {
    es: 'es-ES',
    en: 'en-US',
    zh: 'zh-Hans-CN',
    hi: 'hi-IN',
    fr: 'fr-FR',
  } as const
)[lang];

/** Elige los textos del idioma actual. Todas las lenguas deben tener la misma forma que la española. */
export function tr<T>(texts: { es: T } & Record<Exclude<Lang, 'es'>, NoInfer<T>>): T {
  return texts[lang];
}

/** Entre comillas del idioma: «hola», “hello”, « bonjour ». */
export const quoted = (text: string) =>
  tr({ es: `«${text}»`, en: `“${text}”`, zh: `“${text}”`, hi: `“${text}”`, fr: `« ${text} »` });
