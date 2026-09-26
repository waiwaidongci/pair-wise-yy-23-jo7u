import { useEffect, useMemo } from "react";
import { ChartPanel } from "../components/common/ChartPanel";
import { EmptyState } from "../components/common/EmptyState";
import { LessonProgress } from "../components/common/LessonProgress";
import { ResultBadge } from "../components/common/ResultBadge";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { isCorrectRecord } from "../constants/AnswerCorrectness";
import { MasteryLevel, MasteryLevelText } from "../constants/MasteryLevel";
import { RemedialSessionStatusText, resolveRemedialStatus } from "../constants/RemedialSessionStatus";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";
import { formatDate, formatDateKey, formatDateOnly } from "../utils/formatters";

export function ProgressPage() {
  const { rows: records, load: loadRecords } = useAnswerRecordStore();
  const { rows: symbols, load: loadSymbols } = useBrailleSymbolStore();
  const { rows: lessons, load: loadLessons } = useLessonStore();
  const { rows: practiceSessions, load: loadPracticeSessions } = usePracticeSessionStore();
  const { rows: remedialSessions, load: loadRemedialSessions } = useRemedialSessionStore();

  useEffect(() => {
    void loadRecords();
    void loadSymbols();
    void loadLessons();
    void loadPracticeSessions();
    void loadRemedialSessions();
  }, [loadRecords, loadSymbols, loadLessons, loadPracticeSessions, loadRemedialSessions]);

  const todayKey = formatDateKey(new Date());
  const correctCount = records.filter(isCorrectRecord).length;
  const accuracy = records.length === 0 ? 0 : Math.round((correctCount / records.length) * 100);
  const masteredCount = symbols.filter((symbol) => symbol.mastery === "MASTERED").length;
  const letterOf = (symbolId: number) => symbols.find((symbol) => symbol.id === symbolId)?.letter ?? `#${symbolId}`;
  const recentRecords = useMemo(
    () => [...records].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
    [records]
  );

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">braille-trainer</p>
        <h1>学习进度</h1>
      </div>
      <StatusBadge value="LOCAL_DATA" />
    </section>

    <section className="metrics">
      <StatCard label="答题总数" value={records.length} />
      <StatCard label="正确率" value={`${accuracy}%`} />
      <StatCard label="已掌握点字" value={`${masteredCount}/${symbols.length}`} />
    </section>

    <section className="workbench">
      <div className="panel wide">
        <h2>补练会话</h2>
        {remedialSessions.length === 0 ? <EmptyState title="暂无补练会话" /> : <div className="table">
          {remedialSessions.map((session) => <article key={session.id} className="row">
            <strong>{session.reasons.join("、")}</strong>
            <span>可练日期 {formatDateOnly(session.scheduled_date)} · 剩余 {session.queue.length} 字</span>
            <StatusBadge value={RemedialSessionStatusText[resolveRemedialStatus(session, todayKey)]} />
          </article>)}
        </div>}

        <h2>最近答题记录</h2>
        {recentRecords.length === 0 ? <EmptyState title="暂无答题记录" /> : <div className="table">
          {recentRecords.map((record) => <article key={record.id} className="row">
            <strong>{letterOf(record.symbol_id)}</strong>
            <span>{formatDate(record.created_at)} · 作答 {record.user_answer || "（空）"}{record.mistake_reason ? ` · ${record.mistake_reason}` : ""}</span>
            <ResultBadge title="" value={record.correct} />
          </article>)}
        </div>}
      </div>

      <div className="panel">
        <h2>掌握度分布</h2>
        <div className="table">
          {MasteryLevel.map((level) => <article key={level} className="row">
            <strong>{MasteryLevelText[level]}</strong>
            <span>{symbols.filter((symbol) => symbol.mastery === level).length} 字</span>
          </article>)}
        </div>
        <ChartPanel title="练习会话" value={`${practiceSessions.length} 次`} />
        <h2>课程</h2>
        {lessons.map((lesson) => <LessonProgress key={lesson.id} title={lesson.title} value={lesson.stage} />)}
      </div>
    </section>
  </main>;
}
