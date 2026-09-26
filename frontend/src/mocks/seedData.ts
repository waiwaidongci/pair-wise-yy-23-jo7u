export const mockData = {
  "brailleSymbol": [
    {
      "id": 1,
      "cell_pattern": "dots 1",
      "letter": "a",
      "pinyin": "a",
      "category": "LETTER",
      "difficulty": "LOW",
      "audio_hint_key": "audio/letter-a",
      "mastery": "FAMILIAR"
    },
    {
      "id": 2,
      "cell_pattern": "dots 1-2",
      "letter": "b",
      "pinyin": "bo",
      "category": "LETTER",
      "difficulty": "LOW",
      "audio_hint_key": "audio/letter-b",
      "mastery": "LEARNING"
    },
    {
      "id": 3,
      "cell_pattern": "dots 1-4",
      "letter": "c",
      "pinyin": "ci",
      "category": "LETTER",
      "difficulty": "MEDIUM",
      "audio_hint_key": "audio/letter-c",
      "mastery": "NEW"
    },
    {
      "id": 4,
      "cell_pattern": "dots 1-4-5",
      "letter": "d",
      "pinyin": "de",
      "category": "LETTER",
      "difficulty": "MEDIUM",
      "audio_hint_key": "audio/letter-d",
      "mastery": "LEARNING"
    },
    {
      "id": 5,
      "cell_pattern": "dots 1-5",
      "letter": "e",
      "pinyin": "e",
      "category": "LETTER",
      "difficulty": "LOW",
      "audio_hint_key": "audio/letter-e",
      "mastery": "NEW"
    },
    {
      "id": 6,
      "cell_pattern": "dots 1-2-4",
      "letter": "f",
      "pinyin": "fo",
      "category": "LETTER",
      "difficulty": "MEDIUM",
      "audio_hint_key": "audio/letter-f",
      "mastery": "MASTERED"
    },
    {
      "id": 7,
      "cell_pattern": "dots 1-2-4-5",
      "letter": "g",
      "pinyin": "ge",
      "category": "LETTER",
      "difficulty": "HIGH",
      "audio_hint_key": "audio/letter-g",
      "mastery": "NEW"
    },
    {
      "id": 8,
      "cell_pattern": "dots 1-2-5",
      "letter": "h",
      "pinyin": "he",
      "category": "LETTER",
      "difficulty": "HIGH",
      "audio_hint_key": "audio/letter-h",
      "mastery": "LEARNING"
    }
  ],
  "lesson": [
    {
      "id": 1,
      "title": "基础点位：a-e",
      "symbol_ids": [1, 2, 3, 4, 5],
      "stage": "第一阶段",
      "estimated_minutes": 15,
      "unlock_rule": "无"
    },
    {
      "id": 2,
      "title": "基础点位：f-h",
      "symbol_ids": [6, 7, 8],
      "stage": "第一阶段",
      "estimated_minutes": 20,
      "unlock_rule": "完成上一课"
    },
    {
      "id": 3,
      "title": "综合听写",
      "symbol_ids": [1, 2, 3, 4, 5, 6, 7, 8],
      "stage": "第二阶段",
      "estimated_minutes": 25,
      "unlock_rule": "前两课正确率达到 80%"
    }
  ],
  "practiceSession": [
    {
      "id": 1,
      "lesson_id": 1,
      "mode": "CELL_TO_TEXT",
      "started_at": "2026-09-21T09:00:00Z",
      "finished_at": "2026-09-21T09:20:00Z",
      "score": 80,
      "mistake_count": 4
    },
    {
      "id": 2,
      "lesson_id": 2,
      "mode": "LISTENING",
      "started_at": "2026-09-23T15:00:00Z",
      "finished_at": "2026-09-23T15:25:00Z",
      "score": 92,
      "mistake_count": 1
    },
    {
      "id": 3,
      "lesson_id": 3,
      "mode": "MIXED",
      "started_at": "2026-09-25T10:00:00Z",
      "finished_at": "2026-09-25T10:30:00Z",
      "score": 66,
      "mistake_count": 6
    }
  ],
  "answerRecord": [
    {
      "id": 1,
      "session_id": 1,
      "symbol_id": 3,
      "user_answer": "d",
      "correct": "NO",
      "latency_ms": "3200",
      "mistake_reason": "点位混淆",
      "created_at": "2026-09-21T09:01:00Z"
    },
    {
      "id": 2,
      "session_id": 1,
      "symbol_id": 4,
      "user_answer": "c",
      "correct": "NO",
      "latency_ms": "2800",
      "mistake_reason": "点位混淆",
      "created_at": "2026-09-21T09:05:00Z"
    },
    {
      "id": 3,
      "session_id": 1,
      "symbol_id": 1,
      "user_answer": "e",
      "correct": "NO",
      "latency_ms": "2100",
      "mistake_reason": "方向颠倒",
      "created_at": "2026-09-22T10:00:00Z"
    },
    {
      "id": 4,
      "session_id": 1,
      "symbol_id": 2,
      "user_answer": "h",
      "correct": "NO",
      "latency_ms": "3600",
      "mistake_reason": "点位混淆",
      "created_at": "2026-09-22T10:10:00Z"
    },
    {
      "id": 5,
      "session_id": 2,
      "symbol_id": 5,
      "user_answer": "a",
      "correct": "NO",
      "latency_ms": "2500",
      "mistake_reason": "方向颠倒",
      "created_at": "2026-09-23T15:02:00Z"
    },
    {
      "id": 6,
      "session_id": 2,
      "symbol_id": 7,
      "user_answer": "g ",
      "correct": "NO",
      "latency_ms": "4100",
      "mistake_reason": "拼写遗漏",
      "created_at": "2026-09-23T15:20:00Z"
    },
    {
      "id": 7,
      "session_id": 3,
      "symbol_id": 8,
      "user_answer": "b",
      "correct": "NO",
      "latency_ms": "3800",
      "mistake_reason": "听音辨字失败",
      "created_at": "2026-09-24T08:40:00Z"
    },
    {
      "id": 8,
      "session_id": 3,
      "symbol_id": 2,
      "user_answer": "d",
      "correct": "NO",
      "latency_ms": "2600",
      "mistake_reason": "方向颠倒",
      "created_at": "2026-09-24T09:00:00Z"
    },
    {
      "id": 9,
      "session_id": 3,
      "symbol_id": 6,
      "user_answer": "g",
      "correct": "NO",
      "latency_ms": "1900",
      "mistake_reason": "点位混淆",
      "created_at": "2026-09-24T11:00:00Z"
    },
    {
      "id": 10,
      "session_id": 3,
      "symbol_id": 1,
      "user_answer": "a",
      "correct": "YES",
      "latency_ms": "1500",
      "mistake_reason": "",
      "created_at": "2026-09-25T09:30:00Z"
    },
    {
      "id": 11,
      "session_id": 3,
      "symbol_id": 4,
      "user_answer": "b",
      "correct": "NO",
      "latency_ms": "3300",
      "mistake_reason": "点位混淆",
      "created_at": "2026-09-25T10:00:00Z"
    },
    {
      "id": 12,
      "session_id": 3,
      "symbol_id": 5,
      "user_answer": "e",
      "correct": "YES",
      "latency_ms": "1800",
      "mistake_reason": "",
      "created_at": "2026-09-25T10:10:00Z"
    },
    {
      "id": 13,
      "session_id": 1,
      "symbol_id": 6,
      "user_answer": "",
      "correct": "NO",
      "latency_ms": "8000",
      "mistake_reason": "听写超时",
      "created_at": "2026-09-14T09:00:00Z"
    }
  ]
} as const;
