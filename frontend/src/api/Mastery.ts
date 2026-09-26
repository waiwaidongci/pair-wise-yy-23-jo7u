import { listAll, putRow, STORES } from "../utils/indexedDb";
import type { MasteryRow } from "../mocks/seedData";

export async function listMastery(): Promise<MasteryRow[]> {
  return listAll<MasteryRow>(STORES.mastery);
}

/** 按点字维度写掌握标记：已存在则更新，否则新建 */
export async function setMastery(symbolId: number, mastered: boolean): Promise<MasteryRow> {
  const rows = await listMastery();
  const existing = rows.find((r) => r.symbol_id === symbolId);
  const payload: MasteryRow = existing
    ? { ...existing, mastered, updated_at: new Date().toISOString() }
    : { id: 0, symbol_id: symbolId, mastered, updated_at: new Date().toISOString() };
  return putRow(STORES.mastery, payload);
}
