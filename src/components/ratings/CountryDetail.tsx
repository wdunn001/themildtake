import { useMemo } from "preact/hooks";
import { getAssessment } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import {
  CATEGORY_ORDER,
  DECISION_ORDER,
  DECISION_LABELS,
  categoryLabel,
  readingFor,
  sentimentFor,
} from "../../lib/scores";
import type { DecisionKey } from "../../lib/types";
import ScorePill from "./ScorePill";
import ConfidenceBar from "./ConfidenceBar";
import CategoryCard from "./CategoryCard";
import CategoryRadar from "./CategoryRadar";
import DecisionBars from "./DecisionBars";

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

  return (
    <div class="cd">
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
