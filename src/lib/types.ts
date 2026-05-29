// TypeScript mirror of schema.json (themildtake Country Risk Assessment).
// Scores range -10..+10; confidence 0..1; sub-factor weights within a
// category sum to 1.0.

export type Skew = "positive" | "negative" | "symmetric" | "unknown";

/** Observability tier - how much the truth about a country can be seen. */
export type TransparencyTier = "observable" | "mixed" | "opaque" | "unknown";
export type TransparencyTrend = "declining" | "stable";

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
  /** Same weighting projected across horizons (near 1-3y, mid 3-7y, long 5-10y). */
  trajectory?: { near: number; mid: number; long: number };
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
  transparency_tier?: TransparencyTier;
  transparency_trend?: TransparencyTrend;
}

export interface RankingRow {
  rank: number;
  country: string;
  iso3: string;
  score: number;
  confidence: number;
  skew?: Skew;
  transparency_tier?: TransparencyTier;
  transparency_trend?: TransparencyTrend;
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

// ---- Personal Fit / Relocate (reader-specific, client-side only) ----

export type ProfessionCluster =
  | "tech" | "medical" | "engineering" | "finance" | "legal" | "trades" | "academic" | "any";
export type CapitalBand = "none" | "under50k" | "50k-250k" | "250k-1m" | "over1m";
export type Goal = "live" | "invest" | "currency";

/** A reader's profile. Stored only in the browser (localStorage); never sent anywhere. */
export interface Profile {
  originIso3: string;
  citizenships?: string[];
  languages: string[];
  profession: ProfessionCluster;
  capitalBand: CapitalBand;
  goals: Goal[];
  /** Optional refine fields (progressive). */
  ancestryIso3?: string[];
  hasFamilyTies?: boolean;
  age?: number;
  riskTolerance?: "low" | "medium" | "high";
  /** Optional per-decision weight overrides for the personal_fit category (0..1). */
  priorities?: Partial<Record<DecisionKey, number>>;
}

export interface ImmigrationProgram {
  name: string;
  type: "skilled" | "investor" | "income" | "digital-nomad" | "ancestry" | "student" | "family";
  eligibility: { minCapitalUsd: number; professions: string[]; languageReq: "none" | "basic" | "official" };
  difficulty: "easy" | "moderate" | "hard";
  timeToPrYears: number;
  timeToCitizenshipYears: number;
  officialUrl: string;
}

export interface Pathway {
  iso3: string;
  country: string;
  languages: string[];
  demandProfessions: string[];
  immigration: ImmigrationProgram[];
  assets: { foreignPropertyOwnership: string; foreignSecurities: string; nonResidentBrokerage: string; note: string; officialUrl: string };
  currency: { capitalAccountOpen: boolean; nonResidentBanking: string; fxControls: string; centralBankUrl: string };
  credentials: { note: string; url: string };
  links: { immigration: string; investment: string; centralBank: string };
}
