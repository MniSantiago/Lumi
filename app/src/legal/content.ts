import content from './content.json';

/**
 * Textos legales y de ayuda de Lumi. Se editan en `content.json`, que también genera
 * `landing/privacidad.html`, `landing/terminos.html` y `landing/ayuda.html`
 * (`python3 landing/tools/legal.py`).
 *
 * Borrador escrito a partir de lo que hace la app hoy. Antes de publicar en la
 * App Store hay que revisarlo (y completar quién es el responsable y el
 * correo de contacto).
 */

export type LegalDocId = 'privacidad' | 'terminos' | 'ayuda';

export type LegalDoc = {
  title: string;
  intro: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = content;

/** Correo de soporte. Vacío hasta tener dominio: entonces se enseña en Ayuda y en la landing. */
export const CONTACT_EMAIL: string = content.contactEmail;

export function isLegalDocId(id: unknown): id is LegalDocId {
  return id === 'privacidad' || id === 'terminos' || id === 'ayuda';
}
