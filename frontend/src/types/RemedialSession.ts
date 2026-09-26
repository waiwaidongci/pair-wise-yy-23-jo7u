import type { MistakeReason } from "./MistakeReason";

/**
 * 补练分组 RemedialSession —— 错题本“整组安排补练”的产物。
 *
 * 一个错误原因同一时间只允许存在一个未结束的补练分组；重复布置时沿用原分组
 * （同一 id、同一 practice_session_id），只刷新 scheduled_date 并重建队列。
 *
 * - reason_key       本组选择的错误原因
 * - scheduled_date   老师安排的补练日期（YYYY-MM-DD），未到日期卡片可见但打不开
 * - queue_symbol_ids 补练队列：只含尚未掌握的点字；由 remedialQueue 工具按
 *                    “首次出错时间升序 + 同原因连续不超过两题”重排
 * - practice_session_id 打开补练时创建/复用的 PracticeSession 主键
 */
export type RemedialStatus = "SCHEDULED" | "IN_PROGRESS" | "FINISHED";

export interface RemedialSession {
  id: number;
  reason_key: MistakeReason;
  scheduled_date: string;
  created_at: string;
  updated_at: string;
  status: RemedialStatus;
  queue_symbol_ids: number[];
  finished_symbol_ids: number[];
  practice_session_id: number | null;
}
