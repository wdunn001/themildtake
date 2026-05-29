import type { DecisionKey, Skew, SubFactor } from "./types";

export const SCORE_MIN = -10;
export const SCORE_MAX = 10;

/** Confidence below this makes any reading provisional. */
export const LOW_CONFIDENCE = 0.4;

export type Reading = "clear positive" | "mixed" | "clear negative" | "insufficient confidence";

/** Threshold interpretation matching _comparison-index.json `scale.thresholds`. */
export function readingFor(score: number, confidence: number): Reading {
  if (confidence < LOW_CONFIDENCE) return "insufficient confidence";
  if (score >= 3) return "clear positive";
  if (score <= -3) return "clear negative";
  return "mixed";
}

export type Sentiment = "pos" | "neg" | "mixed";

export function sentimentFor(score: number): Sentiment {
  if (score >= 3) return "pos";
  if (score <= -3) return "neg";
  return "mixed";
}

/** CSS custom-property color for a score's sentiment. */
export function colorFor(score: number): string {
  return `var(--${sentimentFor(score)})`;
}

export function softColorFor(score: number): string {
  return `var(--${sentimentFor(score)}-soft)`;
}

/** "+3.25" / "-4.39" / "0.0" with a sign and one decimal. */
export function formatScore(score: number): string {
  const fixed = score.toFixed(score % 1 === 0 ? 1 : 2);
  return score > 0 ? `+${fixed}` : fixed;
}

export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Position of a score on the -10..+10 track as a 0..100 percentage,
 * for bar/marker placement.
 */
export function scorePercent(score: number): number {
  const clamped = Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
  return ((clamped - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100;
}

/** Resolve a sub-factor's representative score (single or near-term split). */
export function subFactorScore(sf: SubFactor): number | null {
  if (sf.score !== null && sf.score !== undefined) return sf.score;
  if (sf.score_near !== null && sf.score_near !== undefined) return sf.score_near;
  if (sf.score_long !== null && sf.score_long !== undefined) return sf.score_long;
  return null;
}

export const DECISION_LABELS: Record<DecisionKey, string> = {
  living: "Living",
  assets: "Assets",
  currency: "Currency",
};

export const DECISION_ORDER: DecisionKey[] = ["living", "assets", "currency"];

/** Human label for a category key (e.g. "political_social" -> "Political & Social"). */
export function categoryLabel(key: string): string {
  const overrides: Record<string, string> = {
    economic: "Economic",
    institutional: "Institutional",
    political_social: "Political & Social",
    geopolitical: "Geopolitical",
    physical_practical: "Physical & Practical",
    personal_fit: "Personal Fit",
  };
  if (overrides[key]) return overrides[key];
  return key
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Canonical category ordering for radar axes / category cards. */
export const CATEGORY_ORDER = [
  "economic",
  "institutional",
  "political_social",
  "geopolitical",
  "physical_practical",
  "personal_fit",
] as const;

/** Distinct, accessible palette for comparing multiple countries. */
export const COMPARE_PALETTE = [
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#10B981", // green
  "#EC4899", // pink
  "#22D3EE", // cyan
];

export const SKEW_LABELS: Record<Skew, string> = {
  positive: "positive skew",
  negative: "negative skew",
  symmetric: "symmetric",
  unknown: "skew unknown",
};

export const TRANSPARENCY_LABELS: Record<string, string> = {
  observable: "Observable",
  mixed: "Mixed transparency",
  opaque: "Opaque",
  unknown: "Transparency unknown",
};

/** Sentiment class for a transparency tier (drives badge color). */
export function transparencySentiment(tier?: string): Sentiment {
  if (tier === "observable") return "pos";
  if (tier === "opaque") return "neg";
  return "mixed";
}

/** Plain-language note on what a tier means for trusting a country's scores. */
export function transparencyNote(tier?: string, trend?: string): string {
  switch (tier) {
    case "observable":
      return "Free press and open civil society - scores rest on directly observable evidence.";
    case "mixed":
      return trend === "declining"
        ? "Official data is compromised, but a free press and courts still surface the truth. Scores lean on those independent channels, and the state is sliding toward opacity - the confidence here is capped and falling."
        : "Partial observability: official data is unreliable, but independent reporting still gets the truth out. Confidence is capped accordingly.";
    case "opaque":
      return "The state controls the information environment, so scores rest on external proxies and carry a capped, lower confidence. The read may be flattered by what cannot be seen.";
    default:
      return "Insufficient signal to classify observability.";
  }
}
