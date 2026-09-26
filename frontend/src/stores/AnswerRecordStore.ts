import { create } from "zustand";
import { listAnswerRecord, saveAnswerRecord } from "../api/AnswerRecord";
import { createAnswerRecordResponse } from "../constructors/AnswerRecordConstructor";
import type { AnswerRecord } from "../types/AnswerRecord";

type State = {
  rows: AnswerRecord[];
  loading: boolean;
  load: () => Promise<void>;
  addRecord: (payload: Omit<AnswerRecord, "id">) => Promise<AnswerRecord>;
};

export const useAnswerRecordStore = create<State>()((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listAnswerRecord(), loading: false });
  },
  async addRecord(payload) {
    const record = createAnswerRecordResponse({
      ...payload,
      id: get().rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
    });
    await saveAnswerRecord(record);
    set({ rows: [...get().rows, record] });
    return record;
  }
}));
