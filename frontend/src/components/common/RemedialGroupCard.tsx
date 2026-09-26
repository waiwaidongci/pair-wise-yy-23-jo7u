import type { GroupCard } from "../../hooks/useMistakeBook";
import { StatusBadge } from "./StatusBadge";
import { formatDateOnly } from "../../utils/formatters";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "待开始",
  IN_PROGRESS: "进行中",
  FINISHED: "已完成"
};

/**
 * 补练分组卡片：未到日期的分组照常展示（可见），
 * 但锁定不可打开，并显示可练日期。
 */
export function RemedialGroupCard({ card, onOpen }: { card: GroupCard; onOpen: (id: number) => void }) {
  const { group, locked } = card;
  return (
    <article className={locked ? "remedial-card locked" : "remedial-card"}>
      <header>
        <strong>{card.reasonText}</strong>
        <StatusBadge value={group.status} />
      </header>
      <p className="remedial-date">
        可练日期：{formatDateOnly(group.scheduled_date)}
        {locked && <em>（未到日期，暂不可练）</em>}
      </p>
      <p className="remedial-progress">
        {STATUS_LABEL[group.status] ?? group.status} · 剩余 {group.queue_symbol_ids.length} 字 / 共 {card.total} 字
      </p>
      <div className="remedial-queue">
        {card.queueSymbols.slice(0, 8).map((s) => (
          <span key={s.id} className="queue-chip">{s.letter}</span>
        ))}
        {group.queue_symbol_ids.length > 8 && <span className="queue-chip">…</span>}
      </div>
      <button
        type="button"
        disabled={locked || group.status === "FINISHED"}
        onClick={() => onOpen(group.id)}
      >
        {locked ? `等到 ${formatDateOnly(group.scheduled_date)} 可练` : group.status === "FINISHED" ? "本组已完成" : "开始补练"}
      </button>
    </article>
  );
}
