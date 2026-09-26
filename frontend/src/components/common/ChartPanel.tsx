export interface ChartDatum {
  label: string;
  value: number;
  hint?: string;
}

/** 轻量 CSS 柱状图：学习进度页的趋势与分布共用 */
export function ChartPanel({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="chart-panel">
      {data.map((d) => (
        <div key={d.label} className="chart-row">
          <span className="chart-label">{d.label}</span>
          <span className="chart-bar">
            <i style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="chart-hint">{d.hint ?? d.value}</span>
        </div>
      ))}
    </div>
  );
}
