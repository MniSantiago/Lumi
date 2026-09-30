import { tr } from '@/i18n';

import content from './content.json';
import en from './i18n/en.json';
import es from './i18n/es.json';
import fr from './i18n/fr.json';
import hi from './i18n/hi.json';
import zh from './i18n/zh.json';

/**
 * Textos legales y de ayuda de Lampi, uno por idioma en `i18n/<idioma>.json`. Los
 * mismos archivos generan `landing/privacidad.html`, `landing/terminos.html` y
 * `landing/ayuda.html` (`python3 landing/tools/legal.py`).
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

export const LEGAL_TEXTS = { es, en, zh, hi, fr } satisfies Record<string, Record<LegalDocId, LegalDoc>>;

export const LEGAL_DOCS: Record<LegalDocId, LegalDoc> = tr<Record<LegalDocId, LegalDoc>>(LEGAL_TEXTS);

/** Correo de soporte. Vacío hasta tener dominio: entonces se enseña en Ayuda y en la landing. */
export const CONTACT_EMAIL: string = content.contactEmail;

export function isLegalDocId(id: unknown): id is LegalDocId {
  return id === 'privacidad' || id === 'terminos' || id === 'ayuda';
}
