import { useMemo, useState } from "preact/hooks";
import { getComparisonIndex } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { pivotIndex } from "./pivot";
import CountryGrid from "./CountryGrid";
import DecisionRanking from "./DecisionRanking";
import { DECISION_ORDER, DECISION_LABELS } from "../../lib/scores";
import type { DecisionKey } from "../../lib/types";

export default function RatingsOverview() {
  const { data, error, loading } = useAsync(() => getComparisonIndex(), []);
  const [decision, setDecision] = useState<DecisionKey>("living");

  const rows = useMemo(() => (data ? pivotIndex(data) : []), [data]);

  if (loading) return <p class="ro__status">Loading ratings…</p>;
  if (error || !data) return <p class="ro__status ro__status--err">Couldn’t load ratings data. {error}</p>;

  const current = data.decisions[decision];

  return (
    <div class="ro">
      <div class="ro__tabs" role="tablist" aria-label="Decision">
        {DECISION_ORDER.map((dk) => (
          <button
            role="tab"
            aria-selected={decision === dk}
            class={`ro__tab${decision === dk ? " ro__tab--active" : ""}`}
            onClick={() => setDecision(dk)}
          >
            {DECISION_LABELS[dk]}
          </button>
        ))}
      </div>

      <div class="ro__cols">
        <section class="ro__rank">
          <h2 class="ro__h">{DECISION_LABELS[decision]} ranking</h2>
          {current ? (
            <DecisionRanking ranking={current.ranking} horizon={current.horizon} />
          ) : (
            <p class="ro__status">No data for this decision.</p>
          )}
        </section>

        <section class="ro__grid">
          <h2 class="ro__h">All countries</h2>
          <CountryGrid rows={rows} />
        </section>
      </div>

      <style>{`
        .ro__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .ro__status--err { color: var(--neg); }
        .ro__tabs { display: inline-flex; gap: 0.25rem; padding: 0.25rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1.75rem; }
        .ro__tab {
          background: none; border: 0; cursor: pointer; color: var(--fg-muted);
          font-family: var(--font-mono); font-size: 0.875rem; padding: 0.4rem 0.9rem; border-radius: 6px;
        }
        .ro__tab--active { background: var(--surface); color: var(--fg); }
        .ro__tab:hover { color: var(--fg); }
        .ro__h { font-size: 1rem; font-family: var(--font-mono); color: var(--fg-faint); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 1rem; }
        .ro__cols { display: grid; gap: 2.5rem; grid-template-columns: 1fr; }
        @media (min-width: 960px) { .ro__cols { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 3rem; } }
      `}</style>
    </div>
  );
}
