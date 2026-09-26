import { listAll, putRow, STORES } from "../utils/indexedDb";
import type { Lesson } from "../types/Lesson";

export async function listLesson(): Promise<Lesson[]> {
  return listAll<Lesson>(STORES.lesson);
}

export async function saveLesson(payload: Lesson): Promise<Lesson> {
  return putRow(STORES.lesson, payload);
}
