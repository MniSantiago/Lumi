/**
 * Datos fijos de la maqueta que aún no salen del juego: las etapas de
 * evolución (la etapa actual la calcula `game/engine.ts`) y el catálogo de
 * apps ladronas.
 */

/** Etapas de evolución: cada una cambia el color de la luz de Lumi; `orb` es su degradado. */
export const EVOLUTION = {
  stages: [
    { name: 'Chispa', orb: 'radial-gradient(circle, #FFE3A3, #FFC96B 50%, transparent 72%)' },
    { name: 'Farolito', orb: 'radial-gradient(circle, #FFE3A3, #FFC96B 45%, #FFB4A2 60%, transparent 74%)' },
    { name: 'Estrella', orb: 'radial-gradient(circle, #E6E0FB, #9FE3F0 50%, transparent 74%)' },
    { name: 'Aurora', orb: 'radial-gradient(circle, #FFFFFF, #C9BFF2 45%, #8C7BD8 60%, transparent 76%)' },
  ],
};

export type ThiefApp = {
  id: string;
  name: string;
  letter: string;
  /** Fondo del icono provisional (degradado CSS). */
  icon: string;
  /** Color de la letra si el fondo es claro (por defecto, blanco). */
  ink?: string;
  note?: string;
};

/**
 * Apps que se pueden elegir como "ladronas". En iOS real la elección la hace
 * el `FamilyActivityPicker` de Apple y la app solo recibe tokens opacos; este
 * catálogo es para la maqueta y el mock.
 */
export const THIEF_APP_CATALOG: ThiefApp[] = [
  { id: 'tiktok', name: 'TikTok', letter: 'T', icon: 'linear-gradient(#111111, #111111)' },
  { id: 'instagram', name: 'Instagram', letter: 'I', icon: 'linear-gradient(45deg, #F2A15A, #C9477A, #6F4AC2)' },
  { id: 'youtube', name: 'YouTube', letter: 'Y', icon: 'linear-gradient(#E0473E, #E0473E)', note: 'Solo Shorts no se puede separar en iOS' },
  { id: 'x', name: 'X', letter: 'X', icon: 'linear-gradient(#000000, #000000)' },
  { id: 'reddit', name: 'Reddit', letter: 'R', icon: 'linear-gradient(#FF4500, #FF4500)' },
  { id: 'snapchat', name: 'Snapchat', letter: 'S', icon: 'linear-gradient(#FFFC00, #FFFC00)', ink: '#111111' },
  { id: 'facebook', name: 'Facebook', letter: 'F', icon: 'linear-gradient(#1877F2, #1877F2)' },
  { id: 'twitch', name: 'Twitch', letter: 'T', icon: 'linear-gradient(#9146FF, #9146FF)' },
];

export function thiefAppById(id: string) {
  return THIEF_APP_CATALOG.find((a) => a.id === id);
}
