import { formatScore, sentimentFor } from "../../lib/scores";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
}

/** Score chip colored by sentiment (pos/neg/mixed). */
export default function ScorePill({ score, size = "md" }: Props) {
  const sentiment = sentimentFor(score);
  return (
    <span class={`pill pill--${sentiment} pill--${size}`}>
      {formatScore(score)}
      <style>{`
        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 700;
          border-radius: 6px;
          border: 1px solid transparent;
          line-height: 1;
        }
        .pill--sm { font-size: 0.75rem; padding: 0.2rem 0.4rem; }
        .pill--md { font-size: 0.9375rem; padding: 0.3rem 0.55rem; }
        .pill--lg { font-size: 1.5rem; padding: 0.45rem 0.7rem; }
        .pill--pos { color: var(--pos); background: var(--pos-soft); border-color: color-mix(in srgb, var(--pos) 40%, transparent); }
        .pill--neg { color: var(--neg); background: var(--neg-soft); border-color: color-mix(in srgb, var(--neg) 40%, transparent); }
        .pill--mixed { color: var(--mixed); background: var(--mixed-soft); border-color: color-mix(in srgb, var(--mixed) 40%, transparent); }
      `}</style>
    </span>
  );
}
