import { useEffect, useMemo, useRef, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { PracticeMode, PracticeModeText } from "../constants/PracticeMode";
import { MistakeReason, MistakeReasonText } from "../constants/MistakeReason";
import type { MistakeReason as MistakeReasonType } from "../types/MistakeReason";
import { createDefaultPracticeSession } from "../constructors/PracticeSessionConstructor";
import { createDefaultAnswerRecord } from "../constructors/AnswerRecordConstructor";
import { BrailleCell } from "../components/common/BrailleCell";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";

/** 练习模式：选课程与模式后逐题作答，结果写入会话与答题记录（错题本的数据来源） */
export function PracticePage() {
  const lessons = useLessonStore((s) => s.rows);
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const [lessonId, setLessonId] = useState<number>(0);
  const [mode, setMode] = useState<(typeof PracticeMode)[number]>("CELL_TO_TEXT");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [reason, setReason] = useState<MistakeReasonType>("DOT_CONFUSION");
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    void useLessonStore.getState().load();
    void useBrailleSymbolStore.getState().load();
    void usePracticeSessionStore.getState().load();
    void useAnswerRecordStore.getState().load();
  }, []);

  const lesson = lessons.find((l) => l.id === lessonId) ?? null;
  const queue = useMemo(
    () => (lesson ? lesson.symbol_ids.map((id) => symbols.find((s) => s.id === id)).filter((s) => s != null) : []),
    [lesson, symbols]
  );
  const current = queue[index] ?? null;

  const start = async () => {
    if (!lesson) return;
    const session = await usePracticeSessionStore.getState().upsert(
      createDefaultPracticeSession({ id: 0, lesson_id: lesson.id, mode })
    );
    setSessionId(session.id);
    setIndex(0);
    setDone(false);
    setFeedback("");
    startRef.current = Date.now();
  };

  const submit = async (forcedWrong: boolean) => {
    if (!current || sessionId == null) return;
    const correct = !forcedWrong && input.trim().toLowerCase() === current.letter.toLowerCase();
    await useAnswerRecordStore.getState().addRecord(
      createDefaultAnswerRecord({
        id: 0,
        session_id: sessionId,
        symbol_id: current.id,
        user_answer: input.trim(),
        correct,
        latency_ms: Date.now() - startRef.current,
        mistake_reason: correct ? "" : reason
      })
    );
    setFeedback(correct ? "答对了" : `已记为答错（${MistakeReasonText[reason]}），可在错题本安排补练`);
    setInput("");
    startRef.current = Date.now();

    const last = index + 1 >= queue.length;
    const records = useAnswerRecordStore.getState().rows.filter((r) => r.session_id === sessionId);
    const mistakes = records.filter((r) => !r.correct).length;
    const session = usePracticeSessionStore.getState().rows.find((s) => s.id === sessionId);
    if (session) {
      await usePracticeSessionStore.getState().upsert({
        ...session,
        mistake_count: mistakes,
        score: records.length === 0 ? 0 : Math.round(((records.length - mistakes) / records.length) * 100),
        finished_at: last ? new Date().toISOString() : ""
      });
    }
    if (last) setDone(true);
    else setIndex(index + 1);
  };

  if (sessionId == null) {
    return (
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">practice</p>
            <h1>练习模式</h1>
          </div>
          <StatusBadge value="LOCAL_DATA" />
        </section>
        <section className="panel wide">
          <h2>开始一次练习</h2>
          {lessons.length === 0 ? (
            <EmptyState title="暂无课程" />
          ) : (
            <div className="schedule-bar">
              <label>
                课程
                <select value={lessonId} onChange={(e) => setLessonId(Number(e.target.value))}>
                  <option value={0}>请选择</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </label>
              <label>
                模式
                <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
                  {PracticeMode.filter((m) => m !== "REMEDIAL").map((m) => (
                    <option key={m} value={m}>{PracticeModeText[m]}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="primary" disabled={!lesson} onClick={() => void start()}>
                开始练习
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">practice</p>
          <h1>{lesson?.title} · {PracticeModeText[mode]}</h1>
        </div>
        <span className="hint">{Math.min(index + 1, queue.length)} / {queue.length}</span>
      </section>
      <section className="panel wide runner">
        {done || !current ? (
          <div className="runner-done">
            <h2>本次练习完成</h2>
            <p>答错的点字已进入错题本，可按本周错误原因安排补练。</p>
            <button type="button" className="primary" onClick={() => setSessionId(null)}>再练一次</button>
          </div>
        ) : (
          <div className="runner-question">
            <BrailleCell pattern={current.cell_pattern} size={26} />
            <p className="hint">提示：{current.pinyin}（{current.difficulty}）</p>
            <div className="schedule-bar">
              <input
                value={input}
                placeholder="输入这个点字代表的字符"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void submit(false)}
              />
              <label>
                答错原因
                <select value={reason} onChange={(e) => setReason(e.target.value as MistakeReasonType)}>
                  {MistakeReason.map((r) => (
                    <option key={r} value={r}>{MistakeReasonText[r]}</option>
                  ))}
                </select>
              </label>
              <button type="button" className="primary" onClick={() => void submit(false)}>提交</button>
              <button type="button" onClick={() => void submit(true)}>不会，记为答错</button>
            </div>
            {feedback && <p className="notice">{feedback}</p>}
          </div>
        )}
      </section>
    </main>
  );
}
