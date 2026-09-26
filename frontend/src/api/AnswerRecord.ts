import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import type { AnswerRecord } from "../types/AnswerRecord";

const endpoint = "/api/answer-record";
const STORAGE_KEY = "braille-trainer:answer-record";

function seedRows(): AnswerRecord[] {
  return [...(mockData.answerRecord as unknown as AnswerRecord[])];
}

function readLocal(): AnswerRecord[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnswerRecord[]) : null;
  } catch {
    return null;
  }
}

function writeLocal(rows: AnswerRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 本地存储不可用时保持内存态，界面仍可操作。
  }
}

export async function listAnswerRecord(): Promise<AnswerRecord[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readLocal() ?? seedRows();
}

export async function saveAnswerRecord(payload: AnswerRecord) {
  console.info(LOG_TEMPLATES.AnswerRecord[0], payload);
  const current = readLocal() ?? seedRows();
  const next = current.some((row) => row.id === payload.id)
    ? current.map((row) => (row.id === payload.id ? payload : row))
    : [...current, payload];
  writeLocal(next);
  return payload;
}
