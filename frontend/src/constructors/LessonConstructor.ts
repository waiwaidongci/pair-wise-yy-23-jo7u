import type { Lesson } from "../types/Lesson";

export const createDefaultLesson = (overrides: Partial<Lesson> = {}): Lesson => ({
  id: 0,
  title: "基础点位",
  symbol_ids: [1,2] as number[],
  stage: "第一阶段",
  estimated_minutes: 15,
  unlock_rule: "无",
  ...overrides
});

export const createLessonForm = createDefaultLesson;
export const createLessonResponse = createDefaultLesson;
