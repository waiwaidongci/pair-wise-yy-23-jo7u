/** 日志输出：模板集中在 constants/logTemplates.ts，这里只做格式化打印 */
import { LOG_TEMPLATES } from "../constants/logTemplates";

type Entity = keyof typeof LOG_TEMPLATES;

export function logAction(entity: Entity, templateIndex: number, detail: Record<string, unknown> = {}) {
  const template = LOG_TEMPLATES[entity][templateIndex] ?? entity;
  console.info(`[${template}]`, detail);
}
