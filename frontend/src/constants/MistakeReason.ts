import type { MistakeReason as MistakeReasonType } from "../types/MistakeReason";

/** 错题原因枚举：错题本按它归类，补练分组按它筛选与排序 */
export const MistakeReason = [
  "DOT_CONFUSION",
  "DIRECTION_FLIP",
  "PREFIX_FORGOT",
  "RHYTHM_MISS",
  "HOMOPHONE_CONFUSE"
] as const satisfies readonly MistakeReasonType[];

export const MistakeReasonText: Record<MistakeReasonType, string> = {
  DOT_CONFUSION: "点位混淆",
  DIRECTION_FLIP: "方向颠倒",
  PREFIX_FORGOT: "省写遗漏",
  RHYTHM_MISS: "漏点多点",
  HOMOPHONE_CONFUSE: "音近混淆"
};
