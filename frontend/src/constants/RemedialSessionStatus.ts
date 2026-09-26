import type { RemedialSession } from "../types/RemedialSession";

export const RemedialSessionStatus = ["PENDING","OPEN","DONE"] as const;
export type RemedialSessionStatus = (typeof RemedialSessionStatus)[number];
export const RemedialSessionStatusText: Record<RemedialSessionStatus, string> = {
  PENDING: "未到日期",
  OPEN: "可练习",
  DONE: "已完成"
};

// 状态由会话数据推导：队列练完即完成，未到补练日期则锁定，其余可练。
export const resolveRemedialStatus = (
  session: Pick<RemedialSession, "queue" | "scheduled_date">,
  todayKey: string
): RemedialSessionStatus => {
  if (session.queue.length === 0) return "DONE";
  return todayKey < session.scheduled_date ? "PENDING" : "OPEN";
};
