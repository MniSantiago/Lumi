/**
 * Dominio público de Lumi (la landing), para lo que se comparte: la tarjeta
 * del resumen semanal y los textos de las postales. Vacío hasta tener dominio propio: entonces no se enseña
 * (mejor nada que mandar a la gente a un dominio que no es nuestro).
 */
export const SITE_DOMAIN = (process.env.EXPO_PUBLIC_SITE_DOMAIN ?? '').trim();

/** Enlace a la landing para añadir a lo que se comparte, con el origen marcado (?ref=). Vacío sin dominio. */
export function siteLink(ref: string) {
  return SITE_DOMAIN ? `https://${SITE_DOMAIN.replace(/^https?:\/\//, '')}/?ref=${ref}` : '';
}

/** Añade el enlace a un texto para compartir, si hay dominio. */
export const withSiteLink = (text: string, ref: string) => {
  const link = siteLink(ref);
  return link ? `${text}\n${link}` : text;
};
