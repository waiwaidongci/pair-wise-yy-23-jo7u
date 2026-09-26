import { create } from "zustand";
import { listMastery, setMastery } from "../api/Mastery";
import type { MasteryRow } from "../mocks/seedData";

/** 点字掌握标记：补练答对与错题本手动标记都会写这里，各页面共享 */
type State = {
  rows: MasteryRow[];
  loading: boolean;
  load: () => Promise<void>;
  masteredIds: Set<number>;
  mark: (symbolId: number, mastered: boolean) => Promise<void>;
};

const toIdSet = (rows: MasteryRow[]) => new Set(rows.filter((r) => r.mastered).map((r) => r.symbol_id));

export const useMasteryStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  masteredIds: new Set<number>(),
  async load() {
    set({ loading: true });
    const rows = await listMastery();
    set({ rows, masteredIds: toIdSet(rows), loading: false });
  },
  async mark(symbolId, mastered) {
    const saved = await setMastery(symbolId, mastered);
    const rows = [...get().rows.filter((r) => r.symbol_id !== symbolId), saved];
    set({ rows, masteredIds: toIdSet(rows) });
  }
}));
