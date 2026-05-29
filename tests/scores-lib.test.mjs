// Unit tests for the client-side pure helpers in src/lib/scores.ts.
// Imported directly via Node's built-in TypeScript type-stripping (the
// `import type` lines are erased at load time).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  readingFor,
  sentimentFor,
  formatScore,
  formatConfidence,
  scorePercent,
  subFactorScore,
  categoryLabel,
  SCORE_MIN,
  SCORE_MAX,
  LOW_CONFIDENCE,
} from "../src/lib/scores.ts";

test("scores.ts readingFor matches the engine's thresholds", () => {
  assert.equal(readingFor(3, 0.9), "clear positive");
  assert.equal(readingFor(-3, 0.9), "clear negative");
  assert.equal(readingFor(2.9, 0.9), "mixed");
  assert.equal(readingFor(9, LOW_CONFIDENCE - 0.01), "insufficient confidence");
  assert.equal(readingFor(9, LOW_CONFIDENCE), "clear positive");
});

test("sentimentFor mirrors the reading thresholds without the confidence gate", () => {
  assert.equal(sentimentFor(3), "pos");
  assert.equal(sentimentFor(-3), "neg");
  assert.equal(sentimentFor(0), "mixed");
});

test("formatScore signs positives and keeps one/two decimals", () => {
  assert.equal(formatScore(0), "0.0");
  assert.equal(formatScore(5), "+5.0");
  assert.equal(formatScore(3.25), "+3.25");
  assert.equal(formatScore(-4.39), "-4.39");
});

test("formatConfidence renders a rounded percentage", () => {
  assert.equal(formatConfidence(0.85), "85%");
  assert.equal(formatConfidence(0.5), "50%");
  assert.equal(formatConfidence(1), "100%");
});

test("scorePercent maps -10..10 onto 0..100 and clamps out-of-range", () => {
  assert.equal(scorePercent(SCORE_MIN), 0);
  assert.equal(scorePercent(SCORE_MAX), 100);
  assert.equal(scorePercent(0), 50);
  assert.equal(scorePercent(-100), 0); // clamped
  assert.equal(scorePercent(100), 100); // clamped
});

test("subFactorScore prefers score, then near, then long, else null", () => {
  assert.equal(subFactorScore({ score: 4, score_near: 1, score_long: 2 }), 4);
  assert.equal(subFactorScore({ score: null, score_near: 1, score_long: 2 }), 1);
  assert.equal(subFactorScore({ score: null, score_near: null, score_long: 2 }), 2);
  assert.equal(subFactorScore({ score: null, score_near: null, score_long: null }), null);
});

test("categoryLabel uses overrides and title-cases the rest", () => {
  assert.equal(categoryLabel("political_social"), "Political & Social");
  assert.equal(categoryLabel("physical_practical"), "Physical & Practical");
  assert.equal(categoryLabel("some_new_key"), "Some New Key");
});
