import type { PracticeSession } from "../types/PracticeSession";

/** 练习会话默认对象：未结束（finished_at 为空串）、零分零错 */
export const createDefaultPracticeSession = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
  id: 0,
  lesson_id: 0,
  mode: "MIXED",
  started_at: new Date().toISOString(),
  finished_at: "",
  score: 0,
  mistake_count: 0,
  remedial_group_id: null,
  remedial_reason: null,
  ...overrides
});

export const createPracticeSessionForm = createDefaultPracticeSession;
export const createPracticeSessionResponse = createDefaultPracticeSession;
