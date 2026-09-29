import { tr } from '@/i18n';

import en from './en';
import es from './es';
import fr from './fr';
import hi from './hi';
import type { GameContent } from './types';
import zh from './zh';

/** Textos del juego en el idioma del dispositivo. */
export const content: GameContent = tr<GameContent>({ es, en, zh, hi, fr });
