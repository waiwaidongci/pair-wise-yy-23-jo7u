/**
 * 补练队列排序规则（职责独立，页面与 store 不直接实现排序）。
 *
 * 规则一：会话只收尚未掌握的点字（由调用方按 mastery 过滤后传入）。
 * 规则二：按“首次出错时间”升序 —— 取该字本周最早一条答错记录的时间。
 * 规则三：同一错误原因连续不超过两题 —— 贪心交错：
 *   每步从剩余候选中取首次出错时间最早、且不会让当前原因连续达到 3 题的项；
 *   若最早项会超限，则顺延到下一个不超限的项；实在没有可选项时兜底取最早项。
 * 每个点字的“错误原因”取其本周最近一次答错记录的原因。
 */
import type { AnswerRecord } from "../types/AnswerRecord";
import type { MistakeReason } from "../types/MistakeReason";
import { isThisWeek } from "./week";

export const MAX_CONSECUTIVE_SAME_REASON = 2;

export interface RemedialCandidate {
  symbol_id: number;
  /** 本周首次出错时间（ISO） */
  first_mistake_at: string;
  /** 本周最近一次答错的原因，用于“同原因连续不超过两题”的判定 */
  primary_reason: MistakeReason | "";
}

/** 从本周答错记录中汇总每个未掌握点字的首次出错时间与主原因 */
export function buildRemedialCandidates(
  records: AnswerRecord[],
  unmasteredSymbolIds: ReadonlySet<number>,
  now: Date = new Date()
): RemedialCandidate[] {
  const bySymbol = new Map<number, AnswerRecord[]>();
  for (const record of records) {
    if (record.correct) continue;
    if (!unmasteredSymbolIds.has(record.symbol_id)) continue;
    if (!isThisWeek(record.answered_at, now)) continue;
    const list = bySymbol.get(record.symbol_id) ?? [];
    list.push(record);
    bySymbol.set(record.symbol_id, list);
  }
  const candidates: RemedialCandidate[] = [];
  for (const [symbol_id, list] of bySymbol) {
    const sorted = [...list].sort((a, b) => a.answered_at.localeCompare(b.answered_at));
    candidates.push({
      symbol_id,
      first_mistake_at: sorted[0].answered_at,
      primary_reason: (sorted[sorted.length - 1].mistake_reason || "") as RemedialCandidate["primary_reason"]
    });
  }
  return candidates;
}

/** 规则二 + 规则三：先按首次出错时间升序，再做同原因限连交错 */
export function orderRemedialQueue(candidates: RemedialCandidate[]): number[] {
  const pool = [...candidates].sort(
    (a, b) => a.first_mistake_at.localeCompare(b.first_mistake_at) || a.symbol_id - b.symbol_id
  );
  const ordered: RemedialCandidate[] = [];
  let lastReason: RemedialCandidate["primary_reason"] | null = null;
  let streak = 0;

  while (pool.length > 0) {
    let index = pool.findIndex(
      (c) => !(streak >= MAX_CONSECUTIVE_SAME_REASON && c.primary_reason === lastReason)
    );
    if (index < 0) index = 0; // 全部剩余项都会超限时兜底取最早项
    const [picked] = pool.splice(index, 1);
    if (picked.primary_reason === lastReason) {
      streak += 1;
    } else {
      lastReason = picked.primary_reason;
      streak = 1;
    }
    ordered.push(picked);
  }
  return ordered.map((c) => c.symbol_id);
}

/** 组合入口：给记录与未掌握集合，直接产出补练队列 */
export function buildRemedialQueue(
  records: AnswerRecord[],
  unmasteredSymbolIds: ReadonlySet<number>,
  now: Date = new Date()
): number[] {
  return orderRemedialQueue(buildRemedialCandidates(records, unmasteredSymbolIds, now));
}
