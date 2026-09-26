/**
 * 答题记录 AnswerRecord
 * - correct 为布尔结果；latency_ms 为毫秒耗时
 * - mistake_reason 见 constants/MistakeReason.ts，答对时为空串
 * - answered_at 为该次作答发生时间，错题本的“本周错误”和“首次出错时间”都以它为准
 */
export interface AnswerRecord {
  id: number;
  session_id: number;
  symbol_id: number;
  user_answer: string;
  correct: boolean;
  latency_ms: number;
  mistake_reason: string;
  answered_at: string;
}
