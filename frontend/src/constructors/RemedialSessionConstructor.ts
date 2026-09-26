import type { RemedialSession } from "../types/RemedialSession";
import type { MistakeReason } from "../types/MistakeReason";
import { todayKey } from "../utils/week";

/** 补练分组默认对象：新建时为 SCHEDULED，空队列，默认安排在今天 */
export const createDefaultRemedialSession = (
  overrides: Partial<RemedialSession> = {}
): RemedialSession => ({
  id: 0,
  reason_key: "DOT_CONFUSION" as MistakeReason,
  scheduled_date: todayKey(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: "SCHEDULED",
  queue_symbol_ids: [],
  finished_symbol_ids: [],
  practice_session_id: null,
  ...overrides
});

export const createRemedialSessionForm = createDefaultRemedialSession;
export const createRemedialSessionResponse = createDefaultRemedialSession;
