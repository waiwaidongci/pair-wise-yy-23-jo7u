/**
 * 练习会话 PracticeSession
 * - mode 取值见 constants/PracticeMode.ts，补练会话使用 REMEDIAL
 * - 补练会话通过 lesson_id = 0 与普通课程练习区分，
 *   remedial_group_id 反向关联错题本中的补练分组（RemedialSession）
 */
export interface PracticeSession {
  id: number;
  lesson_id: number;
  mode: string;
  started_at: string;
  finished_at: string;
  score: number;
  mistake_count: number;
  remedial_group_id?: number | null;
  remedial_reason?: string | null;
}
