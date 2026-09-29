/**
 * Dominio público de Lumi (la landing), para lo que se comparte: la tarjeta
 * del resumen semanal. Vacío hasta tener dominio propio: entonces no se enseña
 * (mejor nada que mandar a la gente a un dominio que no es nuestro).
 */
export const SITE_DOMAIN = (process.env.EXPO_PUBLIC_SITE_DOMAIN ?? '').trim();
