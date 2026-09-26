/**
 * 错题原因枚举类型（常量实现见 constants/MistakeReason.ts）
 * DOT_CONFUSION     点位混淆（相邻点号认错）
 * DIRECTION_FLIP    方向颠倒（左右镜像 / 上下翻转）
 * PREFIX_FORGOT     省写/词号遗漏（数字号、字母号等前缀漏点）
 * RHYTHM_MISS       漏点/多点（节奏不稳漏点或多点）
 * HOMOPHONE_CONFUSE 音近混淆（听写时拼音相近选错）
 */
export type MistakeReason =
  | "DOT_CONFUSION"
  | "DIRECTION_FLIP"
  | "PREFIX_FORGOT"
  | "RHYTHM_MISS"
  | "HOMOPHONE_CONFUSE";
