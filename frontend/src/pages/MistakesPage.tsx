import { useRef, useState } from "react";
import { useMistakeBook, CodedError } from "../hooks/useMistakeBook";
import { useRemedialRunner } from "../hooks/useRemedialRunner";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { MistakeReasonText } from "../constants/MistakeReason";
import type { MistakeReason } from "../types/MistakeReason";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import { BrailleCell } from "../components/common/BrailleCell";
import { RemedialGroupCard } from "../components/common/RemedialGroupCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate, formatDateOnly } from "../utils/formatters";
import { todayKey } from "../utils/week";

const messageOf = (e: unknown) => (e instanceof CodedError ? e.message : e instanceof Error ? e.message : String(e));

export function MistakesPage() {
  const book = useMistakeBook();
  const [reason, setReason] = useState<MistakeReason | "">("");
  const [date, setDate] = useState(todayKey());
  const [notice, setNotice] = useState("");
  const [runningGroupId, setRunningGroupId] = useState<number | null>(null);

  const onSchedule = async () => {
    setNotice("");
    try {
      if (!reason) throw new CodedError("VALIDATION_FAILED");
      const { reused } = await book.schedule(reason, date);
      setNotice(
        reused
          ? "该原因已有未结束的补练分组，已沿用原会话并刷新补练日期与队列"
          : "已按该错误原因创建补练分组，可到下方卡片查看"
      );
    } catch (e) {
      setNotice(messageOf(e));
    }
  };

  const onOpen = async (groupId: number) => {
    setNotice("");
    try {
      await book.openGroup(groupId);
      setRunningGroupId(groupId);
    } catch (e) {
      setNotice(messageOf(e));
    }
  };

  if (runningGroupId != null) {
    return <RemedialRunner groupId={runningGroupId} onClose={() => setRunningGroupId(null)} />;
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">mistakes</p>
          <h1>错题本</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      {notice && <p className="notice">{notice}</p>}

      <section className="panel wide">
        <h2>本周错误原因 · 整组安排补练</h2>
        {book.reasonCards.length === 0 ? (
          <EmptyState title="本周还没有错题，先去做点练习吧" />
        ) : (
          <>
            <div className="reason-grid">
              {book.reasonCards.map((card) => (
                <button
                  key={card.reason}
                  type="button"
                  className={reason === card.reason ? "reason-card active" : "reason-card"}
                  onClick={() => setReason(card.reason)}
                >
                  <strong>{card.text}</strong>
                  <span>{card.symbolCount} 个字 · 本周错 {card.wrongCount} 次</span>
                </button>
              ))}
            </div>
            <div className="schedule-bar">
              <label>
                补练日期
                <input type="date" value={date} min={todayKey()} onChange={(e) => setDate(e.target.value)} />
              </label>
              <button type="button" className="primary" onClick={() => void onSchedule()}>
                安排补练
              </button>
              <span className="hint">
                队列将收录 {book.previewQueue.length} 个未掌握点字，按首次出错时间排序、同原因连续不超过两题
              </span>
            </div>
          </>
        )}
      </section>

      <section className="panel wide">
        <h2>补练分组</h2>
        {book.groupCards.length === 0 ? (
          <EmptyState title="还没有安排补练，先在上面选择错误原因和日期" />
        ) : (
          <div className="group-grid">
            {book.groupCards.map((card) => (
              <RemedialGroupCard key={card.group.id} card={card} onOpen={(id) => void onOpen(id)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel wide">
        <h2>本周错题条目</h2>
        {book.entries.length === 0 ? (
          <EmptyState title="本周暂无错题记录" />
        ) : (
          <div className="table">
            {book.entries.map((entry) => (
              <article key={entry.symbol.id} className={entry.mastered ? "row muted" : "row"}>
                <span className="cell-with-symbol">
                  <BrailleCell pattern={entry.symbol.cell_pattern} size={10} />
                  <strong>{entry.symbol.letter}</strong>
                  <small>{entry.symbol.pinyin}</small>
                </span>
                <span>
                  {entry.primaryReason ? MistakeReasonText[entry.primaryReason as MistakeReason] : "—"} · 错 {entry.wrongCount} 次
                  <br />
                  <small>首次出错 {formatDate(entry.firstMistakeAt)}</small>
                </span>
                {entry.mastered ? (
                  <StatusBadge value="MASTERED" />
                ) : (
                  <button type="button" onClick={() => void book.markMastered(entry.symbol.id, true)}>
                    标记掌握
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/** 补练进行页：答对本次移出该字，答错排到组尾，结果同步错题本与进度页 */
function RemedialRunner({ groupId, onClose }: { groupId: number; onClose: () => void }) {
  const runner = useRemedialRunner(groupId);
  const sessions = usePracticeSessionStore((s) => s.rows);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const startRef = useRef(Date.now());

  const session = sessions.find((s) => s.id === runner.group?.practice_session_id);

  const submit = async (forcedWrong: boolean) => {
    const symbol = runner.currentSymbol;
    if (!symbol) return;
    const correct = !forcedWrong && input.trim().toLowerCase() === symbol.letter.toLowerCase();
    await runner.answer(correct, input.trim(), Date.now() - startRef.current);
    setFeedback(
      correct
        ? `答对了，「${symbol.letter}」本次移出补练`
        : `答错了，「${symbol.letter}」已排到组尾，稍后再练`
    );
    setInput("");
    startRef.current = Date.now();
  };

  if (!runner.group) {
    return (
      <main className="page">
        <EmptyState title="补练分组不存在或已被移除" />
        <button type="button" onClick={onClose}>返回错题本</button>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">remedial</p>
          <h1>错题补练 · {MistakeReasonText[runner.group.reason_key]}</h1>
        </div>
        <button type="button" onClick={onClose}>返回错题本</button>
      </section>

      <section className="panel wide runner">
        <p className="hint">
          补练日期 {formatDateOnly(runner.group.scheduled_date)} · 剩余 {runner.remaining} 字 · 已移出 {runner.doneCount} 字
          {session && ` · 本次得分 ${session.score}`}
        </p>
        {runner.finished ? (
          <div className="runner-done">
            <h2>本组补练完成 🎉</h2>
            <p>全部点字已答对移出，掌握情况与成绩已同步到错题本和学习进度。</p>
            <button type="button" className="primary" onClick={onClose}>返回错题本</button>
          </div>
        ) : (
          <RunnerQuestion
            symbol={runner.currentSymbol}
            input={input}
            feedback={feedback}
            onInput={setInput}
            onSubmit={(forced) => void submit(forced)}
          />
        )}
      </section>
    </main>
  );
}

function RunnerQuestion({
  symbol,
  input,
  feedback,
  onInput,
  onSubmit
}: {
  symbol: BrailleSymbol | null;
  input: string;
  feedback: string;
  onInput: (v: string) => void;
  onSubmit: (forcedWrong: boolean) => void;
}) {
  if (!symbol) return <EmptyState title="本组队列已空" />;
  return (
    <div className="runner-question">
      <BrailleCell pattern={symbol.cell_pattern} size={26} />
      <p className="hint">提示：{symbol.pinyin}（{symbol.difficulty}）</p>
      <div className="schedule-bar">
        <input
          value={input}
          placeholder="输入这个点字代表的字符"
          onChange={(e) => onInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit(false)}
        />
        <button type="button" className="primary" onClick={() => onSubmit(false)}>提交</button>
        <button type="button" onClick={() => onSubmit(true)}>不会，记为答错</button>
      </div>
      {feedback && <p className="notice">{feedback}</p>}
    </div>
  );
}
