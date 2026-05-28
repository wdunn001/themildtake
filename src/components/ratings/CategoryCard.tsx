import { useState } from "preact/hooks";
import type { Category } from "../../lib/types";
import { categoryLabel, formatScore, SKEW_LABELS } from "../../lib/scores";
import ScorePill from "./ScorePill";
import ConfidenceBar from "./ConfidenceBar";

interface Props {
  categoryKey: string;
  category: Category;
}

function subFactorScoreText(sf: { score: number | null; score_near?: number | null; score_long?: number | null }): string {
  if (sf.score !== null && sf.score !== undefined) return formatScore(sf.score);
  const parts: string[] = [];
  if (sf.score_near !== null && sf.score_near !== undefined) parts.push(`near ${formatScore(sf.score_near)}`);
  if (sf.score_long !== null && sf.score_long !== undefined) parts.push(`long ${formatScore(sf.score_long)}`);
  return parts.join(" / ") || "—";
}

export default function CategoryCard({ categoryKey, category }: Props) {
  const [open, setOpen] = useState(false);
  const subKeys = Object.keys(category.sub_factors ?? {});

  return (
    <div class="cc">
      <button class="cc__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span class="cc__chev">{open ? "▾" : "▸"}</span>
        <span class="cc__name">{categoryLabel(categoryKey)}</span>
        <ScorePill score={category.score} size="sm" />
        <span class="cc__conf"><ConfidenceBar confidence={category.confidence} /></span>
        {category.skew && <span class="cc__skew">{SKEW_LABELS[category.skew]}</span>}
      </button>

      {category.notes && <p class="cc__notes">{category.notes}</p>}

      {open && subKeys.length > 0 && (
        <div class="table-scroll">
          <table class="cc__table">
            <thead>
              <tr><th>Sub-factor</th><th class="cc__num">Score</th><th class="cc__num">Weight</th><th class="cc__num">Conf</th></tr>
            </thead>
            <tbody>
              {subKeys.map((k) => {
                const sf = category.sub_factors[k];
                return (
                  <tr>
                    <td>
                      <span class="cc__sf-name">{categoryLabel(k)}</span>
                      {sf.notes && <span class="cc__sf-notes">{sf.notes}</span>}
                    </td>
                    <td class="cc__num cc__mono">{subFactorScoreText(sf)}</td>
                    <td class="cc__num cc__mono cc__muted">{sf.weight.toFixed(2)}</td>
                    <td class="cc__num cc__mono cc__muted">{Math.round(sf.confidence * 100)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .cc { border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 0.9rem 1rem; }
        .cc__head {
          display: flex; align-items: center; gap: 0.75rem; width: 100%;
          background: none; border: 0; cursor: pointer; padding: 0; text-align: left;
        }
        .cc__chev { color: var(--fg-faint); font-size: 0.8rem; width: 0.9rem; }
        .cc__name { color: var(--fg); font-weight: 600; flex: 1; font-size: 1rem; }
        .cc__conf { flex: 0 0 auto; }
        .cc__skew { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); white-space: nowrap; }
        .cc__notes { color: var(--fg-muted); font-size: 0.875rem; margin: 0.75rem 0 0; max-width: none; }
        .cc__table { width: 100%; border-collapse: collapse; margin-top: 0.9rem; font-size: 0.8125rem; }
        .cc__table th, .cc__table td { padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
        .cc__table thead th { color: var(--fg-faint); font-family: var(--font-mono); font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .cc__num { text-align: right; white-space: nowrap; }
        .cc__mono { font-family: var(--font-mono); }
        .cc__muted { color: var(--fg-faint); }
        .cc__sf-name { display: block; color: var(--fg); }
        .cc__sf-notes { display: block; color: var(--fg-muted); font-size: 0.75rem; margin-top: 0.2rem; max-width: 52ch; }
        @media (max-width: 620px) { .cc__head { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
}
