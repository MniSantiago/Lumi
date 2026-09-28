import content from './content.json';

/**
 * Textos legales de Lumi. Se editan en `content.json`, que también genera
 * `landing/privacidad.html` y `landing/terminos.html`
 * (`python3 landing/tools/legal.py`).
 *
 * Borrador escrito a partir de lo que hace la app hoy. Antes de publicar en la
 * App Store hay que revisarlo (y completar quién es el responsable y el
 * correo de contacto).
 */

export type LegalDocId = 'privacidad' | 'terminos';

export type LegalDoc = {
  title: string;
  intro: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
};

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = content;

export function isLegalDocId(id: unknown): id is LegalDocId {
  return id === 'privacidad' || id === 'terminos';
}
