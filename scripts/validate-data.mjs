// Structural + semantic validation for every canonical assessment.
// Run in `npm test` and `prebuild` so a malformed or drifted file fails the
// build instead of shipping. Collects ALL violations, prints them, and exits
// non-zero if any are found.
//
// Checks per assessments/*.json:
//   - required top-level fields present and well-typed
//   - iso3 is three uppercase letters and unique across the dataset
//   - skew ∈ {positive, negative, symmetric}
//   - every numeric sub-factor score (score | score_near | score_long) ∈ [-10,10]
//   - every sub-factor confidence ∈ [0,1]
//   - per-category sub-factor weights sum to ~1.0 (±0.01)
//   - per-decision category weights sum to ~1.0 (±0.01)
//   - recompute reproduces the stored category/decision aggregates (no drift)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  recompute,
  round,
} from "./compute-scores.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");

const SKEWS = new Set(["positive", "negative", "symmetric"]);
const DECISIONS = ["living", "assets", "currency"];
const WEIGHT_EPS = 0.01;
const SCORE_EPS = 0.011; // stored scores are pre-rounded; allow rounding noise

const REQUIRED_TOP = [
  "country",
  "iso3",
  "methodology_version",
  "assessed_on",
  "skew",
  "category_weights_by_decision",
  "categories",
  "decisions",
  "summary",
];

function numericScores(sf) {
  return ["score", "score_near", "score_long"]
    .map((k) => sf[k])
    .filter((v) => typeof v === "number");
}

function validateOne(file, doc, seenIso3, errors) {
  const tag = (msg) => errors.push(`${file}: ${msg}`);

  for (const k of REQUIRED_TOP) {
    if (doc[k] === undefined || doc[k] === null) tag(`missing required field "${k}"`);
  }
  if (typeof doc.country !== "string" || !doc.country) tag(`"country" must be a non-empty string`);

  if (typeof doc.iso3 !== "string" || !/^[A-Z]{3}$/.test(doc.iso3)) {
    tag(`iso3 "${doc.iso3}" must be three uppercase letters`);
  } else if (seenIso3.has(doc.iso3)) {
    tag(`duplicate iso3 "${doc.iso3}" (also in ${seenIso3.get(doc.iso3)})`);
  } else {
    seenIso3.set(doc.iso3, file);
  }

  if (!SKEWS.has(doc.skew)) tag(`skew "${doc.skew}" not in {positive, negative, symmetric}`);

  // Categories + sub-factors.
  if (doc.categories && typeof doc.categories === "object") {
    for (const [ckey, cat] of Object.entries(doc.categories)) {
      const subs = cat?.sub_factors;
      if (!subs || typeof subs !== "object") {
        tag(`category "${ckey}" has no sub_factors`);
        continue;
      }
      let weightSum = 0;
      for (const [skey, sf] of Object.entries(subs)) {
        if (typeof sf.weight !== "number" || sf.weight < 0) {
          tag(`${ckey}.${skey} weight must be a non-negative number`);
        } else {
          weightSum += sf.weight;
        }
        if (typeof sf.confidence !== "number" || sf.confidence < 0 || sf.confidence > 1) {
          tag(`${ckey}.${skey} confidence ${sf.confidence} out of [0,1]`);
        }
        for (const v of numericScores(sf)) {
          if (v < -10 || v > 10) tag(`${ckey}.${skey} score ${v} out of [-10,10]`);
        }
      }
      if (Math.abs(weightSum - 1) > WEIGHT_EPS) {
        tag(`category "${ckey}" sub-weights sum to ${round(weightSum, 4)} (expected ~1.0)`);
      }
    }
  }

  // Per-decision category weights.
  const cwd = doc.category_weights_by_decision;
  if (cwd && typeof cwd === "object") {
    for (const dkey of DECISIONS) {
      const weights = cwd[dkey];
      if (!weights || typeof weights !== "object") {
        tag(`category_weights_by_decision.${dkey} missing`);
        continue;
      }
      const sum = Object.values(weights).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
      if (Math.abs(sum - 1) > WEIGHT_EPS) {
        tag(`decision "${dkey}" category weights sum to ${round(sum, 4)} (expected ~1.0)`);
      }
    }
  }

  // Recompute determinism: stored aggregates must match a fresh recompute.
  try {
    const fresh = recompute(JSON.parse(JSON.stringify(doc)));
    for (const [ckey, cat] of Object.entries(doc.categories ?? {})) {
      const f = fresh.categories[ckey];
      if (Math.abs((cat.score ?? 0) - f.score) > SCORE_EPS) {
        tag(`category "${ckey}" score ${cat.score} drifted from recompute ${f.score}`);
      }
      if (Math.abs((cat.confidence ?? 0) - f.confidence) > SCORE_EPS) {
        tag(`category "${ckey}" confidence ${cat.confidence} drifted from recompute ${f.confidence}`);
      }
    }
    for (const dkey of DECISIONS) {
      const stored = doc.decisions?.[dkey];
      const f = fresh.decisions[dkey];
      if (!stored || !f) continue;
      if (Math.abs((stored.score ?? 0) - f.score) > SCORE_EPS) {
        tag(`decision "${dkey}" score ${stored.score} drifted from recompute ${f.score}`);
      }
      if (stored.reading !== f.reading) {
        tag(`decision "${dkey}" reading "${stored.reading}" != recompute "${f.reading}"`);
      }
    }
  } catch (e) {
    tag(`recompute threw: ${e.message}`);
  }
}

async function main() {
  const files = (await fs.readdir(dir)).filter(
    (f) => f.endsWith(".json") && !f.startsWith("_"),
  );
  const errors = [];
  const seenIso3 = new Map();

  for (const file of files) {
    let doc;
    try {
      doc = JSON.parse(await fs.readFile(path.join(dir, file), "utf8"));
    } catch (e) {
      errors.push(`${file}: invalid JSON — ${e.message}`);
      continue;
    }
    validateOne(file, doc, seenIso3, errors);
  }

  if (errors.length) {
    console.error(`[validate] ${errors.length} violation(s) across ${files.length} files:`);
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }
  console.log(`[validate] OK — ${files.length} assessments, ${seenIso3.size} unique iso3, no drift.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
