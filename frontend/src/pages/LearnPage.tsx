import { useEffect, useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMasteryStore } from "../stores/MasteryStore";
import { SymbolCategoryText } from "../constants/SymbolCategory";
import type { SymbolCategory } from "../constants/SymbolCategory";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";

const DIFFICULTIES = ["全部", "初级", "中级", "高级"] as const;

/** 学习卡片：点阵字符 + 解释，按难度切换 */
export function LearnPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const masteredIds = useMasteryStore((s) => s.masteredIds);
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("全部");

  useEffect(() => {
    void useBrailleSymbolStore.getState().load();
    void useMasteryStore.getState().load();
  }, []);

  const filtered = useMemo(
    () => (difficulty === "全部" ? symbols : symbols.filter((s) => s.difficulty === difficulty)),
    [symbols, difficulty]
  );

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">learn</p>
          <h1>学习卡片</h1>
        </div>
        <div className="filter-bar">
          {DIFFICULTIES.map((d) => (
            <button key={d} type="button" className={difficulty === d ? "active" : ""} onClick={() => setDifficulty(d)}>
              {d}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState title="该难度下没有点字字符" />
      ) : (
        <section className="card-grid">
          {filtered.map((s) => (
            <article key={s.id} className="symbol-card">
              <BrailleCell pattern={s.cell_pattern} size={20} />
              <strong className="symbol-letter">{s.letter}</strong>
              <span>{s.pinyin}</span>
              <span className="hint">
                {SymbolCategoryText[s.category as SymbolCategory] ?? s.category} · {s.difficulty}
              </span>
              {masteredIds.has(s.id) && <StatusBadge value="MASTERED" />}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
