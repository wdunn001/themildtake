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
        transparency_tier: d.transparency_tier ?? "unknown",
        transparency_trend: d.transparency_trend ?? "stable",
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
      "The top of the board is small, stable, and institutionally deep: Norway, Switzerland, and Luxembourg lead living, with Switzerland and Singapore topping the money decisions. They win by having no weak category rather than one standout.",
      "The floor is conflict and state collapse — Sudan, Haiti, North Korea, Yemen, Myanmar — where the read is unanimous across all three decisions.",
      "The marquee outlier is the United States at living #173: a wealthy democracy in the bottom decile, driven by institutional drift (statistical-agency capture, court defiance, alliance decay) scored on observable actions rather than reputation. On the economic-heavy assets and currency decisions it now scores BELOW China.",
      "The 2026 Iran war and the Strait of Hormuz closure recalibrated the Middle East: the Gulf petrostates drop on the near-term currency and mid-horizon assets decisions (oil/LNG export blockade, regional strikes, attacks and threats on desalination), while the longer-horizon living read moves less.",
      "Skew is decision-relevant: a positive-skew recovery cluster (Ukraine, Argentina, Syria) leans up on resolution and reform — Ukraine's war-forged, world-leading drone/EW defense industry is now an emerging export strength — while the negative-skew majors (US, China, Russia) lean down on institutional drift and structural tails.",
    ],
    outstanding_work: [
      "Track the 2026 Iran war / Strait of Hormuz status (ceasefire durability, strait reopening) and re-score the Gulf exporters + energy importers as the shock resolves or escalates.",
      "Re-check the US official-data entanglement discount after each major statistical-agency development (BLS leadership, FOMC behavior, court compliance).",
      "Continue monitoring China via independent proxies (electricity, freight, partner customs, foreign-firm earnings); revisit if proxy signals diverge from current estimates.",
      "Refresh trade scores as tariff actions and partner diversification evolve (action-driven, faster-moving than structural factors); watch Ukraine's emerging defense-export industry as a positive-skew driver.",
    ],
    notes:
      "v2.0: all 193 UN members assessed on observable actions + independent data. Hard exclusion applied uniformly (CCP self-reported data rebuilt from independent proxies; US official data from 2025 onward discounted as partially-entangled, pre-2025 data treated as reliable). Trade/industrial capacity weighted 0.17 and scored on actions + trajectory + capacity + resource-curse; the climate sub-factor anchored to ND-GAIN/IPCC with windowed high-latitude effects; the Middle East recalibrated for the 2026 Iran war + Strait of Hormuz crisis. The optional strict-foundational-weighting variant was deliberately NOT applied: scoring leans on observable actions and independent data rather than stated values or leadership rhetoric.",
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
