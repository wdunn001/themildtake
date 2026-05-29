import { useMemo } from "preact/hooks";
import { getAssessment } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import {
  CATEGORY_ORDER,
  DECISION_ORDER,
  DECISION_LABELS,
  categoryLabel,
  formatScore,
  readingFor,
  sentimentFor,
  TRANSPARENCY_LABELS,
  transparencyNote,
  transparencySentiment,
} from "../../lib/scores";
import type { DecisionKey } from "../../lib/types";
import ScorePill from "./ScorePill";
import ConfidenceBar from "./ConfidenceBar";
import CategoryCard from "./CategoryCard";
import CategoryRadar from "./CategoryRadar";
import DecisionBars from "./DecisionBars";
import HorizonTrajectory from "./HorizonTrajectory";

// Ordered near -> long: each decision reads its native horizon.
const HORIZON_ROWS: [DecisionKey, string, string, string][] = [
  ["currency", "Currency", "~1–3y", "near-term"],
  ["assets", "Assets", "~3–7y", "interpolated"],
  ["living", "Living", "~5–10y", "long-term"],
];

interface Props {
  iso3: string;
}

export default function CountryDetail({ iso3 }: Props) {
  const { data, error, loading } = useAsync(() => getAssessment(iso3), [iso3]);

  const categoryKeys = useMemo(() => {
    if (!data) return [];
    const present = Object.keys(data.categories);
    const ordered = CATEGORY_ORDER.filter((k) => present.includes(k));
    const extras = present.filter((k) => !CATEGORY_ORDER.includes(k as never));
    return [...ordered, ...extras];
  }, [data]);

  if (loading) return <p class="cd__status">Loading assessment…</p>;
  if (error || !data) return <p class="cd__status cd__status--err">Couldn’t load this assessment. {error}</p>;

  const decisionKeys = DECISION_ORDER.filter((dk) => data.decisions[dk]);
  const radarSeries = [
    {
      name: data.country,
      values: categoryKeys.map((k) => data.categories[k].score),
      color: "#3B82F6",
    },
  ];
  const decisionScores = decisionKeys.map((dk) => data.decisions[dk].score);

  // One line tracing the country's risk from near (currency) to long (living).
  const hasAllDecisions = HORIZON_ROWS.every(([dk]) => data.decisions[dk]);
  const trajLines = hasAllDecisions
    ? [
        {
          name: data.country,
          points: HORIZON_ROWS.map(([dk]) => data.decisions[dk].score) as [number, number, number],
          color: "#3B82F6",
        },
      ]
    : [];

  return (
    <div class="cd">
      {data.transparency_tier && (
        <div class={`cd__tier cd__tier--${transparencySentiment(data.transparency_tier)}`}>
          <span class="cd__tier-badge">
            Transparency: {TRANSPARENCY_LABELS[data.transparency_tier] ?? data.transparency_tier}
            {data.transparency_trend === "declining" ? " — declining" : ""}
          </span>
          <span class="cd__tier-note">
            {transparencyNote(data.transparency_tier, data.transparency_trend)}
          </span>
        </div>
      )}

      <div class="cd__decisions">
        {decisionKeys.map((dk: DecisionKey) => {
          const d = data.decisions[dk];
          const reading = d.reading || readingFor(d.score, d.confidence);
          return (
            <div class={`cd__dcard cd__dcard--${sentimentFor(d.score)}`}>
              <div class="cd__dhead">
                <span class="cd__dlabel">{DECISION_LABELS[dk]}</span>
                <span class="cd__dhorizon">{d.horizon}</span>
              </div>
              <ScorePill score={d.score} size="lg" />
              <div class="cd__dmeta">
                <ConfidenceBar confidence={d.confidence} />
                <span class="cd__dreading">{reading}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div class="cd__charts">
        <figure class="cd__chart">
          <figcaption>Decision scores</figcaption>
          <DecisionBars
            labels={decisionKeys.map((dk) => DECISION_LABELS[dk])}
            series={[{ name: data.country, scores: decisionScores }]}
            colorBySentiment
            height={260}
          />
        </figure>
        <figure class="cd__chart">
          <figcaption>Category profile</figcaption>
          <CategoryRadar
            indicatorNames={categoryKeys.map((k) => categoryLabel(k))}
            series={radarSeries}
            height={340}
          />
        </figure>
      </div>

      {trajLines.length > 0 && (
        <section class="cd__traj">
          <h2 class="cd__h">Trajectory over the horizon</h2>
          <p class="cd__hint">
            The risk read from the near term (currency, 1–3y) to the long term (living, 5–10y).
            Each point is the decision that natively reads that horizon, so the slope shows where
            the country is headed.
          </p>
          <div class="cd__trajgrid">
            <figure class="cd__chart">
              <HorizonTrajectory lines={trajLines} height={300} />
            </figure>
            <table class="cd__htable">
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Horizon</th>
                  <th class="cd__hnum">Score used</th>
                </tr>
              </thead>
              <tbody>
                {HORIZON_ROWS.filter(([dk]) => data.decisions[dk]).map(([dk, label, hz, used]) => (
                  <tr>
                    <th scope="row">
                      {label}
                      <span class="cd__hsub"> {used}</span>
                    </th>
                    <td class="cd__hhz">{hz}</td>
                    <td class="cd__hnum">
                      <span class={`cd__hscore cd__hscore--${sentimentFor(data.decisions[dk].score)}`}>
                        {formatScore(data.decisions[dk].score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <h2 class="cd__h">Category breakdown</h2>
      <p class="cd__hint">Click a category to expand its sub-factors.</p>
      <div class="cd__cats">
        {categoryKeys.map((k) => (
          <CategoryCard categoryKey={k} category={data.categories[k]} />
        ))}
      </div>

      {data.flags && data.flags.length > 0 && (
        <section class="cd__flags">
          <h2 class="cd__h">Caveats &amp; flags</h2>
          <ul>
            {data.flags.map((f) => <li>{f}</li>)}
          </ul>
        </section>
      )}

      {data.summary && (
        <section class="cd__summary">
          <h2 class="cd__h">Summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      <style>{`
        .cd__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .cd__status--err { color: var(--neg); }

        .cd__tier { display: flex; flex-direction: column; gap: 0.35rem; border: 1px solid var(--border); border-left-width: 3px; border-radius: 8px; background: var(--bg-elev); padding: 0.7rem 1rem; margin-bottom: 1.5rem; }
        .cd__tier--pos { border-left-color: var(--pos); }
        .cd__tier--neg { border-left-color: var(--neg); }
        .cd__tier--mixed { border-left-color: var(--mixed); }
        .cd__tier-badge { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: var(--fg); text-transform: uppercase; letter-spacing: 0.05em; }
        .cd__tier-note { font-size: 0.8125rem; color: var(--fg-muted); max-width: 82ch; }

        .cd__decisions { display: grid; gap: 1rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        @media (min-width: 640px) { .cd__decisions { grid-template-columns: repeat(3, 1fr); } }
        .cd__dcard { border: 1px solid var(--border); border-left-width: 3px; border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .cd__dcard--pos { border-left-color: var(--pos); }
        .cd__dcard--neg { border-left-color: var(--neg); }
        .cd__dcard--mixed { border-left-color: var(--mixed); }
        .cd__dhead { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem; }
        .cd__dlabel { font-family: var(--font-mono); font-weight: 600; color: var(--fg); }
        .cd__dhorizon { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); }
        .cd__dmeta { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.75rem; }
        .cd__dreading { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); text-transform: uppercase; letter-spacing: 0.04em; }

        .cd__charts { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 2.5rem; }
        @media (min-width: 760px) { .cd__charts { grid-template-columns: 1fr 1fr; } }
        .cd__chart { margin: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .cd__chart figcaption { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin-bottom: 0.5rem; }

        .cd__traj { margin: 0 0 2.5rem; }
        .cd__trajgrid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; align-items: start; }
        @media (min-width: 760px) { .cd__trajgrid { grid-template-columns: 1.5fr 1fr; } }
        .cd__htable { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.8125rem; }
        .cd__htable th, .cd__htable td { padding: 0.55rem 0.6rem; border-bottom: 1px solid var(--border); text-align: left; }
        .cd__htable thead th { color: var(--fg-faint); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .cd__hsub { color: var(--fg-faint); font-size: 0.6875rem; }
        .cd__hhz { color: var(--fg-muted); }
        .cd__hnum { text-align: right; }
        .cd__hscore { font-weight: 700; }
        .cd__hscore--pos { color: var(--pos); } .cd__hscore--neg { color: var(--neg); } .cd__hscore--mixed { color: var(--mixed); }

        .cd__h { font-size: 1.05rem; font-family: var(--font-mono); color: var(--fg); margin: 0 0 0.5rem; }
        .cd__hint { font-size: 0.8125rem; color: var(--fg-faint); margin: 0 0 1rem; }
        .cd__cats { display: grid; gap: 0.75rem; }
        .cd__flags { margin-top: 2.5rem; }
        .cd__flags ul { color: var(--fg-muted); padding-left: 1.1rem; }
        .cd__flags li { margin: 0.4rem 0; }
        .cd__summary { margin-top: 2.5rem; }
        .cd__summary p { color: var(--fg-muted); max-width: 72ch; }
      `}</style>
    </div>
  );
}
