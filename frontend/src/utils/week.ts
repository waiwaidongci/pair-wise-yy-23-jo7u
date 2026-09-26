/** 周工具：错题本按“本周错误原因”安排补练，这里统一周一到周日的口径 */

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> YYYY-MM-DD（本地时区） */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 本周一 00:00 */
export function startOfWeek(now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay(); // 0=周日
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

/** 下周一 00:00（本周区间的开区间右端） */
export function endOfWeek(now: Date = new Date()): Date {
  const start = startOfWeek(now);
  start.setDate(start.getDate() + 7);
  return start;
}

/** 判断 ISO 时间是否落在本周 */
export function isThisWeek(iso: string, now: Date = new Date()): boolean {
  const t = new Date(iso).getTime();
  return t >= startOfWeek(now).getTime() && t < endOfWeek(now).getTime();
}

/** 今天的 YYYY-MM-DD */
export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

/** 补练日期是否已可练：安排日期 <= 今天 */
export function isUnlocked(scheduledDate: string, now: Date = new Date()): boolean {
  return scheduledDate <= todayKey(now);
}
