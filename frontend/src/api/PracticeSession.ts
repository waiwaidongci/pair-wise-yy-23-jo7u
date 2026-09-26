import { listAll, putRow, STORES } from "../utils/indexedDb";
import type { PracticeSession } from "../types/PracticeSession";

export async function listPracticeSession(): Promise<PracticeSession[]> {
  return listAll<PracticeSession>(STORES.practiceSession);
}

export async function savePracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  return putRow(STORES.practiceSession, payload);
}
