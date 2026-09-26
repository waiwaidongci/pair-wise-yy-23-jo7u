export const PracticeMode = ["CELL_TO_TEXT","TEXT_TO_CELL","LISTENING","MIXED","REMEDIAL"] as const;
export type PracticeMode = (typeof PracticeMode)[number];
export const PracticeModeText: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "点阵认读",
  TEXT_TO_CELL: "看字摸点",
  LISTENING: "听写练习",
  MIXED: "混合练习",
  REMEDIAL: "错题补练"
};
