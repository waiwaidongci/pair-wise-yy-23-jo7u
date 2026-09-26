import { create } from "zustand";
import { listBrailleSymbol, saveBrailleSymbol } from "../api/BrailleSymbol";
import { MasteryLevel } from "../constants/MasteryLevel";
import type { BrailleSymbol } from "../types/BrailleSymbol";

type State = {
  rows: BrailleSymbol[];
  loading: boolean;
  load: () => Promise<void>;
  setMastery: (id: number, level: string) => Promise<void>;
  applyResultToMastery: (id: number, correct: boolean) => Promise<void>;
};

export const useBrailleSymbolStore = create<State>()((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listBrailleSymbol(), loading: false });
  },
  async setMastery(id, level) {
    const rows = get().rows.map((row) => (row.id === id ? { ...row, mastery: level } : row));
    set({ rows });
    const updated = rows.find((row) => row.id === id);
    if (updated) await saveBrailleSymbol(updated);
  },
  async applyResultToMastery(id, correct) {
    // 补练结果回写掌握度：答对升一级，答错降一级
    const symbol = get().rows.find((row) => row.id === id);
    if (!symbol) return;
    const index = MasteryLevel.indexOf(symbol.mastery as (typeof MasteryLevel)[number]);
    if (index === -1) return;
    const next = correct ? Math.min(index + 1, MasteryLevel.length - 1) : Math.max(index - 1, 0);
    if (next !== index) await get().setMastery(id, MasteryLevel[next]);
  }
}));
