import type { RankingRow } from "../../lib/types";
import { formatScore, formatConfidence, colorFor, SKEW_LABELS } from "../../lib/scores";

interface Props {
  ranking: RankingRow[];
  horizon: string;
}

/** Ranked list for one decision with diverging score bars (-10..+10). */
export default function DecisionRanking({ ranking, horizon }: Props) {
  return (
    <ol class="dr">
      {ranking.map((row) => {
        const halfWidth = (Math.abs(row.score) / 10) * 50;
        return (
          <li class="dr__row">
            <span class="dr__pos">{row.rank}</span>
            <a class="dr__country" href={`/ratings/${row.iso3.toLowerCase()}/`}>{row.country}</a>
            <span class="dr__bar" aria-hidden="true">
              <span class="dr__axis" />
              <span
                class="dr__fill"
                style={{
                  width: `${halfWidth}%`,
                  background: colorFor(row.score),
                  left: row.score >= 0 ? "50%" : undefined,
                  right: row.score < 0 ? "50%" : undefined,
                }}
              />
            </span>
            <span class="dr__score" style={{ color: colorFor(row.score) }}>{formatScore(row.score)}</span>
            <span class="dr__meta">
              {formatConfidence(row.confidence)}
              {row.skew ? ` · ${SKEW_LABELS[row.skew]}` : ""}
            </span>
          </li>
        );
      })}
      <li class="dr__foot">horizon {horizon}</li>

      <style>{`
        .dr { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border); }
        .dr__row {
          display: grid;
          grid-template-columns: 1.5rem minmax(6rem, 11rem) 1fr auto auto;
          align-items: center;
          gap: 0.5rem 1rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 0.9375rem;
        }
        .dr__pos { color: var(--fg-faint); font-size: 0.8125rem; text-align: right; }
        .dr__country { color: var(--fg); font-weight: 600; }
        .dr__country:hover { color: var(--data); }
        .dr__bar { position: relative; height: 8px; min-width: 80px; border-radius: 4px; background: var(--confidence-track); overflow: hidden; }
        .dr__axis { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 1px; background: var(--border-strong); }
        .dr__fill { position: absolute; top: 0; bottom: 0; border-radius: 4px; }
        .dr__score { text-align: right; font-weight: 700; min-width: 3.5rem; }
        .dr__meta { font-size: 0.6875rem; color: var(--fg-faint); text-align: right; white-space: nowrap; }
        .dr__foot { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); padding-top: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; }
        @media (max-width: 620px) {
          .dr__row { grid-template-columns: 1.25rem 1fr auto; }
          .dr__bar, .dr__meta { display: none; }
        }
      `}</style>
    </ol>
  );
}
