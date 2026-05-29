// CLI wrapper: rewrite each assessment's category/decision aggregates in place
// using the shared scoring engine (src/lib/scoreEngine.mjs - the same module the
// browser personalization layer imports, so build-time and in-browser numbers
// cannot drift). Sub-factor scores/weights/notes are authoritative and never
// modified here; only the aggregates are written back.
//
// Usage:
//   node scripts/compute-scores.mjs            # rewrite aggregates in place
//   node scripts/compute-scores.mjs --check    # print, do not write

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { recompute } from "../src/lib/scoreEngine.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");
const CHECK = process.argv.includes("--check");

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
