// Recompute engine for the themildtake assessments.
//
// Fills each assessment's category `score` (near-term composite) + `confidence`
// and each decision's `score` / `confidence` / `reading` from the sub-factors,
// using the methodology's confidence-weighted formula:
//
//   composite = Σ(sub_score × weight × confidence) / Σ(weight × confidence)
//   confidence = Σ(weight × confidence)          [weights sum to 1]
//
// Horizon per decision: living -> long, assets -> mid (avg near/long), currency
// -> near. Categories store the near-term composite for display (matches the
// prior convention). Sub-factor scores/weights/notes are authoritative and are
// never modified here; only the aggregates are written back.
//
// Usage:
//   node scripts/compute-scores.mjs            # rewrite aggregates in place
//   node scripts/compute-scores.mjs --check    # print, do not write

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");
const CHECK = process.argv.includes("--check");

export const round = (n, d) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

export function subHorizon(sf, h) {
  const hasSplit = sf.score === null || sf.score === undefined;
  const near = sf.score_near ?? sf.score;
  const long = sf.score_long ?? sf.score;
  if (h === "near") return near;
  if (h === "long") return long;
  // mid (assets): interpolate split factors, else single score
  if (hasSplit && near !== null && near !== undefined && long !== null && long !== undefined) {
    return (near + long) / 2;
  }
  return sf.score ?? near ?? long;
}

export function categoryComposite(cat, h, confCap = 1) {
  let num = 0;
  let den = 0;
  for (const sf of Object.values(cat.sub_factors)) {
    const s = subHorizon(sf, h);
    if (s === null || s === undefined) continue;
    // Observability ceiling: you can't be more confident in a score than your
    // access to the country allows, regardless of the authored evidence quality.
    const c = Math.min(sf.confidence, confCap);
    const wc = sf.weight * c;
    num += s * wc;
    den += wc;
  }
  return { score: den === 0 ? 0 : num / den, confidence: den };
}

// Transparency / observability tier, derived from the sub-factors that govern
// whether the truth about a country can be observed at all: a free press and
// civil liberties (can the truth get out?) plus statistical integrity (does the
// state itself publish honestly?). The tier sets a CEILING on confidence — it
// never changes the directional score except via re-weighting where it clips —
// so opacity lowers how much we vouch for a read, not the read itself.
const TIER_CAP = { observable: 1.0, mixed: 0.75, opaque: 0.6, unknown: 1.0 };

export function transparencyTier(doc) {
  const at = (cat, key) => {
    const sf = doc.categories?.[cat]?.sub_factors?.[key];
    if (!sf) return null;
    return sf.score ?? sf.score_near ?? sf.score_long ?? null;
  };
  const press = at("institutional", "press_freedom");
  const civ = at("political_social", "civil_liberties");
  const stat = at("institutional", "statistical_integrity");

  let tier;
  if (press === null && civ === null) {
    tier = "unknown";
  } else if ((press !== null && press <= -6) || (civ !== null && civ <= -6)) {
    tier = "opaque"; // state controls/captures media or crushes civil society
  } else if (press !== null && civ !== null && press >= 2 && civ >= 2) {
    tier = "observable"; // free press + civil liberties: the truth gets out
  } else {
    tier = "mixed"; // in between — often state-opaque while society stays open
  }

  // Trend: a non-opaque country whose state-published data is already badly
  // compromised is sliding toward opacity (the state is going dark ahead of
  // society) — flag it declining. The US is the archetype.
  const trend = tier !== "opaque" && stat !== null && stat <= -4 ? "declining" : "stable";

  return { tier, trend, cap: TIER_CAP[tier] };
}

export function readingFor(score, confidence) {
  if (confidence < 0.4) return "insufficient confidence";
  if (score >= 3) return "clear positive";
  if (score <= -3) return "clear negative";
  return "mixed";
}

export const HORIZON_BY_DECISION = { living: "long", assets: "mid", currency: "near" };

// Confidence-weighted composite of categories for one decision horizon.
export function decisionComposite(categories, weights, h, confCap = 1) {
  let num = 0;
  let den = 0;
  for (const [catKey, cat] of Object.entries(categories)) {
    const w = weights[catKey] ?? 0;
    if (w === 0) continue;
    const comp = categoryComposite(cat, h, confCap);
    const wc = w * comp.confidence;
    num += comp.score * wc;
    den += wc;
  }
  return { score: den === 0 ? 0 : num / den, confidence: den };
}

export function recompute(doc) {
  // Observability tier governs the confidence ceiling used in every composite.
  const { tier, trend, cap } = transparencyTier(doc);
  doc.transparency_tier = tier;
  doc.transparency_trend = trend;

  // Category aggregates: store the near-term composite for display.
  for (const cat of Object.values(doc.categories)) {
    const near = categoryComposite(cat, "near", cap);
    cat.score = round(near.score, 1);
    cat.confidence = round(near.confidence, 2);
  }

  for (const [dkey, decision] of Object.entries(doc.decisions)) {
    const h = HORIZON_BY_DECISION[dkey] ?? "long";
    const weights = doc.category_weights_by_decision?.[dkey] ?? {};
    const comp = decisionComposite(doc.categories, weights, h, cap);
    decision.score = round(comp.score, 2);
    decision.confidence = round(comp.confidence, 2);
    decision.reading = readingFor(decision.score, decision.confidence);
    // Same weighting projected across all three horizons, so the detail page can
    // chart the near->long trajectory. The decision's reported score is the
    // point at its native horizon (currency=near, assets=mid, living=long).
    decision.trajectory = {
      near: round(decisionComposite(doc.categories, weights, "near", cap).score, 2),
      mid: round(decisionComposite(doc.categories, weights, "mid", cap).score, 2),
      long: round(decisionComposite(doc.categories, weights, "long", cap).score, 2),
    };
  }
  return doc;
}

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const summary = [];
  for (const file of files) {
    const p = path.join(dir, file);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));
    recompute(doc);
    if (!CHECK) await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
    summary.push({
      country: doc.country,
      living: doc.decisions.living?.score,
      assets: doc.decisions.assets?.score,
      currency: doc.decisions.currency?.score,
      conf: doc.decisions.living?.confidence,
    });
  }
  summary.sort((a, b) => b.living - a.living);
  console.log(CHECK ? "[check] computed (not written):" : "[compute] written:");
  for (const s of summary) {
    console.log(
      `  ${s.country.padEnd(16)} living ${String(s.living).padStart(6)} | assets ${String(s.assets).padStart(6)} | currency ${String(s.currency).padStart(6)} | conf ${s.conf}`,
    );
  }
}

// Only run the CLI when invoked directly (`node scripts/compute-scores.mjs`),
// not when imported by the test suite.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
