import { listAll, putRow, getRow, STORES } from "../utils/indexedDb";
import type { RemedialSession } from "../types/RemedialSession";

/** 补练分组的持久化：队列、状态、关联练习会话都落 IndexedDB */
export async function listRemedialSession(): Promise<RemedialSession[]> {
  return listAll<RemedialSession>(STORES.remedialSession);
}

export async function getRemedialSession(id: number): Promise<RemedialSession | undefined> {
  return getRow<RemedialSession>(STORES.remedialSession, id);
}

export async function saveRemedialSession(payload: RemedialSession): Promise<RemedialSession> {
  return putRow(STORES.remedialSession, payload);
}
