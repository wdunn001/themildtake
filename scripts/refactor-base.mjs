// Refactor to a GENERAL base (2026-05-28):
//  1. Remove the `personal_fit` category (reader-specific) from every country
//     and from the decision weights; rebalance `living` (only it used it).
//  2. Generalize `subject_profile` so the base data isn't tied to one person.
//  3. Make each country file SELF-CONTAINED: rewrite summaries and scrub the
//     comparative ("better than the US", "mirror image of Canada", "bottom of
//     the set"...) phrasing from notes. All cross-country comparison lives in
//     _comparison-index.json, never in a single country's JSON.
// Run compute-scores.mjs + build-index.mjs afterward.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "assessments");

// living was the only decision weighting personal_fit (0.15); redistribute it
// across the lived-experience categories. assets/currency had personal_fit: 0.
const LIVING_WEIGHTS = { economic: 0.15, institutional: 0.35, political_social: 0.3, geopolitical: 0.05, physical_practical: 0.15 };

const SUBJECT_PROFILE = {
  summary:
    "Base country-level assessment; default category weights prioritize rule of law, institutional integrity, and personal freedom.",
  stated_values: [
    "Rule of law and institutional integrity weighted most heavily",
    "Personal freedom and security from arbitrary state action are foundational",
    "Economic success is contingent on rule of law, not a substitute for it",
  ],
};

const SUMMARIES = {
  "united-states":
    "Institutional erosion from a high baseline - pressure on the courts, documented statistical-agency interference, civil-service politicization - combined with reserve-currency erosion, alliance decay, and harsh treatment of non-citizens drive a strongly negative living read. Post-2022 official data is discounted as partially-entangled (confidence on inflation and fiscal lowered), and trade is scored on the hostility its volatile tariff actions create rather than on tariff levels alone, which pushes the economic read worse. The reserve-currency privilege is a large near-term cushion that erodes over the long term as the institutions it shielded are exposed.",
  china:
    "Scores at the bottom on institutional quality and civil liberties - no independent judiciary, comprehensive censorship and surveillance, structurally closed to immigration - against a largely locked-in demographic collapse. Under the hard exclusion rule, CCP self-reported economics are excluded and rebuilt from independent proxies (lowering confidence); the genuine, externally verifiable strength is manufacturing dominance, now weighted 0.17 and confirmed through partner customs data, which keeps the economic score from collapsing even as structural deflation and decoupling weigh on the long term. The outcome distribution carries negative skew - locked-in demographics and intensifying authoritarianism, with no positive-skew pathway.",
  mexico:
    "A genuine nearshoring tailwind and a favourable demographic profile sit against serious institutional deterioration (the 2024 elected-judiciary reform) and acute cartel violence. The economic picture carries positive skew: record FDI and a diversification trajectory credited as durable upside. The headline homicide decline is real but partly a disappearances/erasure artifact, so confidence in the improvement is held moderate. Welcoming to foreign professionals on paper, though local sentiment toward newcomers has cooled.",
  sweden:
    "An exceptionally strong institutional baseline - top-tier rule of law, statistical integrity, civil-service independence, and press freedom - paired with a strong, low-debt economy. The drags are a near-neutral social state (gang and bombing violence concentrated in specific metro suburbs, plus immigration restrictiveness, though the skilled-professional path stays functional) and direct Russia conflict-exposure as a Baltic-adjacent NATO member - a real tail risk rather than a base case. Inflation is currently undershooting target.",
  ukraine:
    "A high-variance, positive-skew case. Near-term factors are dominated by an active war - catastrophic on conflict, fiscal, infrastructure, and demographics - but the long-horizon trajectory points up: a war that must eventually end, an EU-accession path now unblocking, large reconstruction demand, rich agricultural and mineral export capacity, and monetary institutions that have held up under wartime stress. Assets are genuine high-risk/high-return and the hryvnia's downside is limited short of losing the war. The catastrophic individual tail risks (conscription, mortality, displacement) deserve weight beyond their probability.",
  canada:
    "Strong institutions across the board - independent courts, a respected statistical agency, high press freedom - a positive political/social state, and a sound fiscal position with the lowest debt burden in the G7. The main weaknesses are involuntary exposure to volatile US tariff actions and a degraded alliance position from being directly targeted, now partly offset by a concrete pivot to EU/Nordic frameworks. Resource wealth paired with strong institutions is a managed asset, not a curse.",
};

// category-note replacements that scrub cross-country comparisons
const NOTE_FIXES = {
  canada: {
    economic:
      "A sound starting fiscal position (lowest debt burden in the G7); strong central-bank and banking institutions; the main drag is involuntary exposure to volatile US tariff actions, now weighted more heavily.",
    political_social:
      "Low polarization by international standards; immigration less welcoming than five years ago but orderly and within the rule of law.",
    physical_practical:
      "Universal healthcare with access problems but strong aggregate outcomes; very low violent crime.",
  },
  mexico: {
    institutional:
      "Major deterioration under the 2024 judicial reforms (popularly elected judges). Long-term composite worsens as the effects compound.",
  },
  sweden: {
    institutional: "A genuinely excellent institutional baseline; the highest-confidence category in this assessment.",
  },
  ukraine: {
    geopolitical:
      "Maximum conflict exposure near-term (active war); post-war could be a NATO-aligned, EU-integrated, security-guaranteed state.",
  },
};

// sub-factor note replacements
const SUBNOTE_FIXES = {
  canada: {
    physical_practical: {
      healthcare: "Universal single-payer; primary-care shortages and wait times; strong outcomes at moderate cost.",
    },
  },
};

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  for (const file of files) {
    const key = file.replace(/\.json$/, "");
    const p = path.join(dir, file);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));

    // 1. remove personal_fit category + weights; rebalance living
    delete doc.categories.personal_fit;
    for (const d of Object.keys(doc.category_weights_by_decision)) {
      delete doc.category_weights_by_decision[d].personal_fit;
    }
    doc.category_weights_by_decision.living = { ...LIVING_WEIGHTS };

    // 2. generalize subject profile
    doc.subject_profile = { ...SUBJECT_PROFILE };

    // 3. self-contained prose
    if (SUMMARIES[key]) doc.summary = SUMMARIES[key];
    for (const [cat, note] of Object.entries(NOTE_FIXES[key] ?? {})) {
      if (doc.categories[cat]) doc.categories[cat].notes = note;
    }
    for (const [cat, subs] of Object.entries(SUBNOTE_FIXES[key] ?? {})) {
      for (const [sk, note] of Object.entries(subs)) {
        const sf = doc.categories[cat]?.sub_factors?.[sk];
        if (sf) sf.notes = note;
      }
    }

    await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
  }
  console.log(`refactor-base: removed personal_fit, generalized profile, de-relativized prose for ${files.length} countries`);
}

main().catch((e) => { console.error(e); process.exit(1); });
