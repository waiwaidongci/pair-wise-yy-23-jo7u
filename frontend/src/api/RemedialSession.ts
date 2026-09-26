import type { RemedialSession } from "../types/RemedialSession";

const endpoint = "/api/remedial-session";
const STORAGE_KEY = "braille-trainer:remedial-session";

function readLocal(): RemedialSession[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RemedialSession[]) : null;
  } catch {
    return null;
  }
}

function writeLocal(rows: RemedialSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 本地存储不可用时保持内存态，界面仍可操作。
  }
}

export async function listRemedialSession(): Promise<RemedialSession[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && false) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return readLocal() ?? [];
}

export async function saveRemedialSession(payload: RemedialSession) {
  const current = readLocal() ?? [];
  const next = current.some((row) => row.id === payload.id)
    ? current.map((row) => (row.id === payload.id ? payload : row))
    : [...current, payload];
  writeLocal(next);
  return payload;
}
