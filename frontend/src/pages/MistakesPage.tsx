import { useEffect, useMemo, useState } from "react";
import { BrailleCell } from "../components/common/BrailleCell";
import { EmptyState } from "../components/common/EmptyState";
import { RemedialSessionCard } from "../components/common/RemedialSessionCard";
import { ResultBadge } from "../components/common/ResultBadge";
import { StatusBadge } from "../components/common/StatusBadge";
import { isCorrectRecord } from "../constants/AnswerCorrectness";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { useRemedialPractice } from "../hooks/useRemedialPractice";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { RemedialSession } from "../types/RemedialSession";
import { formatDate, formatDateKey } from "../utils/formatters";
import { collectRemedialCandidates, listWeeklyReasons } from "../utils/remedialOrdering";

type MistakeGroup = { reason: string; items: { symbol: BrailleSymbol; count: number; firstAt: string }[] };

function groupMistakes(records: AnswerRecord[], symbols: BrailleSymbol[]): MistakeGroup[] {
  const symbolById = new Map(symbols.map((symbol) => [symbol.id, symbol]));
  const groups = new Map<string, Map<number, { count: number; firstAt: string }>>();
  for (const record of records) {
    if (isCorrectRecord(record) || !record.mistake_reason) continue;
    const symbolStats = groups.get(record.mistake_reason) ?? new Map<number, { count: number; firstAt: string }>();
    const prev = symbolStats.get(record.symbol_id);
    symbolStats.set(record.symbol_id, {
      count: (prev?.count ?? 0) + 1,
      firstAt: prev && prev.firstAt < record.created_at ? prev.firstAt : record.created_at
    });
    groups.set(record.mistake_reason, symbolStats);
  }
  return [...groups.entries()].map(([reason, symbolStats]) => ({
    reason,
    items: [...symbolStats.entries()]
      .map(([symbolId, stat]) => ({ symbol: symbolById.get(symbolId), count: stat.count, firstAt: stat.firstAt }))
      .filter((item): item is { symbol: BrailleSymbol; count: number; firstAt: string } => item.symbol !== undefined)
      .sort((a, b) => a.firstAt.localeCompare(b.firstAt))
  }));
}

export function MistakesPage() {
  const { rows: records, load: loadRecords } = useAnswerRecordStore();
  const { rows: symbols, load: loadSymbols, setMastery } = useBrailleSymbolStore();
  const { rows: sessions, load: loadSessions, assign } = useRemedialSessionStore();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const practice = useRemedialPractice(activeSessionId);

  useEffect(() => {
    void loadRecords();
    void loadSymbols();
    void loadSessions();
  }, [loadRecords, loadSymbols, loadSessions]);

  const todayKey = formatDateKey(new Date());
  const weeklyReasons = useMemo(() => listWeeklyReasons(records), [records]);
  const mistakeGroups = useMemo(() => groupMistakes(records, symbols), [records, symbols]);

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((item) => item !== reason) : [...prev, reason]));
  };

  const handleAssign = async () => {
    setError("");
    setNotice("");
    if (selectedReasons.length === 0 || !scheduledDate) {
      setError(ERROR_MESSAGES.VALIDATION_FAILED);
      return;
    }
    const candidates = collectRemedialCandidates(records, symbols, selectedReasons);
    if (candidates.length === 0) {
      setError(ERROR_MESSAGES.REMEDIAL_EMPTY_GROUP);
      return;
    }
    const { session, reused } = await assign(selectedReasons, scheduledDate, candidates);
    setNotice(reused ? "相同原因和日期的补练已存在，沿用原会话。" : `补练会话已创建，共 ${session.queue.length} 字。`);
  };

  const openSession = (session: RemedialSession) => {
    setError("");
    setActiveSessionId(session.id);
  };

  const lockedSession = () => setError(ERROR_MESSAGES.REMEDIAL_LOCKED);

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">braille-trainer</p>
        <h1>错题本</h1>
      </div>
      <StatusBadge value="LOCAL_DATA" />
    </section>

    <section className="panel wide">
      <h2>布置补练</h2>
      {weeklyReasons.length === 0 ? <EmptyState title="本周暂无错误原因" /> : <>
        <div className="reason-pick">
          {weeklyReasons.map(({ reason, count }) => <label key={reason} className={selectedReasons.includes(reason) ? "active" : ""}>
            <input type="checkbox" checked={selectedReasons.includes(reason)} onChange={() => toggleReason(reason)} />
            {reason}（{count} 次）
          </label>)}
        </div>
        <div className="toolbar">
          <label>补练日期
            <input type="date" min={todayKey} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} />
          </label>
          <button className="primary" onClick={() => void handleAssign()}>安排补练</button>
        </div>
      </>}
      {error && <p className="error-text">{error}</p>}
      {notice && <p className="notice-text">{notice}</p>}
    </section>

    <section className="panel wide">
      <h2>补练会话</h2>
      {sessions.length === 0 ? <EmptyState title="暂无补练会话" /> : <div className="remedial-grid">
        {sessions.map((session) => <RemedialSessionCard key={session.id} session={session} todayKey={todayKey} onOpen={openSession} onLocked={lockedSession} />)}
      </div>}
    </section>

    {practice.session && <section className="panel wide">
      <h2>补练进行中 · 剩余 {practice.remaining} 字</h2>
      {practice.currentSymbol ? <div className="practice-runner">
        <BrailleCell title={practice.currentSymbol.cell_pattern} value="?" />
        <label>请写出该点阵对应的字母
          <input type="text" value={practice.input} onChange={(event) => practice.setInput(event.target.value)} />
        </label>
        <div className="toolbar">
          <button className="primary" onClick={() => void practice.submit()}>提交</button>
          <button className="ghost" onClick={() => setActiveSessionId(null)}>关闭</button>
        </div>
        {practice.feedback && <ResultBadge
          title={practice.feedback === "YES" ? "回答正确，本字已移出本次补练" : "回答错误，本字已排到组尾"}
          value={practice.feedback} />}
      </div> : <div className="practice-runner">
        <p>本组补练已完成，结果已同步到错题本和学习进度。</p>
        <button className="ghost" onClick={() => setActiveSessionId(null)}>关闭</button>
      </div>}
    </section>}

    <section className="panel wide">
      <h2>错题归类</h2>
      {mistakeGroups.length === 0 ? <EmptyState title="暂无错题" /> : mistakeGroups.map((group) => <div key={group.reason} className="mistake-group">
        <h3>{group.reason}</h3>
        <div className="table">
          {group.items.map((item) => <article key={item.symbol.id} className="row mistake-row">
            <strong>{item.symbol.letter} · {item.symbol.cell_pattern}</strong>
            <span>首次出错 {formatDate(item.firstAt)} · {item.count} 次</span>
            <StatusBadge value={MasteryLevelText[item.symbol.mastery as keyof typeof MasteryLevelText] ?? item.symbol.mastery} />
            <button className="ghost" onClick={() => void setMastery(item.symbol.id, item.symbol.mastery === "MASTERED" ? "LEARNING" : "MASTERED")}>
              {item.symbol.mastery === "MASTERED" ? "取消掌握" : "标记掌握"}
            </button>
          </article>)}
        </div>
      </div>)}
    </section>
  </main>;
}
