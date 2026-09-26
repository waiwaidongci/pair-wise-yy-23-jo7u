export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatDateOnly = (value: string) => {
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
};
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
