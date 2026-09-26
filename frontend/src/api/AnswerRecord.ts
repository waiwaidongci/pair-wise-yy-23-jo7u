import { listAll, putRow, STORES } from "../utils/indexedDb";
import type { AnswerRecord } from "../types/AnswerRecord";

export async function listAnswerRecord(): Promise<AnswerRecord[]> {
  return listAll<AnswerRecord>(STORES.answerRecord);
}

export async function saveAnswerRecord(payload: AnswerRecord): Promise<AnswerRecord> {
  return putRow(STORES.answerRecord, payload);
}
