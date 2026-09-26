import { useEffect, useMemo } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMasteryStore } from "../stores/MasteryStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";
import { PracticeModeText } from "../constants/PracticeMode";
import type { PracticeMode } from "../constants/PracticeMode";
import { MistakeReasonText } from "../constants/MistakeReason";
import type { MistakeReason } from "../types/MistakeReason";
import { StatCard } from "../components/common/StatCard";
import { ChartPanel } from "../components/common/ChartPanel";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate, formatDateOnly, formatPercent } from "../utils/formatters";
import { isThisWeek, toDateKey } from "../utils/week";

/** 学习进度：练习会话、答题记录与补练结果在这里汇总展示 */
export function ProgressPage() {
  const sessions = usePracticeSessionStore((s) => s.rows);
  const records = useAnswerRecordStore((s) => s.rows);
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const masteredIds = useMasteryStore((s) => s.masteredIds);
  const groups = useRemedialSessionStore((s) => s.rows);

  useEffect(() => {
    void usePracticeSessionStore.getState().load();
    void useAnswerRecordStore.getState().load();
    void useBrailleSymbolStore.getState().load();
    void useMasteryStore.getState().load();
    void useRemedialSessionStore.getState().load();
  }, []);

  const weekRecords = useMemo(() => records.filter((r) => isThisWeek(r.answered_at)), [records]);
  const weekCorrect = weekRecords.filter((r) => r.correct).length;
  const accuracy = weekRecords.length === 0 ? 0 : weekCorrect / weekRecords.length;

  /** 最近 7 天答对/答错趋势 */
  const trend = useMemo(() => {
    const days: { label: string; value: number; hint: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const dayRecords = records.filter((r) => toDateKey(new Date(r.answered_at)) === key);
      const correct = dayRecords.filter((r) => r.correct).length;
      days.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: correct,
        hint: `对 ${correct} / 错 ${dayRecords.length - correct}`
      });
    }
    return days;
  }, [records]);

  /** 本周错误原因分布 */
  const reasonDist = useMemo(() => {
    const wrong = weekRecords.filter((r) => !r.correct && r.mistake_reason);
    const counts = new Map<string, number>();
    for (const r of wrong) counts.set(r.mistake_reason, (counts.get(r.mistake_reason) ?? 0) + 1);
    return [...counts.entries()]
      .map(([reason, count]) => ({
        label: MistakeReasonText[reason as MistakeReason] ?? reason,
        value: count,
        hint: `${count} 次`
      }))
      .sort((a, b) => b.value - a.value);
  }, [weekRecords]);

  const recentSessions = useMemo(
    () => [...sessions].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 8),
    [sessions]
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">progress</p>
          <h1>学习进度</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="本周答题" value={weekRecords.length} />
        <StatCard label="本周正确率" value={formatPercent(accuracy)} />
        <StatCard label="已掌握点字" value={`${masteredIds.size} / ${symbols.length}`} />
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>最近 7 天答对趋势</h2>
          <ChartPanel data={trend} />
        </div>
        <div className="panel">
          <h2>本周错误原因分布</h2>
          {reasonDist.length === 0 ? <EmptyState title="本周没有答错记录" /> : <ChartPanel data={reasonDist} />}
        </div>
      </section>

      <section className="panel wide">
        <h2>补练分组进度</h2>
        {groups.length === 0 ? (
          <EmptyState title="还没有补练分组" />
        ) : (
          <div className="table">
            {groups.map((g) => (
              <article key={g.id} className="row">
                <strong>{MistakeReasonText[g.reason_key]}</strong>
                <span>
                  {formatDateOnly(g.scheduled_date)} · 已移出 {g.finished_symbol_ids.length} /
                  共 {g.queue_symbol_ids.length + g.finished_symbol_ids.length} 字
                </span>
                <StatusBadge value={g.status} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel wide">
        <h2>最近练习会话</h2>
        {recentSessions.length === 0 ? (
          <EmptyState title="还没有练习会话" />
        ) : (
          <div className="table">
            {recentSessions.map((s) => (
              <article key={s.id} className="row">
                <strong>{PracticeModeText[s.mode as PracticeMode] ?? s.mode}</strong>
                <span>
                  {formatDate(s.started_at)} · 错 {s.mistake_count} 题
                  {s.remedial_reason ? ` · 补练：${MistakeReasonText[s.remedial_reason as MistakeReason]}` : ""}
                </span>
                <StatusBadge value={s.finished_at ? `得分 ${s.score}` : "进行中"} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
