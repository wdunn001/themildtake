import { useEffect, useMemo, useState } from "preact/hooks";
import { getAssessment, getComparisonIndex } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { pivotIndex } from "./pivot";
import {
  CATEGORY_ORDER,
  COMPARE_PALETTE,
  DECISION_ORDER,
  DECISION_LABELS,
  categoryLabel,
  formatScore,
  sentimentFor,
} from "../../lib/scores";
import type { Assessment, DecisionKey } from "../../lib/types";
import CategoryRadar from "./CategoryRadar";
import DecisionBars from "./DecisionBars";

export default function CompareView() {
  const index = useAsync(() => getComparisonIndex(), []);
  const [selected, setSelected] = useState<string[]>([]);

  const allCountries = useMemo(
    () => (index.data ? pivotIndex(index.data).map((r) => ({ country: r.country, iso3: r.iso3.toLowerCase() })) : []),
    [index.data],
  );

  // Default to the top two of the living ranking once the index loads.
  useEffect(() => {
    if (index.data && selected.length === 0) {
      const top = index.data.decisions.living?.ranking.slice(0, 2).map((r) => r.iso3.toLowerCase()) ?? [];
      if (top.length) setSelected(top);
    }
  }, [index.data]);

  const key = selected.slice().sort().join(",");
  const assessments = useAsync<Assessment[]>(
    () => (selected.length ? Promise.all(selected.map((iso) => getAssessment(iso))) : Promise.resolve([])),
    [key],
  );

  const colorOf = (iso: string) => COMPARE_PALETTE[Math.max(0, selected.indexOf(iso)) % COMPARE_PALETTE.length];

  const toggle = (iso: string) =>
    setSelected((prev) => (prev.includes(iso) ? prev.filter((x) => x !== iso) : [...prev, iso]));

  // Common categories (intersection, canonical order) so radar axes align.
  const sharedCategoryKeys = useMemo(() => {
    const list = assessments.data ?? [];
    if (!list.length) return [];
    const present = (a: Assessment) => new Set(Object.keys(a.categories));
    const sets = list.map(present);
    const common = [...sets[0]].filter((k) => sets.every((s) => s.has(k)));
    const ordered = CATEGORY_ORDER.filter((k) => common.includes(k));
    const extras = common.filter((k) => !CATEGORY_ORDER.includes(k as never));
    return [...ordered, ...extras];
  }, [assessments.data]);

  const sharedDecisions = useMemo(() => {
    const list = assessments.data ?? [];
    if (!list.length) return [] as DecisionKey[];
    return DECISION_ORDER.filter((dk) => list.every((a) => a.decisions[dk]));
  }, [assessments.data]);

  const list = assessments.data ?? [];

  const radarSeries = list.map((a) => ({
    name: a.country,
    values: sharedCategoryKeys.map((k) => a.categories[k]?.score ?? 0),
    color: colorOf(a.iso3.toLowerCase()),
  }));
  const barSeries = list.map((a) => ({
    name: a.country,
    scores: sharedDecisions.map((dk) => a.decisions[dk]?.score ?? 0),
    color: colorOf(a.iso3.toLowerCase()),
  }));

  return (
    <div class="cmp">
      <div class="cmp__picker">
        {index.loading && <span class="cmp__status">Loading…</span>}
        {allCountries.map((c) => {
          const active = selected.includes(c.iso3);
          return (
            <button
              class={`cmp__chip${active ? " cmp__chip--on" : ""}`}
              style={active ? { borderColor: colorOf(c.iso3), color: colorOf(c.iso3) } : undefined}
              onClick={() => toggle(c.iso3)}
              aria-pressed={active}
            >
              {c.country}
            </button>
          );
        })}
      </div>

      {selected.length < 2 ? (
        <p class="cmp__hint">Pick at least two countries to compare.</p>
      ) : assessments.loading ? (
        <p class="cmp__status">Loading assessments…</p>
      ) : assessments.error ? (
        <p class="cmp__status cmp__status--err">{assessments.error}</p>
      ) : (
        <>
          <div class="cmp__charts">
            <figure class="cmp__chart">
              <figcaption>Decision scores</figcaption>
              <DecisionBars labels={sharedDecisions.map((dk) => DECISION_LABELS[dk])} series={barSeries} height={300} />
            </figure>
            <figure class="cmp__chart">
              <figcaption>Category profiles</figcaption>
              <CategoryRadar indicatorNames={sharedCategoryKeys.map((k) => categoryLabel(k))} series={radarSeries} height={380} />
            </figure>
          </div>

          <div class="table-scroll">
            <table class="cmp__table">
              <thead>
                <tr>
                  <th>Decision</th>
                  {list.map((a) => <th class="cmp__num">{a.country}</th>)}
                </tr>
              </thead>
              <tbody>
                {sharedDecisions.map((dk) => (
                  <tr>
                    <th scope="row">{DECISION_LABELS[dk]}<span class="cmp__horizon"> {list[0].decisions[dk].horizon}</span></th>
                    {list.map((a) => {
                      const d = a.decisions[dk];
                      return (
                        <td class="cmp__num">
                          <span class={`cmp__score cmp__score--${sentimentFor(d.score)}`}>{formatScore(d.score)}</span>
                          <span class="cmp__conf">{Math.round(d.confidence * 100)}%</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .cmp__picker { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
        .cmp__chip {
          background: var(--bg-elev); border: 1px solid var(--border-strong); color: var(--fg-muted);
          font-family: var(--font-mono); font-size: 0.8125rem; padding: 0.35rem 0.75rem; border-radius: 999px; cursor: pointer;
        }
        .cmp__chip:hover { color: var(--fg); }
        .cmp__chip--on { background: var(--surface); font-weight: 600; }
        .cmp__hint, .cmp__status { font-family: var(--font-mono); color: var(--fg-faint); }
        .cmp__status--err { color: var(--neg); }
        .cmp__charts { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        @media (min-width: 820px) { .cmp__charts { grid-template-columns: 1fr 1fr; } }
        .cmp__chart { margin: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .cmp__chart figcaption { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin-bottom: 0.5rem; }
        .cmp__table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.875rem; }
        .cmp__table th, .cmp__table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border); text-align: left; }
        .cmp__table thead th { color: var(--fg-faint); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .cmp__num { text-align: right; }
        .cmp__horizon { color: var(--fg-faint); font-size: 0.6875rem; }
        .cmp__score { font-weight: 700; }
        .cmp__score--pos { color: var(--pos); } .cmp__score--neg { color: var(--neg); } .cmp__score--mixed { color: var(--mixed); }
        .cmp__conf { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
      `}</style>
    </div>
  );
}
