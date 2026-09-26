import type { BrailleSymbol } from "../types/BrailleSymbol";

export const createDefaultBrailleSymbol = (overrides: Partial<BrailleSymbol> = {}): BrailleSymbol => ({
  id: 0,
  cell_pattern: "dots 1",
  letter: "a",
  pinyin: "a",
  category: "LETTER",
  difficulty: "LOW",
  audio_hint_key: "audio/letter-a",
  mastery: "NEW",
  ...overrides
});

export const createBrailleSymbolForm = createDefaultBrailleSymbol;
export const createBrailleSymbolResponse = createDefaultBrailleSymbol;
