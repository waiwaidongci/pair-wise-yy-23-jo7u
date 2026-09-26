import { isCorrectRecord } from "../constants/AnswerCorrectness";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import { isThisWeek } from "./formatters";

// 同一错误原因在补练队列中允许的最大连续题数
export const MAX_CONSECUTIVE_SAME_REASON = 2;

export interface RemedialCandidate {
  symbol_id: number;
  reason: string;
  first_mistake_at: string;
}

// 本周出现过的错误原因（含次数），供老师按周布置补练
export function listWeeklyReasons(records: AnswerRecord[], now: Date = new Date()): { reason: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (isCorrectRecord(record) || !record.mistake_reason) continue;
    if (!isThisWeek(record.created_at, now)) continue;
    counts.set(record.mistake_reason, (counts.get(record.mistake_reason) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

// 只收尚未掌握的点字，并为每个字取所选原因下的首次出错时间
export function collectRemedialCandidates(
  records: AnswerRecord[],
  symbols: BrailleSymbol[],
  reasons: string[]
): RemedialCandidate[] {
  const wanted = new Set(reasons);
  const unmastered = new Set(symbols.filter((symbol) => symbol.mastery !== "MASTERED").map((symbol) => symbol.id));
  const firstBySymbol = new Map<number, RemedialCandidate>();
  for (const record of records) {
    if (isCorrectRecord(record) || !wanted.has(record.mistake_reason) || !unmastered.has(record.symbol_id)) continue;
    const prev = firstBySymbol.get(record.symbol_id);
    if (!prev || record.created_at < prev.first_mistake_at) {
      firstBySymbol.set(record.symbol_id, {
        symbol_id: record.symbol_id,
        reason: record.mistake_reason,
        first_mistake_at: record.created_at
      });
    }
  }
  return [...firstBySymbol.values()];
}

// 按首次出错时间升序排列，同时保证同一原因连续不超过两题；
// 剩余候选全是同一原因、无法满足间隔时，退化为按时间兜底，保证队列完整。
export function buildRemedialQueue(candidates: RemedialCandidate[]): number[] {
  const pool = [...candidates].sort(
    (a, b) => a.first_mistake_at.localeCompare(b.first_mistake_at) || a.symbol_id - b.symbol_id
  );
  const queue: number[] = [];
  let lastReason = "";
  let streak = 0;
  while (pool.length > 0) {
    const blockedReason = streak >= MAX_CONSECUTIVE_SAME_REASON ? lastReason : null;
    let index = blockedReason === null ? 0 : pool.findIndex((candidate) => candidate.reason !== blockedReason);
    if (index === -1) index = 0;
    const [picked] = pool.splice(index, 1);
    if (picked.reason === lastReason) {
      streak += 1;
    } else {
      lastReason = picked.reason;
      streak = 1;
    }
    queue.push(picked.symbol_id);
  }
  return queue;
}
