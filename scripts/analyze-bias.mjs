// Data-extremeness diagnostic.
//
// The worry: "our methodology produces more extreme scores for countries we
// have more data on." This script measures whether that shows up empirically.
//
// For every assessment it derives three data-richness proxies - mean sub-factor
// confidence, count of distinct cited sources, and total notes length - and
// correlates each (Pearson) with the ABSOLUTE decision scores |living|,
// |assets|, |currency|. It also reports the mean |score| of the top vs bottom
// confidence quartiles.
//
// IMPORTANT caveat (printed in the report): the composite is a confidence-
// weighted AVERAGE, so |composite| can never exceed the largest |sub-score|.
// The aggregation therefore cannot manufacture extremeness - any correlation
// lives in the AUTHORED sub-scores, not the formula. And a positive
// confidence↔|score| correlation is partly expected by design: data-poor states
// are deliberately hedged toward the center / "insufficient confidence", which
// pulls their |score| down. Read the numbers with that in mind; remediation, if
// warranted, is an authoring/calibration pass, not a math change.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");

const DECISIONS = ["living", "assets", "currency"];

function pearson(xs, ys) {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    dx = 0,
    dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

// Distinct cited sources: tokens inside parenthetical notes, split on ; / , and
// "and". Approximate but a stable proxy for sourcing density.
function distinctSources(notesBlob) {
  const sources = new Set();
  const parens = notesBlob.match(/\(([^)]+)\)/g) ?? [];
  for (const p of parens) {
    const inner = p.slice(1, -1);
    for (const tok of inner.split(/[;,/]|\band\b/i)) {
      const t = tok.trim().toLowerCase();
      if (t.length >= 3 && !/^\d+%?$/.test(t)) sources.add(t);
    }
  }
  return sources.size;
}

function features(doc) {
  const confs = [];
  let notesBlob = "";
  for (const cat of Object.values(doc.categories ?? {})) {
    for (const sf of Object.values(cat.sub_factors ?? {})) {
      if (typeof sf.confidence === "number") confs.push(sf.confidence);
      if (typeof sf.notes === "string") notesBlob += " " + sf.notes;
    }
  }
  const meanConfidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : 0;
  return {
    country: doc.country,
    iso3: doc.iso3,
    meanConfidence,
    sourceCount: distinctSources(notesBlob),
    notesLength: notesBlob.length,
    abs: Object.fromEntries(
      DECISIONS.map((d) => [d, Math.abs(doc.decisions?.[d]?.score ?? 0)]),
    ),
    flags: doc.flags ?? [],
  };
}

function quartileMeans(rows, key, decision) {
  const sorted = [...rows].sort((a, b) => a[key] - b[key]);
  const q = Math.max(1, Math.floor(sorted.length / 4));
  const bottom = sorted.slice(0, q);
  const top = sorted.slice(-q);
  const mean = (arr) => arr.reduce((s, r) => s + r.abs[decision], 0) / arr.length;
  return { bottomMean: mean(bottom), topMean: mean(top), q };
}

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  const rows = [];
  for (const file of files) {
    const doc = JSON.parse(await fs.readFile(path.join(dir, file), "utf8"));
    rows.push(features(doc));
  }

  const proxies = [
    ["mean confidence", "meanConfidence"],
    ["distinct sources", "sourceCount"],
    ["notes length", "notesLength"],
  ];

  console.log(`\n  Data-extremeness diagnostic - ${rows.length} countries\n`);
  console.log("  Pearson r( richness proxy , |decision score| )");
  console.log("  " + "-".repeat(58));
  console.log(
    "  " +
      "proxy".padEnd(20) +
      DECISIONS.map((d) => `|${d}|`.padStart(12)).join(""),
  );
  const flagged = [];
  for (const [label, key] of proxies) {
    const xs = rows.map((r) => r[key]);
    const line = DECISIONS.map((d) => {
      const r = pearson(xs, rows.map((row) => row.abs[d]));
      if (key === "meanConfidence" && d === "living" && Math.abs(r) > 0.5) {
        flagged.push(`corr(meanConfidence, |living|) = ${r.toFixed(2)} exceeds 0.5`);
      }
      return r.toFixed(2).padStart(12);
    }).join("");
    console.log("  " + label.padEnd(20) + line);
  }

  console.log("\n  Confidence quartiles - mean |score| (bottom 25% vs top 25%)");
  console.log("  " + "-".repeat(58));
  for (const d of DECISIONS) {
    const { bottomMean, topMean, q } = quartileMeans(rows, "meanConfidence", d);
    const delta = topMean - bottomMean;
    console.log(
      `  ${d.padEnd(10)} bottom ${bottomMean.toFixed(2)}  top ${topMean.toFixed(2)}  Δ ${
        delta >= 0 ? "+" : ""
      }${delta.toFixed(2)}  (n=${q}/quartile)`,
    );
  }

  const insufficient = rows.filter((r) =>
    r.flags.some((f) => /insufficient|data-poor|low.?confidence/i.test(String(f))),
  ).length;

  console.log("\n  Interpretation");
  console.log("  " + "-".repeat(58));
  console.log(
    "  A positive confidence↔|score| correlation is partly expected: the",
  );
  console.log(
    `  ${insufficient} data-poor states are deliberately hedged toward 0 /`,
  );
  console.log(
    "  \"insufficient confidence\", which lowers their |score|. The composite is",
  );
  console.log(
    "  a weighted AVERAGE, so it can never exceed its sub-factor extremes - any",
  );
  console.log(
    "  residual extremeness is in the AUTHORED sub-scores, not the formula.",
  );

  if (flagged.length) {
    console.log("\n  WARN:");
    for (const f of flagged) console.log("    - " + f);
    console.log(
      "    => review whether data-rich countries carry systematically larger",
    );
    console.log("       authored sub-scores (a calibration pass), not the math.");
  }
  console.log("");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
