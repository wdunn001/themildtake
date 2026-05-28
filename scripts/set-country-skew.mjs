// Sets a deliberate country-level outcome-skew on each assessment (stored in
// the file itself, self-contained). Skew = the shape of the outcome
// distribution, NOT the score level: positive = meaningful asymmetric upside
// tail; negative = locked-in/fat-tail downside; symmetric = balanced.
// build-index.mjs reads doc.skew for the comparison rankings.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "assessments");

const SKEW = {
  // asymmetric upside (recovery / nearshoring trajectories)
  UKR: "positive",
  MEX: "positive",
  // locked-in or fat-tail downside (decline, fragility, coercion, debt+demographics)
  USA: "negative",
  CHN: "negative",
  ITA: "negative",
  FRA: "negative",
  ARE: "negative",
  PAN: "negative",
  // balanced outcome distributions (stable developed/peer democracies)
  SWE: "symmetric",
  CAN: "symmetric",
  NLD: "symmetric",
  DEU: "symmetric",
  PRT: "symmetric",
  ESP: "symmetric",
  IRL: "symmetric",
  CRI: "symmetric",
  URY: "symmetric",
  GRC: "symmetric",
};

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  let n = 0;
  for (const file of files) {
    const p = path.join(dir, file);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));
    const skew = SKEW[doc.iso3];
    if (!skew) {
      console.warn(`  no skew mapped for ${doc.iso3} (${file})`);
      continue;
    }
    // Rebuild with skew placed just after assessed_on for readability.
    const { country, iso3, methodology_version, assessed_on, skew: _old, ...rest } = doc;
    const reordered = { country, iso3, methodology_version, assessed_on, skew, ...rest };
    await fs.writeFile(p, JSON.stringify(reordered, null, 2) + "\n");
    n++;
  }
  console.log(`set-country-skew: set country-level skew on ${n} assessments`);
}

main().catch((e) => { console.error(e); process.exit(1); });
