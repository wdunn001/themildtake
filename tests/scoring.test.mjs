// Unit tests for the scoring engine (scripts/compute-scores.mjs).
// Covers the confidence-weighted composite math, horizon resolution, the
// readingFor thresholds, the zero-denominator guard, null-skipping, and
// recompute determinism against the real dataset.

import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  round,
  subHorizon,
  categoryComposite,
  decisionComposite,
  readingFor,
  recompute,
  HORIZON_BY_DECISION,
} from "../scripts/compute-scores.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const assessmentsDir = path.join(repoRoot, "assessments");

const approx = (a, b, eps = 1e-9) =>
  assert.ok(Math.abs(a - b) <= eps, `${a} ~= ${b} (±${eps})`);

test("round() rounds to the given decimals", () => {
  approx(round(2.8571, 2), 2.86);
  approx(round(6.666, 1), 6.7);
  approx(round(-3.0049, 2), -3.0);
});

test("subHorizon resolves single scores identically across horizons", () => {
  const sf = { score: 5, score_near: null, score_long: null };
  assert.equal(subHorizon(sf, "near"), 5);
  assert.equal(subHorizon(sf, "long"), 5);
  assert.equal(subHorizon(sf, "mid"), 5);
});

test("subHorizon picks near/long and interpolates mid for split factors", () => {
  const sf = { score: null, score_near: 6, score_long: 2 };
  assert.equal(subHorizon(sf, "near"), 6);
  assert.equal(subHorizon(sf, "long"), 2);
  assert.equal(subHorizon(sf, "mid"), 4); // (6 + 2) / 2
});

test("categoryComposite computes the confidence-weighted mean", () => {
  // num = 10*0.5*0.4 + 0*0.5*1 = 2 ; den = 0.5*0.4 + 0.5*1 = 0.7
  const cat = {
    sub_factors: {
      a: { score: 10, weight: 0.5, confidence: 0.4 },
      b: { score: 0, weight: 0.5, confidence: 1 },
    },
  };
  const got = categoryComposite(cat, "near");
  approx(got.score, 2 / 0.7);
  approx(got.confidence, 0.7);
});

test("categoryComposite skips null sub-scores", () => {
  const cat = {
    sub_factors: {
      a: { score: null, weight: 0.5, confidence: 1 },
      b: { score: 8, weight: 0.5, confidence: 1 },
    },
  };
  const got = categoryComposite(cat, "near");
  approx(got.score, 8); // only b contributes
  approx(got.confidence, 0.5);
});

test("categoryComposite returns 0 score when the denominator is zero", () => {
  const cat = { sub_factors: { a: { score: 5, weight: 0, confidence: 1 } } };
  const got = categoryComposite(cat, "near");
  assert.equal(got.score, 0);
  assert.equal(got.confidence, 0);
});

test("decisionComposite weights categories by weight*confidence", () => {
  const categories = {
    econ: { sub_factors: { x: { score: 6, weight: 1, confidence: 1 } } },
    inst: { sub_factors: { y: { score: 0, weight: 1, confidence: 0.5 } } },
  };
  const weights = { econ: 0.5, inst: 0.5 };
  // econ comp = {6, 1}; inst comp = {0, 0.5}
  // num = 6*0.5*1 + 0*0.5*0.5 = 3 ; den = 0.5*1 + 0.5*0.5 = 0.75
  const got = decisionComposite(categories, weights, "near");
  approx(got.score, 3 / 0.75);
  approx(got.confidence, 0.75);
});

test("decisionComposite ignores zero-weight categories and guards empty denominators", () => {
  const categories = {
    econ: { sub_factors: { x: { score: 6, weight: 1, confidence: 1 } } },
    phys: { sub_factors: { z: { score: 9, weight: 1, confidence: 1 } } },
  };
  const got = decisionComposite(categories, { econ: 0, phys: 0 }, "near");
  assert.equal(got.score, 0);
  assert.equal(got.confidence, 0);
});

test("readingFor honours the methodology thresholds", () => {
  assert.equal(readingFor(5, 0.9), "clear positive");
  assert.equal(readingFor(3, 0.9), "clear positive"); // inclusive boundary
  assert.equal(readingFor(-5, 0.9), "clear negative");
  assert.equal(readingFor(-3, 0.9), "clear negative"); // inclusive boundary
  assert.equal(readingFor(2.9, 0.9), "mixed");
  assert.equal(readingFor(0, 0.9), "mixed");
  assert.equal(readingFor(8, 0.39), "insufficient confidence");
  assert.equal(readingFor(8, 0.4), "clear positive"); // 0.4 is not < 0.4
});

test("HORIZON_BY_DECISION maps the three decisions", () => {
  assert.deepEqual(HORIZON_BY_DECISION, { living: "long", assets: "mid", currency: "near" });
});

test("recompute is deterministic and reproduces stored aggregates", async () => {
  const raw = await fs.readFile(path.join(assessmentsDir, "norway.json"), "utf8");
  const stored = JSON.parse(raw);

  const a = recompute(JSON.parse(raw));
  const b = recompute(JSON.parse(raw));
  assert.deepEqual(a, b, "recompute must be deterministic");

  // The committed file's aggregates must already equal a fresh recompute
  // (i.e. compute-scores was run before commit).
  for (const [key, cat] of Object.entries(stored.categories)) {
    assert.equal(cat.score, a.categories[key].score, `category ${key} score drift`);
    assert.equal(cat.confidence, a.categories[key].confidence, `category ${key} conf drift`);
  }
  for (const [dkey, dec] of Object.entries(stored.decisions)) {
    assert.equal(dec.score, a.decisions[dkey].score, `decision ${dkey} score drift`);
    assert.equal(dec.confidence, a.decisions[dkey].confidence, `decision ${dkey} conf drift`);
    assert.equal(dec.reading, a.decisions[dkey].reading, `decision ${dkey} reading drift`);
  }
});

test("a weighted composite never exceeds its sub-factor extremes", () => {
  // Guards the documented claim behind analyze-bias.mjs: the formula is a
  // weighted average, so |composite| <= max(|sub scores|). Extremeness can only
  // come from the authored sub-scores, never the aggregation.
  const cat = {
    sub_factors: {
      a: { score: 7, weight: 0.3, confidence: 0.8 },
      b: { score: -4, weight: 0.4, confidence: 0.6 },
      c: { score: 2, weight: 0.3, confidence: 0.9 },
    },
  };
  const { score } = categoryComposite(cat, "near");
  assert.ok(score <= 7 && score >= -4, `composite ${score} within [-4, 7]`);
});
