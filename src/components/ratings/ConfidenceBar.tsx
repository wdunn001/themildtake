import { formatConfidence, LOW_CONFIDENCE } from "../../lib/scores";

interface Props {
  confidence: number;
  showLabel?: boolean;
}

/** Horizontal confidence meter (0..1). Dims/flags when below the usable floor. */
export default function ConfidenceBar({ confidence, showLabel = true }: Props) {
  const low = confidence < LOW_CONFIDENCE;
  return (
    <span class="conf" title={`confidence ${formatConfidence(confidence)}`}>
      <span class="conf__track">
        <span class="conf__fill" style={{ width: `${Math.round(confidence * 100)}%` }} />
      </span>
      {showLabel && (
        <span class={`conf__label${low ? " conf__label--low" : ""}`}>
          {formatConfidence(confidence)}
        </span>
      )}
      <style>{`
        .conf { display: inline-flex; align-items: center; gap: 0.5rem; }
        .conf__track {
          position: relative;
          width: 56px;
          height: 6px;
          border-radius: 3px;
          background: var(--confidence-track);
          overflow: hidden;
        }
        .conf__fill { position: absolute; left: 0; top: 0; bottom: 0; background: var(--fg-muted); border-radius: 3px; }
        .conf__label { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-faint); }
        .conf__label--low { color: var(--mixed); }
      `}</style>
    </span>
  );
}
