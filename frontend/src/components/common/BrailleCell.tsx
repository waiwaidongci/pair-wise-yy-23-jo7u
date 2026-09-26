/**
 * 点阵单元格：按 cell_pattern（如 "1-2-4"）渲染六点盲文。
 * 左列自上而下为 1/2/3 点，右列为 4/5/6 点。
 */
export function BrailleCell({ pattern, size = 18 }: { pattern: string; size?: number }) {
  const active = new Set(
    pattern.split(/[-,\s]+/).map((p) => Number(p)).filter((n) => n >= 1 && n <= 6)
  );
  const dots = [1, 2, 3, 4, 5, 6];
  return (
    <span
      className="braille-cell"
      role="img"
      aria-label={`点字点位 ${pattern}`}
      style={{ gridTemplateRows: `repeat(3, ${size}px)`, width: size * 2 + 10 }}
    >
      {dots.map((dot) => (
        <i
          key={dot}
          className={active.has(dot) ? "dot on" : "dot"}
          style={{ width: size, height: size }}
        />
      ))}
    </span>
  );
}
