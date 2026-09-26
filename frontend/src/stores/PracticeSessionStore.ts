import { create } from "zustand";
import { listPracticeSession, savePracticeSession } from "../api/PracticeSession";
import type { PracticeSession } from "../types/PracticeSession";
import { logAction } from "../utils/logger";

type State = {
  rows: PracticeSession[];
  loading: boolean;
  load: () => Promise<void>;
  /** 新建或更新会话（id 为 0/缺省时由 IndexedDB 自增），并同步 store */
  upsert: (payload: PracticeSession) => Promise<PracticeSession>;
};

export const usePracticeSessionStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listPracticeSession(), loading: false });
  },
  async upsert(payload) {
    const isNew = !payload.id;
    const saved = await savePracticeSession(payload);
    logAction("PracticeSession", isNew ? 0 : 1, { id: saved.id, mode: saved.mode });
    const rows = get().rows;
    set({ rows: isNew ? [...rows, saved] : rows.map((r) => (r.id === saved.id ? saved : r)) });
    return saved;
  }
}));
