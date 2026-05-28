// Regenerate _comparison-index.json from the recomputed assessments.
// Rankings are derived from each assessment's decision scores; narrative fields
// (scale, headline findings, outstanding work) are authored here.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");

const DECISIONS = [
  ["living", "5-10y"],
  ["assets", "3-7y"],
  ["currency", "1-3y"],
];

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const docs = [];
  for (const f of files) docs.push(JSON.parse(await fs.readFile(path.join(dir, f), "utf8")));

  const decisions = {};
  for (const [key, horizon] of DECISIONS) {
    const ranking = docs
      .map((d) => ({
        country: d.country,
        iso3: d.iso3,
        score: d.decisions[key].score,
        confidence: d.decisions[key].confidence,
        skew: d.skew ?? "unknown",
      }))
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({ rank: i + 1, ...r }));
    decisions[key] = { horizon, ranking };
  }

  const index = {
    title: "Country Comparison Index",
    project: "themildtake",
    methodology_version: "2.0",
    assessed_on: "2026-05-28",
    subject_profile: {
      summary:
        "Base country-level comparison; default category weights prioritize rule of law, institutional integrity, and personal freedom.",
      stated_values: [
        "Rule of law and institutional integrity weighted most heavily",
        "Personal freedom and security from arbitrary state action are foundational",
        "Economic success is contingent on rule of law, not a substitute for it",
      ],
    },
    scale: {
      min: -10,
      max: 10,
      thresholds: {
        clear_positive: ">= +3",
        mixed: "between -3 and +3",
        clear_negative: "<= -3",
        insufficient_confidence: "confidence < 0.40",
      },
    },
    decisions,
    headline_findings: [
      "Sweden and Canada remain the two clear-positive destinations across all three decisions; effectively tied for living once personal fit is included.",
      "The v2.0 source-discipline re-run sharpens, but does not reverse, the order: the US and China still occupy the bottom for living, reached by opposite routes (democratic erosion vs authoritarian baseline).",
      "On the economic-heavy decisions (assets, currency) the US now scores BELOW China: scoring trade on actions penalizes the US's self-inflicted tariff volatility, the official-data entanglement discount lowers US confidence, and China's independently-verified manufacturing capacity (trade re-weighted to 0.17) is credited even after CCP-data exclusion.",
      "Mexico improves on living and assets after the skew re-examination credits its nearshoring trajectory and demographic dividend as real, durable upsides.",
      "Skew direction stays decision-relevant: Ukraine and Mexico carry positive skew (war resolution / nearshoring), China and the US negative (locked-in demographics / institutional drift).",
    ],
    outstanding_work: [
      "Continue monitoring China via independent proxies (electricity, freight, partner customs, foreign-firm earnings); revisit if proxy signals diverge from current estimates.",
      "Re-check the US official-data entanglement discount after each major statistical-agency development (e.g. BLS leadership, FOMC behavior).",
      "Watch the Sept 2026 Swedish election and the Russia tail risk for Sweden's political/social and geopolitical scores.",
      "Refresh trade scores as tariff actions and partner diversification evolve (the factor is now action-driven and will move faster than structural factors).",
    ],
    notes:
      "v2.0: hard exclusion rule applied uniformly (CCP self-reported data excluded and rebuilt from independent proxies; US post-2022 official data discounted as partially-entangled); trade/industrial-capacity re-weighted 0.05 -> 0.17 and scored on actions + trajectory + capacity + resource-curse; slant-balance audit run on all six; Mexico re-examined under skew. The optional strict-foundational-weighting variant was deliberately NOT applied: per subject direction, scoring leans on observable actions and independent data rather than stated values or unreliable leadership rhetoric.",
  };

  await fs.writeFile(path.join(repoRoot, "_comparison-index.json"), JSON.stringify(index, null, 2) + "\n");

  console.log("[build-index] rankings:");
  for (const [key] of DECISIONS) {
    console.log(`  ${key}: ` + decisions[key].ranking.map((r) => `${r.iso3} ${r.score}`).join("  "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
