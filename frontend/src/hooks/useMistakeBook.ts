import { useEffect, useMemo, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMasteryStore } from "../stores/MasteryStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";
import { MistakeReason, MistakeReasonText } from "../constants/MistakeReason";
import type { MistakeReason as MistakeReasonType } from "../types/MistakeReason";
import type { RemedialSession } from "../types/RemedialSession";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import { buildRemedialCandidates, buildRemedialQueue } from "../utils/remedialQueue";
import { isThisWeek, isUnlocked } from "../utils/week";
import { createDefaultRemedialSession } from "../constructors/RemedialSessionConstructor";
import { createDefaultPracticeSession } from "../constructors/PracticeSessionConstructor";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { logAction } from "../utils/logger";

/** 带业务码的异常：api/store 层不吞错，页面操作层统一抛出，组件各自展示 */
export class CodedError extends Error {
  code: keyof typeof ERROR_CODES;
  constructor(code: keyof typeof ERROR_CODES) {
    super(ERROR_MESSAGES[code]);
    this.code = code;
  }
}

export interface ReasonCard {
  reason: MistakeReasonType;
  text: string;
  /** 本周该原因的答错次数（仅统计未掌握点字） */
  wrongCount: number;
  /** 本周因该原因出错的未掌握点字数 */
  symbolCount: number;
}

export interface GroupCard {
  group: RemedialSession;
  reasonText: string;
  /** 未到日期为 true：卡片可见但打不开 */
  locked: boolean;
  total: number;
  done: number;
  queueSymbols: BrailleSymbol[];
}

export interface MistakeEntry {
  symbol: BrailleSymbol;
  mastered: boolean;
  wrongCount: number;
  primaryReason: string;
  firstMistakeAt: string;
  lastMistakeAt: string;
}

/** 当前未掌握点字集合（读最新 store 状态，供调度/打开等操作使用） */
function currentUnmasteredIds(): Set<number> {
  const symbols = useBrailleSymbolStore.getState().rows;
  const mastered = useMasteryStore.getState().masteredIds;
  return new Set(symbols.filter((s) => !mastered.has(s.id)).map((s) => s.id));
}

/**
 * 错题本页面操作（编排层）：本周错误原因汇总、整组安排补练、
 * 打开补练、标记掌握。排序规则委托 utils/remedialQueue，
 * 会话保存委托 stores/api，本层只做页面操作编排。
 */
export function useMistakeBook() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const records = useAnswerRecordStore((s) => s.rows);
  const groups = useRemedialSessionStore((s) => s.rows);
  const masteredIds = useMasteryStore((s) => s.masteredIds);
  const loading = useBrailleSymbolStore((s) => s.loading);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    void useBrailleSymbolStore.getState().load();
    void useAnswerRecordStore.getState().load();
    void useRemedialSessionStore.getState().load();
    void usePracticeSessionStore.getState().load();
    void useMasteryStore.getState().load();
  }, []);

  const symbolById = useMemo(() => new Map(symbols.map((s) => [s.id, s])), [symbols]);

  const unmasteredIds = useMemo(
    () => new Set(symbols.filter((s) => !masteredIds.has(s.id)).map((s) => s.id)),
    [symbols, masteredIds]
  );

  /** 本周错误原因卡片：只列本周确实出现过的原因 */
  const reasonCards = useMemo<ReasonCard[]>(() => {
    const wrong = records.filter(
      (r) => !r.correct && unmasteredIds.has(r.symbol_id) && isThisWeek(r.answered_at)
    );
    return MistakeReason.map((reason) => {
      const hits = wrong.filter((r) => r.mistake_reason === reason);
      return {
        reason,
        text: MistakeReasonText[reason],
        wrongCount: hits.length,
        symbolCount: new Set(hits.map((r) => r.symbol_id)).size
      };
    }).filter((card) => card.wrongCount > 0);
  }, [records, unmasteredIds]);

  /** 补练分组卡片：未到日期 locked=true，可见但打不开 */
  const groupCards = useMemo<GroupCard[]>(() =>
    [...groups]
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.id - b.id)
      .map((group) => ({
        group,
        reasonText: MistakeReasonText[group.reason_key] ?? group.reason_key,
        locked: !isUnlocked(group.scheduled_date),
        total: group.queue_symbol_ids.length + group.finished_symbol_ids.length,
        done: group.finished_symbol_ids.length,
        queueSymbols: group.queue_symbol_ids
          .map((id) => symbolById.get(id))
          .filter((s): s is BrailleSymbol => Boolean(s))
      })),
    [groups, symbolById]
  );

  /** 错题条目：本周有答错记录的点字（含已掌握，置灰展示） */
  const entries = useMemo<MistakeEntry[]>(() => {
    const allIds = new Set(symbols.map((s) => s.id));
    const candidates = buildRemedialCandidates(records, allIds);
    const list: MistakeEntry[] = [];
    for (const c of candidates) {
      const symbol = symbolById.get(c.symbol_id);
      if (!symbol) continue;
      const wrong = records
        .filter((r) => !r.correct && r.symbol_id === c.symbol_id && isThisWeek(r.answered_at))
        .sort((a, b) => a.answered_at.localeCompare(b.answered_at));
      list.push({
        symbol,
        mastered: masteredIds.has(c.symbol_id),
        wrongCount: wrong.length,
        primaryReason: c.primary_reason,
        firstMistakeAt: c.first_mistake_at,
        lastMistakeAt: wrong[wrong.length - 1]?.answered_at ?? c.first_mistake_at
      });
    }
    return list.sort((a, b) => b.lastMistakeAt.localeCompare(a.lastMistakeAt));
  }, [records, symbols, symbolById, masteredIds]);

  /** 队列预览：只收尚未掌握的点字，按排序规则重排（与正式安排同一套规则） */
  const previewQueue = useMemo(
    () => buildRemedialQueue(records, unmasteredIds),
    [records, unmasteredIds]
  );

  /**
   * 整组安排补练：先选错误原因和补练日期。
   * 同一原因存在未结束分组时重复布置沿用原会话（同 id、同 practice_session_id），
   * 只刷新补练日期并按当前未掌握点字重建队列。
   */
  async function schedule(reason: MistakeReasonType, scheduledDate: string): Promise<{ reused: boolean }> {
    if (!scheduledDate) throw new CodedError("VALIDATION_FAILED");
    const queue = buildRemedialQueue(
      useAnswerRecordStore.getState().rows,
      currentUnmasteredIds()
    );
    if (queue.length === 0) throw new CodedError("REMEDIAL_EMPTY");

    const existing = useRemedialSessionStore.getState().rows.find(
      (g) => g.reason_key === reason && g.status !== "FINISHED"
    );
    if (existing) {
      await useRemedialSessionStore.getState().upsert({
        ...existing,
        scheduled_date: scheduledDate,
        queue_symbol_ids: queue,
        updated_at: new Date().toISOString()
      });
      logAction("RemedialSession", 1, { id: existing.id, reason, scheduled_date: scheduledDate });
      return { reused: true };
    }
    const created = await useRemedialSessionStore.getState().upsert(
      createDefaultRemedialSession({
        id: 0,
        reason_key: reason,
        scheduled_date: scheduledDate,
        queue_symbol_ids: queue
      })
    );
    logAction("RemedialSession", 0, { id: created.id, reason, scheduled_date: scheduledDate });
    return { reused: false };
  }

  /**
   * 打开补练：未到日期抛 REMEDIAL_LOCKED（卡片可见但打不开）；
   * 首次打开时创建 REMEDIAL 练习会话并关联，之后沿用同一会话。
   * 打开时按最新掌握状态过滤队列，保证会话只收尚未掌握的点字。
   */
  async function openGroup(groupId: number): Promise<RemedialSession> {
    const group = useRemedialSessionStore.getState().rows.find((g) => g.id === groupId);
    if (!group) throw new CodedError("REMEDIAL_NOT_FOUND");
    if (!isUnlocked(group.scheduled_date)) throw new CodedError("REMEDIAL_LOCKED");

    let practiceSessionId = group.practice_session_id;
    if (!practiceSessionId) {
      const session = await usePracticeSessionStore.getState().upsert(
        createDefaultPracticeSession({
          id: 0,
          mode: "REMEDIAL",
          remedial_group_id: group.id,
          remedial_reason: group.reason_key
        })
      );
      practiceSessionId = session.id;
    }
    const unmastered = currentUnmasteredIds();
    const queue = group.queue_symbol_ids.filter((id) => unmastered.has(id));
    const saved = await useRemedialSessionStore.getState().upsert({
      ...group,
      status: queue.length === 0 ? "FINISHED" : "IN_PROGRESS",
      queue_symbol_ids: queue,
      practice_session_id: practiceSessionId,
      updated_at: new Date().toISOString()
    });
    setSelectedId(groupId);
    return saved;
  }

  /** 错题本手动标记掌握/未掌握 */
  async function markMastered(symbolId: number, mastered: boolean): Promise<void> {
    await useMasteryStore.getState().mark(symbolId, mastered);
  }

  return {
    loading,
    reasonCards,
    groupCards,
    entries,
    previewQueue,
    symbolById,
    selectedId,
    setSelectedId,
    schedule,
    openGroup,
    markMastered
  };
}
