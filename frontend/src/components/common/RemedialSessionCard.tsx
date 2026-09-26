import { RemedialSessionStatusText, resolveRemedialStatus } from "../../constants/RemedialSessionStatus";
import type { RemedialSession } from "../../types/RemedialSession";
import { formatDateOnly } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

type Props = {
  session: RemedialSession;
  todayKey: string;
  onOpen: (session: RemedialSession) => void;
  onLocked: (session: RemedialSession) => void;
};

export function RemedialSessionCard({ session, todayKey, onOpen, onLocked }: Props) {
  const status = resolveRemedialStatus(session, todayKey);
  const total = session.queue.length + session.finished_symbol_ids.length;
  return <article className={"remedial-card" + (status === "PENDING" ? " locked" : "")}>
    <header>
      <strong>{session.reasons.join("、")}</strong>
      <StatusBadge value={RemedialSessionStatusText[status]} />
    </header>
    <p>补练日期：{formatDateOnly(session.scheduled_date)}</p>
    <p>剩余 {session.queue.length} / 共 {total} 字</p>
    {status === "PENDING" && <>
      <p className="locked-tip">可练日期：{formatDateOnly(session.scheduled_date)}</p>
      <button className="ghost" onClick={() => onLocked(session)}>未开放</button>
    </>}
    {status === "OPEN" && <button className="primary" onClick={() => onOpen(session)}>开始补练</button>}
    {status === "DONE" && <p className="done-tip">本组补练已完成</p>}
  </article>;
}
