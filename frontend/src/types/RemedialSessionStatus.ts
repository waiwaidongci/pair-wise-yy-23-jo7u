export const RemedialSessionStatus = ["PENDING","OPEN","DONE"] as const;
export type RemedialSessionStatus = (typeof RemedialSessionStatus)[number];
export const RemedialSessionStatusText: Record<RemedialSessionStatus, string> = {
  PENDING: "未到日期",
  OPEN: "可练习",
  DONE: "已完成"
};
