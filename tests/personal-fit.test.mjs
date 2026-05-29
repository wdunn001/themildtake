// Unit tests for the client personalization engine (src/lib/personalFit.ts),
// imported via Node's TypeScript type-stripping.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPersonalFitCategory,
  personalizedDecisions,
  personalize,
} from "../src/lib/personalFit.ts";

// Minimal but valid base assessment. No press_freedom/civil_liberties sub-factors,
// so the transparency tier resolves to "unknown" (cap 1.0) and does not interfere.
function baseAssessment(iso3 = "TST") {
  return {
    country: "Testland",
    iso3,
    methodology_version: "2.0",
    assessed_on: "2026-05-29",
    subject_profile: {},
    categories: {
      economic: { score: 0, confidence: 0, sub_factors: { a: { score: 2, weight: 1, confidence: 0.8 } } },
      institutional: { score: 0, confidence: 0, sub_factors: { a: { score: 3, weight: 1, confidence: 0.8 } } },
      political_social: { score: 0, confidence: 0, sub_factors: { a: { score: 2, weight: 1, confidence: 0.8 } } },
      geopolitical: { score: 0, confidence: 0, sub_factors: { a: { score: 1, weight: 1, confidence: 0.8 } } },
      physical_practical: { score: 0, confidence: 0, sub_factors: { a: { score: 2, weight: 1, confidence: 0.8 } } },
    },
    category_weights_by_decision: {
      living: { economic: 0.15, institutional: 0.35, political_social: 0.3, geopolitical: 0.05, physical_practical: 0.15 },
      assets: { economic: 0.4, institutional: 0.25, political_social: 0.1, geopolitical: 0.15, physical_practical: 0.1 },
      currency: { economic: 0.6, institutional: 0.2, political_social: 0.05, geopolitical: 0.15, physical_practical: 0 },
    },
    decisions: {
      living: { score: 2.3, confidence: 0.8, horizon: "5-10y", reading: "mixed" },
      assets: { score: 2.1, confidence: 0.8, horizon: "3-7y", reading: "mixed" },
      currency: { score: 1.9, confidence: 0.8, horizon: "1-3y", reading: "mixed" },
    },
  };
}

const goodPathway = {
  iso3: "TST", country: "Testland", languages: ["English"], demandProfessions: ["tech"],
  immigration: [{ name: "Skilled", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 2, timeToCitizenshipYears: 5, officialUrl: "https://x" }],
  assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "", officialUrl: "https://x" },
  currency: { capitalAccountOpen: true, nonResidentBanking: "easy", fxControls: "none", centralBankUrl: "https://x" },
  credentials: { note: "", url: "https://x" }, links: { immigration: "https://x", investment: "https://x", centralBank: "https://x" },
};
const badPathway = {
  iso3: "TST", country: "Testland", languages: ["Klingon"], demandProfessions: ["finance"],
  immigration: [{ name: "Investor", type: "investor", eligibility: { minCapitalUsd: 1000000, professions: ["finance"], languageReq: "official" }, difficulty: "hard", timeToPrYears: 10, timeToCitizenshipYears: 30, officialUrl: "https://x" }],
  assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "restricted", nonResidentBrokerage: "no", note: "", officialUrl: "https://x" },
  currency: { capitalAccountOpen: false, nonResidentBanking: "hard", fxControls: "strict", centralBankUrl: "https://x" },
  credentials: { note: "", url: "https://x" }, links: { immigration: "https://x", investment: "https://x", centralBank: "https://x" },
};

const goodProfile = { originIso3: "USA", languages: ["English"], profession: "tech", capitalBand: "none", goals: ["live"] };
const badProfile = { originIso3: "CHN", languages: ["Spanish"], profession: "trades", capitalBand: "none", goals: ["live"] };

test("buildPersonalFitCategory returns six weighted sub-factors that sum to 1", () => {
  const cat = buildPersonalFitCategory(goodProfile, goodPathway);
  assert.ok(cat);
  const keys = Object.keys(cat.sub_factors);
  assert.equal(keys.length, 6);
  const wsum = keys.reduce((s, k) => s + cat.sub_factors[k].weight, 0);
  assert.ok(Math.abs(wsum - 1) < 1e-9, `sub-weights sum to ${wsum}`);
});

test("a strong fit scores positive, a poor fit scores negative", () => {
  const good = buildPersonalFitCategory(goodProfile, goodPathway);
  const bad = buildPersonalFitCategory(badProfile, badPathway);
  assert.ok(good.score > 3, `good fit ${good.score} > 3`);
  assert.ok(bad.score < -2, `poor fit ${bad.score} < -2`);
});

test("no pathway data yields a null category", () => {
  assert.equal(buildPersonalFitCategory(goodProfile, null), null);
});

test("personalization moves the decision in the fit's direction and never mutates the base", () => {
  const a = baseAssessment();
  const snapshot = JSON.stringify(a);
  const goodCat = buildPersonalFitCategory(goodProfile, goodPathway);
  const goodDec = personalizedDecisions(a, goodCat, goodProfile);
  assert.ok(goodDec.living.score > a.decisions.living.score, "good fit raises living");

  const badCat = buildPersonalFitCategory(badProfile, badPathway);
  const badDec = personalizedDecisions(a, badCat, badProfile);
  assert.ok(badDec.living.score < a.decisions.living.score, "poor fit lowers living");

  assert.equal(JSON.stringify(a), snapshot, "base assessment must be untouched");
  // Personalized scores stay on the -10..+10 scale.
  for (const d of ["living", "assets", "currency"]) {
    assert.ok(goodDec[d].score >= -10 && goodDec[d].score <= 10);
  }
});

test("null personal_fit falls back to the base decisions unchanged", () => {
  const a = baseAssessment();
  const dec = personalizedDecisions(a, null, goodProfile);
  assert.equal(dec.living.score, a.decisions.living.score);
  assert.equal(dec.currency.score, a.decisions.currency.score);
});

test("personalize() flags whether curated pathway data exists", () => {
  const withData = personalize(baseAssessment("PRT"), goodProfile);
  assert.equal(withData.hasData, true, "PRT is in the curated tier");
  assert.ok(withData.personalFit);

  const noData = personalize(baseAssessment("SDN"), goodProfile);
  assert.equal(noData.hasData, false, "Sudan is not in the curated tier");
  assert.equal(noData.personalFit, null);
  assert.equal(noData.decisions.living.score, baseAssessment("SDN").decisions.living.score);
});
