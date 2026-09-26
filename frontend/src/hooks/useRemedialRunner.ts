import { useMemo, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMasteryStore } from "../stores/MasteryStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";
import { createDefaultAnswerRecord } from "../constructors/AnswerRecordConstructor";
import { logAction } from "../utils/logger";

/**
 * 补练进行中的页面操作：
 * - 答对：本次把该字移出队列，并标记掌握（结果同步错题本与进度页）
 * - 答错：该字排到组尾，本次还会再练到
 * - 队列清空：分组完成，练习会话结算分数
 * 队列本身保存在 RemedialSession（会话保存），本 hook 只负责操作流转。
 */
export function useRemedialRunner(groupId: number | null) {
  const groups = useRemedialSessionStore((s) => s.rows);
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const [lastResult, setLastResult] = useState<{ symbolId: number; correct: boolean } | null>(null);

  const group = useMemo(() => groups.find((g) => g.id === groupId) ?? null, [groups, groupId]);
  const currentSymbolId = group?.queue_symbol_ids[0] ?? null;
  const currentSymbol = useMemo(
    () => symbols.find((s) => s.id === currentSymbolId) ?? null,
    [symbols, currentSymbolId]
  );
  const finished = Boolean(group && group.queue_symbol_ids.length === 0);

  async function answer(correct: boolean, userAnswer = "", latencyMs = 0): Promise<void> {
    const state = useRemedialSessionStore.getState();
    const g = state.rows.find((row) => row.id === groupId);
    if (!g || g.queue_symbol_ids.length === 0) return;
    const symbolId = g.queue_symbol_ids[0];
    const sessionId = g.practice_session_id;
    if (!sessionId) return;

    // 1) 写答题记录（驱动错题本与进度统计）
    await useAnswerRecordStore.getState().addRecord(
      createDefaultAnswerRecord({
        id: 0,
        session_id: sessionId,
        symbol_id: symbolId,
        user_answer: userAnswer,
        correct,
        latency_ms: latencyMs,
        mistake_reason: correct ? "" : g.reason_key,
        answered_at: new Date().toISOString()
      })
    );

    // 2) 更新补练队列：答对移出 / 答错置尾
    const rest = g.queue_symbol_ids.slice(1);
    const queue = correct ? rest : [...rest, symbolId];
    const finishedIds = correct ? [...g.finished_symbol_ids, symbolId] : g.finished_symbol_ids;
    if (correct) {
      await useMasteryStore.getState().mark(symbolId, true);
      logAction("RemedialSession", 2, { group: g.id, symbol_id: symbolId });
    } else {
      logAction("RemedialSession", 3, { group: g.id, symbol_id: symbolId });
    }
    const done = queue.length === 0;
    await state.upsert({
      ...g,
      queue_symbol_ids: queue,
      finished_symbol_ids: finishedIds,
      status: done ? "FINISHED" : "IN_PROGRESS",
      updated_at: new Date().toISOString()
    });
    if (done) logAction("RemedialSession", 4, { group: g.id });

    // 3) 结算练习会话（进度页按 PracticeSession + AnswerRecord 统计）
    const sessionStore = usePracticeSessionStore.getState();
    const session = sessionStore.rows.find((s) => s.id === sessionId);
    if (session) {
      const sessionRecords = useAnswerRecordStore.getState().rows.filter((r) => r.session_id === sessionId);
      const total = sessionRecords.length;
      const mistakes = sessionRecords.filter((r) => !r.correct).length;
      await sessionStore.upsert({
        ...session,
        mistake_count: mistakes,
        score: total === 0 ? 0 : Math.round(((total - mistakes) / total) * 100),
        finished_at: done ? new Date().toISOString() : session.finished_at
      });
    }
    setLastResult({ symbolId, correct });
  }

  return {
    group,
    currentSymbol,
    remaining: group?.queue_symbol_ids.length ?? 0,
    doneCount: group?.finished_symbol_ids.length ?? 0,
    finished,
    lastResult,
    answer
  };
}
