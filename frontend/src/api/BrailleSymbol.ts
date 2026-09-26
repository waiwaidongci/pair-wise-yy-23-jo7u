import { LOG_TEMPLATES } from "../constants/logTemplates";
import { mockData } from "../mocks/seedData";
import type { BrailleSymbol } from "../types/BrailleSymbol";

const endpoint = "/api/braille-symbol";
const STORAGE_KEY = "braille-trainer:braille-symbol";

function seedRows(): BrailleSymbol[] {
  return [...(mockData.brailleSymbol as unknown as BrailleSymbol[])];
}

function readLocal(): BrailleSymbol[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BrailleSymbol[]) : null;
  } catch {
    return null;
  }
}

function writeLocal(rows: BrailleSymbol[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    // 本地存储不可用时保持内存态，界面仍可操作。
  }
}

export async function listBrailleSymbol(): Promise<BrailleSymbol[]> {
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

export async function saveBrailleSymbol(payload: BrailleSymbol) {
  console.info(LOG_TEMPLATES.BrailleSymbol[1], payload);
  const current = readLocal() ?? seedRows();
  const next = current.some((row) => row.id === payload.id)
    ? current.map((row) => (row.id === payload.id ? payload : row))
    : [...current, payload];
  writeLocal(next);
  return payload;
}
