/** Textos del contenido del juego en un idioma (los datos están en `destinations.ts` y `catalog.ts`). */
export type PlaceText = {
  name: string;
  /** Con artículo: "el Bosque de Musgo", "the Moss Forest". */
  the: string;
  /** De procedencia: "del Bosque de Musgo", "from the Moss Forest". */
  from: string;
  /** Pie corto de la postal. */
  caption: string;
  /** Frase para releer la postal en el álbum. */
  quote: string;
  /** Fragmentos de historia en la voz de Lampi (el índice es el mismo en todos los idiomas). */
  stories: [string, string, string];
};

export type EntryText = {
  name: string;
  /** Con artículo indefinido, en minúsculas dentro de una frase: "una piña", "a pinecone". */
  a: string;
  /** Para concordar ("¡Amiga nueva!") en los idiomas con género. */
  feminine: boolean;
};

export type GameContent = {
  chapters: Record<1 | 2 | 3 | 4, string>;
  places: Record<string, PlaceText>;
  items: Record<string, EntryText>;
  friends: Record<string, EntryText>;
};
