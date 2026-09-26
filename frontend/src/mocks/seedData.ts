import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { RemedialSession } from "../types/RemedialSession";
import { toDateKey, todayKey } from "../utils/week";

/** 掌握标记（按点字维度）：补练答对、错题本手动标记都会写这里 */
export interface MasteryRow {
  id: number;
  symbol_id: number;
  mastered: boolean;
  updated_at: string;
}

export interface SeedSnapshot {
  brailleSymbols: BrailleSymbol[];
  lessons: Lesson[];
  practiceSessions: PracticeSession[];
  answerRecords: AnswerRecord[];
  remedialSessions: RemedialSession[];
  mastery: MasteryRow[];
}

const isoDaysAgo = (days: number, hour: number, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const dateKeyDaysFromNow = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toDateKey(d);
};

/**
 * 种子数据：时间一律相对“今天”生成，保证任意日期打开应用，
 * “本周错误原因”“首次出错时间排序”“未到日期锁定”都能直接演示。
 *
 * 数据设计要点：
 * - b/c/k 三个字本周最近一次都错在 DOT_CONFUSION 且首次出错时间最早，
 *   朴素排序会三连同原因，用来演示“同原因连续不超过两题”的交错重排；
 * - e(5) 已掌握，用来演示“会话只收尚未掌握的点字”；
 * - a(1) 已在今天的补练中答对移出，演示“答对本次移出 + 结果同步错题本”；
 * - 补练组 2 安排在明天，演示“未到日期卡片可见但打不开”。
 */
export function buildSeedSnapshot(): SeedSnapshot {
  const brailleSymbols: BrailleSymbol[] = [
    { id: 1, cell_pattern: "1", letter: "a", pinyin: "ā", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_a" },
    { id: 2, cell_pattern: "1-2", letter: "b", pinyin: "bō", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_b" },
    { id: 3, cell_pattern: "1-4", letter: "c", pinyin: "cī", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_c" },
    { id: 4, cell_pattern: "1-4-5", letter: "d", pinyin: "dē", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_d" },
    { id: 5, cell_pattern: "1-5", letter: "e", pinyin: "ē", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_e" },
    { id: 6, cell_pattern: "1-2-4", letter: "f", pinyin: "fó", category: "LETTER", difficulty: "中级", audio_hint_key: "letter_f" },
    { id: 7, cell_pattern: "1-2-4-5", letter: "g", pinyin: "gē", category: "LETTER", difficulty: "中级", audio_hint_key: "letter_g" },
    { id: 8, cell_pattern: "1-2-5", letter: "h", pinyin: "hē", category: "LETTER", difficulty: "中级", audio_hint_key: "letter_h" },
    { id: 9, cell_pattern: "3-4-5-6", letter: "数字号", pinyin: "shù zì hào", category: "NUMBER", difficulty: "中级", audio_hint_key: "number_sign" },
    { id: 10, cell_pattern: "2-3", letter: "，", pinyin: "dòu hào", category: "PUNCTUATION", difficulty: "初级", audio_hint_key: "comma" },
    { id: 11, cell_pattern: "1-3", letter: "k", pinyin: "kē", category: "LETTER", difficulty: "初级", audio_hint_key: "letter_k" }
  ];

  const lessons: Lesson[] = [
    { id: 1, title: "初级字母 a-e", symbol_ids: [1, 2, 3, 4, 5], stage: "初级", estimated_minutes: 15, unlock_rule: "默认解锁" },
    { id: 2, title: "中级字母 f-k", symbol_ids: [6, 7, 8, 11], stage: "中级", estimated_minutes: 20, unlock_rule: "完成初级字母" },
    { id: 3, title: "数字与标点", symbol_ids: [9, 10], stage: "中级", estimated_minutes: 10, unlock_rule: "完成初级字母" }
  ];

  const practiceSessions: PracticeSession[] = [
    { id: 1, lesson_id: 1, mode: "CELL_TO_TEXT", started_at: isoDaysAgo(3, 9), finished_at: isoDaysAgo(3, 9, 20), score: 60, mistake_count: 5, remedial_group_id: null, remedial_reason: null },
    { id: 2, lesson_id: 2, mode: "LISTENING", started_at: isoDaysAgo(2, 10), finished_at: isoDaysAgo(2, 10, 25), score: 75, mistake_count: 3, remedial_group_id: null, remedial_reason: null },
    { id: 3, lesson_id: 1, mode: "MIXED", started_at: isoDaysAgo(1, 16), finished_at: isoDaysAgo(1, 16, 30), score: 70, mistake_count: 4, remedial_group_id: null, remedial_reason: null },
    // 补练组 1 对应的练习会话：今天打开、尚未结束
    { id: 4, lesson_id: 0, mode: "REMEDIAL", started_at: isoDaysAgo(0, 8, 40), finished_at: "", score: 0, mistake_count: 0, remedial_group_id: 1, remedial_reason: "DOT_CONFUSION" }
  ];

  const rec = (
    id: number, session_id: number, symbol_id: number, correct: boolean,
    mistake_reason: string, answered_at: string, user_answer = "", latency_ms = 3200
  ): AnswerRecord => ({ id, session_id, symbol_id, user_answer, correct, latency_ms, mistake_reason, answered_at });

  const answerRecords: AnswerRecord[] = [
    // 三天前 · 课程1 点阵认读
    rec(1, 1, 1, false, "DOT_CONFUSION", isoDaysAgo(3, 9, 2), "b"),
    rec(2, 1, 2, false, "DIRECTION_FLIP", isoDaysAgo(3, 9, 5), "d"),
    rec(3, 1, 3, false, "DOT_CONFUSION", isoDaysAgo(3, 9, 8), "e"),
    rec(4, 1, 9, false, "PREFIX_FORGOT", isoDaysAgo(3, 9, 14)),
    rec(5, 1, 11, false, "DOT_CONFUSION", isoDaysAgo(3, 9, 11), "l"),
    rec(6, 1, 5, true, "", isoDaysAgo(3, 9, 17), "e", 2100),
    // 两天前 · 课程2 听写
    rec(7, 2, 4, false, "RHYTHM_MISS", isoDaysAgo(2, 10, 3)),
    rec(8, 2, 5, false, "DOT_CONFUSION", isoDaysAgo(2, 10, 6), "c"),
    rec(9, 2, 6, false, "HOMOPHONE_CONFUSE", isoDaysAgo(2, 10, 9), "h"),
    rec(10, 2, 2, false, "DOT_CONFUSION", isoDaysAgo(2, 10, 12), "c"),
    rec(11, 2, 7, true, "", isoDaysAgo(2, 10, 15), "g", 2600),
    // 昨天 · 课程1 混合练习
    rec(12, 3, 7, false, "RHYTHM_MISS", isoDaysAgo(1, 16, 2)),
    rec(13, 3, 8, false, "HOMOPHONE_CONFUSE", isoDaysAgo(1, 16, 5), "f"),
    rec(14, 3, 10, false, "RHYTHM_MISS", isoDaysAgo(1, 16, 8)),
    rec(15, 3, 9, false, "PREFIX_FORGOT", isoDaysAgo(1, 16, 11)),
    rec(16, 3, 5, true, "", isoDaysAgo(1, 16, 14), "e", 1800),
    // 今天 · 补练组 1（a 答对后本次移出并标记掌握）
    rec(17, 4, 1, true, "", isoDaysAgo(0, 8, 42), "a", 2400)
  ];

  const remedialSessions: RemedialSession[] = [
    {
      id: 1,
      reason_key: "DOT_CONFUSION",
      scheduled_date: todayKey(),
      created_at: isoDaysAgo(1, 18),
      updated_at: isoDaysAgo(0, 8, 42),
      status: "IN_PROGRESS",
      // 安排时的完整队列为 [1,2,9,3,11,4,6,7,8,10]，a(1) 已答对移出
      queue_symbol_ids: [2, 9, 3, 11, 4, 6, 7, 8, 10],
      finished_symbol_ids: [1],
      practice_session_id: 4
    },
    {
      id: 2,
      reason_key: "RHYTHM_MISS",
      scheduled_date: dateKeyDaysFromNow(1),
      created_at: isoDaysAgo(0, 7, 30),
      updated_at: isoDaysAgo(0, 7, 30),
      status: "SCHEDULED",
      queue_symbol_ids: [2, 3, 9, 11, 4, 6, 7, 8, 10],
      finished_symbol_ids: [],
      practice_session_id: null
    }
  ];

  // a(1) 今天补练答对后掌握；e(5) 昨天老师手动标记掌握 —— 两者都有本周错题记录，
  // 但不会再进入补练队列，用来演示“会话只收尚未掌握的点字”。
  const mastery: MasteryRow[] = [
    { id: 1, symbol_id: 1, mastered: true, updated_at: isoDaysAgo(0, 8, 42) },
    { id: 2, symbol_id: 5, mastered: true, updated_at: isoDaysAgo(1, 17, 0) }
  ];

  return { brailleSymbols, lessons, practiceSessions, answerRecords, remedialSessions, mastery };
}
