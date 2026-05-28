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
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");
const CHECK = process.argv.includes("--check");

const round = (n, d) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function subHorizon(sf, h) {
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

function categoryComposite(cat, h) {
  let num = 0;
  let den = 0;
  for (const sf of Object.values(cat.sub_factors)) {
    const s = subHorizon(sf, h);
    if (s === null || s === undefined) continue;
    const wc = sf.weight * sf.confidence;
    num += s * wc;
    den += wc;
  }
  return { score: den === 0 ? 0 : num / den, confidence: den };
}

function readingFor(score, confidence) {
  if (confidence < 0.4) return "insufficient confidence";
  if (score >= 3) return "clear positive";
  if (score <= -3) return "clear negative";
  return "mixed";
}

const HORIZON_BY_DECISION = { living: "long", assets: "mid", currency: "near" };

function recompute(doc) {
  // Category aggregates: store the near-term composite for display.
  const catConf = {};
  for (const [key, cat] of Object.entries(doc.categories)) {
    const near = categoryComposite(cat, "near");
    cat.score = round(near.score, 1);
    cat.confidence = round(near.confidence, 2);
    catConf[key] = near.confidence; // weights sum to 1 -> confidence is horizon-invariant
  }

  for (const [dkey, decision] of Object.entries(doc.decisions)) {
    const h = HORIZON_BY_DECISION[dkey] ?? "long";
    const weights = doc.category_weights_by_decision?.[dkey] ?? {};
    let num = 0;
    let den = 0;
    for (const [catKey, cat] of Object.entries(doc.categories)) {
      const w = weights[catKey] ?? 0;
      if (w === 0) continue;
      const comp = categoryComposite(cat, h);
      const wc = w * comp.confidence;
      num += comp.score * wc;
      den += wc;
    }
    const score = den === 0 ? 0 : num / den;
    decision.score = round(score, 2);
    decision.confidence = round(den, 2);
    decision.reading = readingFor(decision.score, decision.confidence);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
