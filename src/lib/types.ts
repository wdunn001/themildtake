// TypeScript mirror of schema.json (themildtake Country Risk Assessment).
// Scores range -10..+10; confidence 0..1; sub-factor weights within a
// category sum to 1.0.

export type Skew = "positive" | "negative" | "symmetric" | "unknown";

export type DecisionKey = "living" | "assets" | "currency";

export interface SubFactor {
  /** Single-horizon score; null when split into near/long. */
  score: number | null;
  /** Near-term (1-3y) score for time-sensitive factors. */
  score_near?: number | null;
  /** Long-term (5-10y) score for time-sensitive factors. */
  score_long?: number | null;
  weight: number;
  confidence: number;
  notes?: string;
}

export interface Category {
  score: number;
  confidence: number;
  skew?: Skew;
  notes?: string;
  sub_factors: Record<string, SubFactor>;
}

export interface Decision {
  score: number;
  confidence: number;
  horizon: string;
  /** Threshold interpretation: clear positive / mixed / clear negative. */
  reading: string;
}

export interface SubjectProfile {
  summary?: string;
  profession?: string;
  citizenship?: string;
  stated_values?: string[];
}

export interface Assessment {
  country: string;
  iso3: string;
  methodology_version: string;
  assessed_on: string;
  subject_profile: SubjectProfile;
  flags?: string[];
  category_weights_by_decision?: Record<string, Record<string, number>>;
  categories: Record<string, Category>;
  decisions: Record<string, Decision>;
  summary?: string;
}

export interface RankingRow {
  rank: number;
  country: string;
  iso3: string;
  score: number;
  confidence: number;
  skew?: Skew;
}

export interface ComparisonScale {
  min: number;
  max: number;
  thresholds: Record<string, string>;
}

export interface ComparisonIndex {
  title: string;
  project: string;
  methodology_version: string;
  assessed_on: string;
  subject_profile: SubjectProfile;
  scale: ComparisonScale;
  decisions: Record<string, { horizon: string; ranking: RankingRow[] }>;
  headline_findings: string[];
  outstanding_work: string[];
}
