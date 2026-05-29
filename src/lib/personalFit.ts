// Client-side personalization: build a reader-specific `personal_fit` category
// from a Profile x destination Pathway, then recompute the living/assets/currency
// decisions with it folded in - using the SAME shared scoreEngine the build uses,
// so personalized numbers stay on the same scale as the base. The base
// Assessment is never mutated. All of this runs in the browser; the profile
// never leaves the device.

import {
  categoryComposite,
  decisionComposite,
  transparencyTier,
  readingFor,
  round,
  HORIZON_BY_DECISION,
} from "./scoreEngine.mjs";
import { PATHWAYS } from "../data/pathways.mjs";
import { sharesFreeMovement, sharesResidencyPath } from "../data/mobility.mjs";
import type {
  Assessment,
  Category,
  Decision,
  DecisionKey,
  ImmigrationProgram,
  Pathway,
  Profile,
  SubFactor,
} from "./types";

const DECISIONS: DecisionKey[] = ["living", "assets", "currency"];

// Personal-fit weight folded into each decision by default (heavy on living,
// where personal circumstances matter most; light on the money decisions, where
// it is mostly about legal access). Scales the base 5 categories by (1 - w).
const W_PF_DEFAULT: Record<DecisionKey, number> = { living: 0.2, assets: 0.1, currency: 0.05 };

// Approximate available capital (USD) by band, used for program eligibility.
const CAPITAL_USD: Record<string, number> = {
  none: 0,
  under50k: 50000,
  "50k-250k": 250000,
  "250k-1m": 1000000,
  over1m: 10000000,
};

const DEFAULT_SUB_WEIGHTS: Record<string, number> = {
  language_match: 0.2,
  immigration_pathway: 0.3,
  credential_recognition: 0.15,
  profession_demand: 0.15,
  cost_of_entry: 0.1,
  belonging: 0.1,
};

const clamp = (n: number) => Math.max(-10, Math.min(10, n));
const diffScore = (d: string) => (d === "easy" ? 7 : d === "moderate" ? 4 : 1);
const REGULATED = ["medical", "legal", "engineering"];

export function getPathway(iso3: string): Pathway | null {
  return PATHWAYS[iso3?.toUpperCase()] ?? null;
}

/** Programs the profile plausibly qualifies for (profession + capital). */
export function qualifyingPrograms(pathway: Pathway, profile: Profile): ImmigrationProgram[] {
  const cap = CAPITAL_USD[profile.capitalBand] ?? 0;
  return pathway.immigration.filter(
    (p) =>
      (p.eligibility.professions.includes(profile.profession) || p.eligibility.professions.includes("any")) &&
      cap >= p.eligibility.minCapitalUsd,
  );
}

/** Build the synthetic personal_fit category for one destination, or null when
 *  we have no pathway data for it (caller then falls back to the base scores). */
export function buildPersonalFitCategory(
  profile: Profile,
  pathway: Pathway | null,
  subWeights: Record<string, number> = DEFAULT_SUB_WEIGHTS,
): Category | null {
  if (!pathway) return null;

  const origin = profile.originIso3;
  const dest = pathway.iso3;
  const freeMove = sharesFreeMovement(origin, dest);
  const resPath = sharesResidencyPath(origin, dest);
  const hasAncestry = !!profile.ancestryIso3?.includes(dest);

  // language_match
  const langs = profile.languages.map((l) => l.toLowerCase());
  const destLangs = pathway.languages.map((l) => l.toLowerCase());
  const overlap = destLangs.some((l) => langs.includes(l));
  let language = overlap ? 8 : destLangs.includes("english") ? 1 : -4;

  // immigration_pathway
  let immig: number;
  if (freeMove) {
    immig = 9;
  } else {
    const qual = qualifyingPrograms(pathway, profile);
    if (qual.length) {
      immig = qual.reduce((best, p) => Math.max(best, diffScore(p.difficulty)), 1);
      if (resPath) immig += 2;
    } else {
      immig = -5;
    }
  }
  if (hasAncestry) immig = Math.max(immig, 7);

  // profession_demand
  const inDemand = pathway.demandProfessions.includes(profile.profession);
  const demand = inDemand ? 6 : profile.profession === "any" ? 0 : -1;

  // credential_recognition
  let credential = inDemand ? 5 : 1;
  if (REGULATED.includes(profile.profession)) credential -= 2;
  if (freeMove) credential += 2;

  // cost_of_entry
  const cap = CAPITAL_USD[profile.capitalBand] ?? 0;
  const cheapest = pathway.immigration.reduce((m, p) => Math.min(m, p.eligibility.minCapitalUsd), Infinity);
  let cost = freeMove ? 8 : cheapest === 0 ? 6 : cap >= cheapest ? 3 : -4;

  // belonging
  const minCit = Math.min(...pathway.immigration.map((p) => p.timeToCitizenshipYears || 99));
  let belonging = freeMove ? 6 : minCit <= 5 ? 5 : minCit <= 8 ? 2 : minCit >= 25 ? -3 : 0;
  if (!overlap && !destLangs.includes("english")) belonging -= 2;
  if (profile.hasFamilyTies) belonging += 2;
  if (hasAncestry) belonging += 3;

  const raw: Record<string, number> = {
    language_match: language,
    immigration_pathway: immig,
    credential_recognition: credential,
    profession_demand: demand,
    cost_of_entry: cost,
    belonging,
  };
  const conf: Record<string, number> = {
    language_match: 0.9,
    immigration_pathway: 0.75,
    credential_recognition: 0.7,
    profession_demand: 0.7,
    cost_of_entry: 0.8,
    belonging: 0.65,
  };

  const wsum = Object.values(subWeights).reduce((a, b) => a + b, 0) || 1;
  const sub_factors: Record<string, SubFactor> = {};
  for (const k of Object.keys(raw)) {
    sub_factors[k] = { score: clamp(raw[k]), score_near: null, score_long: null, weight: (subWeights[k] ?? 0) / wsum, confidence: conf[k] };
  }

  const comp = categoryComposite({ score: 0, confidence: 0, sub_factors }, "near");
  return {
    score: round(comp.score, 1),
    confidence: round(comp.confidence, 2),
    skew: "symmetric",
    notes: "Reader-specific personal-fit estimate (client-side, not advice).",
    sub_factors,
  };
}

/** Recompute the three decisions with personal_fit folded in. Returns new
 *  Decision objects; the input assessment is not mutated. If pfCat is null,
 *  returns the base decisions unchanged. */
export function personalizedDecisions(
  assessment: Assessment,
  pfCat: Category | null,
  profile: Profile,
): Record<DecisionKey, Decision> {
  if (!pfCat) {
    const base: Partial<Record<DecisionKey, Decision>> = {};
    for (const d of DECISIONS) base[d] = assessment.decisions[d];
    return base as Record<DecisionKey, Decision>;
  }

  const cap = transparencyTier(assessment).cap;
  const cats: Record<string, Category> = { ...assessment.categories, personal_fit: pfCat };
  const out: Partial<Record<DecisionKey, Decision>> = {};

  for (const dkey of DECISIONS) {
    const h = HORIZON_BY_DECISION[dkey] ?? "long";
    const baseW = assessment.category_weights_by_decision?.[dkey] ?? {};
    const wpf = profile.priorities?.[dkey] ?? W_PF_DEFAULT[dkey];
    const scaled: Record<string, number> = {};
    for (const [k, v] of Object.entries(baseW)) scaled[k] = v * (1 - wpf);
    scaled.personal_fit = wpf;

    const comp = decisionComposite(cats, scaled, h, cap);
    const score = round(comp.score, 2);
    const confidence = round(comp.confidence, 2);
    out[dkey] = {
      score,
      confidence,
      horizon: assessment.decisions[dkey]?.horizon ?? "",
      reading: readingFor(score, confidence),
      trajectory: {
        near: round(decisionComposite(cats, scaled, "near", cap).score, 2),
        mid: round(decisionComposite(cats, scaled, "mid", cap).score, 2),
        long: round(decisionComposite(cats, scaled, "long", cap).score, 2),
      },
    };
  }
  return out as Record<DecisionKey, Decision>;
}

/** Convenience: pathway lookup + personal_fit + personalized decisions in one call. */
export function personalize(assessment: Assessment, profile: Profile) {
  const pathway = getPathway(assessment.iso3);
  const personalFit = buildPersonalFitCategory(profile, pathway);
  const decisions = personalizedDecisions(assessment, personalFit, profile);
  return { pathway, personalFit, decisions, hasData: !!pathway };
}
