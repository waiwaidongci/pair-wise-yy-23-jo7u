export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatDateOnly = (value: string) => new Date(value.length === 10 ? `${value}T00:00:00` : value).toLocaleDateString("zh-CN");
export const formatDateKey = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
export const isThisWeek = (value: string, now: Date = new Date()) => {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  const time = new Date(value).getTime();
  return time >= start.getTime() && time < end.getTime();
};
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
