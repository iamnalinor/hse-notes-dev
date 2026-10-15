import type { GlossaryEntry } from "./schemas.ts";

import { stripTags } from "./text.ts";

export type GlossaryGroup = {
  readonly entries: readonly GlossaryEntry[];
  readonly letter: string;
};

const SYMBOLS = "Обозначения";
const LETTER = /^\p{L}/u;

export const isGlossaryMatch = (entry: GlossaryEntry, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return (
    needle === "" || `${entry.term} ${stripTags(entry.defHtml)}`.toLowerCase().includes(needle)
  );
};

const letterOf = (term: string): string => {
  const first = term.trim().charAt(0).toUpperCase();
  return LETTER.test(first) ? first : SYMBOLS;
};

/** Alphabetical groups by first letter; formulas and symbols go first as «Обозначения». */
export const groupGlossary = (entries: readonly GlossaryEntry[]): readonly GlossaryGroup[] => {
  const letters = [...new Set(entries.map((entry) => letterOf(entry.term)))].toSorted((a, b) => {
    if (a === SYMBOLS || b === SYMBOLS) {
      return a === SYMBOLS ? -1 : 1;
    }
    return a.localeCompare(b, "ru");
  });
  return letters.map((letter) => ({
    entries: entries
      .filter((entry) => letterOf(entry.term) === letter)
      .toSorted((a, b) => a.term.localeCompare(b.term, "ru")),
    letter,
  }));
};
