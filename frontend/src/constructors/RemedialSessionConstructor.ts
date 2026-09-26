import type { RemedialSession } from "../types/RemedialSession";

export const createDefaultRemedialSession = (overrides: Partial<RemedialSession> = {}): RemedialSession => ({
  id: 0,
  reasons: [],
  reason_key: "",
  scheduled_date: "2026-09-26",
  queue: [],
  finished_symbol_ids: [],
  reason_by_symbol: {},
  created_at: "2026-09-26T00:00:00.000Z",
  ...overrides
});

export const createRemedialSessionForm = createDefaultRemedialSession;
export const createRemedialSessionResponse = createDefaultRemedialSession;
