import { create } from "zustand";
import { listAnswerRecord, saveAnswerRecord } from "../api/AnswerRecord";
import type { AnswerRecord } from "../types/AnswerRecord";
import { logAction } from "../utils/logger";

type State = {
  rows: AnswerRecord[];
  loading: boolean;
  load: () => Promise<void>;
  /** 追加一条答题记录并持久化；返回带 id 的记录 */
  addRecord: (payload: Omit<AnswerRecord, "id">) => Promise<AnswerRecord>;
};

export const useAnswerRecordStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listAnswerRecord(), loading: false });
  },
  async addRecord(payload) {
    const saved = await saveAnswerRecord(payload as AnswerRecord);
    logAction("AnswerRecord", 0, { id: saved.id, symbol_id: saved.symbol_id, correct: saved.correct });
    set({ rows: [...get().rows, saved] });
    return saved;
  }
}));
