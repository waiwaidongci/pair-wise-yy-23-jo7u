import { create } from "zustand";
import { listRemedialSession, saveRemedialSession } from "../api/RemedialSession";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createRemedialSessionResponse } from "../constructors/RemedialSessionConstructor";
import type { RemedialSession } from "../types/RemedialSession";
import { buildRemedialQueue, type RemedialCandidate } from "../utils/remedialOrdering";

type AssignResult = { session: RemedialSession; reused: boolean };

type State = {
  rows: RemedialSession[];
  loading: boolean;
  load: () => Promise<void>;
  assign: (reasons: string[], scheduledDate: string, candidates: RemedialCandidate[]) => Promise<AssignResult>;
  recordResult: (sessionId: number, symbolId: number, correct: boolean) => Promise<void>;
};

const reasonKeyOf = (reasons: string[]) => [...reasons].sort().join("|");

export const useRemedialSessionStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRemedialSession(), loading: false });
  },
  async assign(reasons, scheduledDate, candidates) {
    const reasonKey = reasonKeyOf(reasons);
    // 重复布置沿用原会话：相同原因组合 + 相同补练日期直接返回已有会话
    const existing = get().rows.find((row) => row.reason_key === reasonKey && row.scheduled_date === scheduledDate);
    if (existing) return { session: existing, reused: true };
    const session = createRemedialSessionResponse({
      id: get().rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
      reasons: [...reasons],
      reason_key: reasonKey,
      scheduled_date: scheduledDate,
      queue: buildRemedialQueue(candidates),
      reason_by_symbol: Object.fromEntries(candidates.map((candidate) => [String(candidate.symbol_id), candidate.reason])),
      created_at: new Date().toISOString()
    });
    console.info(LOG_TEMPLATES.RemedialSession[0], session);
    await saveRemedialSession(session);
    set({ rows: [...get().rows, session] });
    return { session, reused: false };
  },
  async recordResult(sessionId, symbolId, correct) {
    // 答对后本次移出该字；答错排到组尾
    const rows = get().rows.map((session) => {
      if (session.id !== sessionId) return session;
      const rest = session.queue.filter((id) => id !== symbolId);
      return {
        ...session,
        queue: correct ? rest : [...rest, symbolId],
        finished_symbol_ids: correct ? [...session.finished_symbol_ids, symbolId] : session.finished_symbol_ids
      };
    });
    set({ rows });
    const updated = rows.find((row) => row.id === sessionId);
    if (updated) {
      console.info(updated.queue.length === 0 ? LOG_TEMPLATES.RemedialSession[2] : LOG_TEMPLATES.RemedialSession[1], updated);
      await saveRemedialSession(updated);
    }
  }
}));
