/**
 * IndexedDB 最小封装：数据库 braille-trainer，版本 1。
 * 首次打开（onupgradeneeded）时创建全部对象仓库并灌入种子数据；
 * 之后每次启动直接复用本地数据，练习结果才能跨刷新保留。
 */
import { buildSeedSnapshot } from "../mocks/seedData";

export const DB_NAME = "braille-trainer";
export const DB_VERSION = 1;

export const STORES = {
  brailleSymbol: "brailleSymbols",
  lesson: "lessons",
  practiceSession: "practiceSessions",
  answerRecord: "answerRecords",
  remedialSession: "remedialSessions",
  mastery: "mastery"
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of Object.values(STORES)) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id", autoIncrement: true });
        }
      }
      const seed = buildSeedSnapshot();
      const tx = req.transaction;
      if (!tx) return;
      const put = (store: string, rows: readonly object[]) => {
        const os = tx.objectStore(store);
        rows.forEach((row) => os.add(row));
      };
      put(STORES.brailleSymbol, seed.brailleSymbols);
      put(STORES.lesson, seed.lessons);
      put(STORES.practiceSession, seed.practiceSessions);
      put(STORES.answerRecord, seed.answerRecords);
      put(STORES.remedialSession, seed.remedialSessions);
      put(STORES.mastery, seed.mastery);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function listAll<T>(store: string): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

export async function putRow<T extends { id?: number }>(store: string, row: T): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    // id 为 0/缺省视为新建，剥离主键让 autoIncrement 生效；有 id 才是更新
    const payload: object = row.id ? row : (() => {
      const { id: _id, ...rest } = row;
      return rest;
    })();
    const req = tx.objectStore(store).put(payload);
    req.onsuccess = () => resolve({ ...(payload as object), id: req.result as number } as T);
    req.onerror = () => reject(req.error);
  });
}

export async function getRow<T>(store: string, id: number): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}
