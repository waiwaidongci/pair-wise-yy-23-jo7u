import { useEffect, useState } from "react";
import { useAnswerRecordStore } from "../stores/AnswerRecordStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useRemedialSessionStore } from "../stores/RemedialSessionStore";

// 补练答题的页面操作层：只编排各 store，排序规则在 utils/remedialOrdering，
// 会话保存在 stores/RemedialSessionStore。
export function useRemedialPractice(sessionId: number | null) {
  const session = useRemedialSessionStore((state) => state.rows.find((row) => row.id === sessionId));
  const recordResult = useRemedialSessionStore((state) => state.recordResult);
  const symbols = useBrailleSymbolStore((state) => state.rows);
  const applyResultToMastery = useBrailleSymbolStore((state) => state.applyResultToMastery);
  const addRecord = useAnswerRecordStore((state) => state.addRecord);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"YES" | "NO" | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());

  const currentSymbolId = session?.queue[0] ?? null;
  const currentSymbol = symbols.find((symbol) => symbol.id === currentSymbolId) ?? null;

  useEffect(() => {
    setInput("");
    setQuestionStartedAt(Date.now());
  }, [currentSymbolId, sessionId]);

  const changeInput = (value: string) => {
    setInput(value);
    setFeedback(null);
  };

  const submit = async () => {
    if (!session || !currentSymbol || !input.trim()) return;
    const answer = input.trim();
    const correct = answer.toLowerCase() === currentSymbol.letter.toLowerCase();
    // 先更新补练会话队列，再把结果同步到答题记录与掌握度（错题本、进度页随之更新）
    await recordResult(session.id, currentSymbol.id, correct);
    await addRecord({
      session_id: session.id,
      symbol_id: currentSymbol.id,
      user_answer: answer,
      correct: correct ? "YES" : "NO",
      latency_ms: String(Date.now() - questionStartedAt),
      mistake_reason: correct ? "" : session.reason_by_symbol[String(currentSymbol.id)] ?? "",
      created_at: new Date().toISOString()
    });
    await applyResultToMastery(currentSymbol.id, correct);
    setFeedback(correct ? "YES" : "NO");
  };

  return {
    session,
    currentSymbol,
    input,
    setInput: changeInput,
    feedback,
    submit,
    remaining: session?.queue.length ?? 0
  };
}
