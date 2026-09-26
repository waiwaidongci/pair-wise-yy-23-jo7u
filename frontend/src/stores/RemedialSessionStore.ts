import { create } from "zustand";
import { listRemedialSession, saveRemedialSession } from "../api/RemedialSession";
import type { RemedialSession } from "../types/RemedialSession";

/**
 * 补练分组 store —— 只负责“会话保存”：读写与持久化。
 * 队列排序规则在 utils/remedialQueue.ts，页面操作编排 hooks/useMistakeBook.ts。
 */
type State = {
  rows: RemedialSession[];
  loading: boolean;
  load: () => Promise<void>;
  upsert: (payload: RemedialSession) => Promise<RemedialSession>;
};

export const useRemedialSessionStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRemedialSession(), loading: false });
  },
  async upsert(payload) {
    const isNew = !payload.id;
    const saved = await saveRemedialSession(payload);
    const rows = get().rows;
    set({ rows: isNew ? [...rows, saved] : rows.map((r) => (r.id === saved.id ? saved : r)) });
    return saved;
  }
}));
