import type { AnswerRecord } from "../types/AnswerRecord";

export const AnswerCorrectness = ["YES","NO"] as const;
export type AnswerCorrectness = (typeof AnswerCorrectness)[number];

export const isCorrectRecord = (record: Pick<AnswerRecord, "correct">) => record.correct === "YES";
