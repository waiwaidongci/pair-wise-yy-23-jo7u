import type { AnswerRecord } from "../types/AnswerRecord";

/** 答题记录默认对象：答对、无错误原因、当前时间 */
export const createDefaultAnswerRecord = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: 0,
  session_id: 0,
  symbol_id: 0,
  user_answer: "",
  correct: true,
  latency_ms: 0,
  mistake_reason: "",
  answered_at: new Date().toISOString(),
  ...overrides
});

export const createAnswerRecordForm = createDefaultAnswerRecord;
export const createAnswerRecordResponse = createDefaultAnswerRecord;
