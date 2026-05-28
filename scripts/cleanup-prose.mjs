// Prose cleanup (2026-05-28):
//  - Trim every subject_profile.summary to a short base line (drop the
//    repeated "personal fit ... deferred to a future per-reader tool"
//    boilerplate; that explanation lives once in methodology.md).
//  - Remove remaining SET-RELATIVE language so each country file stays
//    self-contained (no "worst of any country", "at the bottom", "strongest
//    ... assessed", etc.) and won't go stale as the set grows.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "assessments");

const SHORT_SUMMARY =
  "Base country-level assessment; default category weights prioritize rule of law, institutional integrity, and personal freedom.";

const FIXES = {
  china: {
    summary:
      "Very weak on institutional quality and civil liberties - no independent judiciary, comprehensive censorship and surveillance, structurally closed to immigration - against a largely locked-in demographic collapse. Under the hard exclusion rule, CCP self-reported economics are excluded and rebuilt from independent proxies (lowering confidence); the genuine, externally verifiable strength is manufacturing dominance, now weighted 0.17 and confirmed through partner customs data, which keeps the economic score from collapsing even as structural deflation and decoupling weigh on the long term. The outcome distribution carries negative skew - locked-in demographics and intensifying authoritarianism, with no positive-skew pathway.",
    categoryNotes: {
      institutional:
        "Very weak institutions on the factors weighted most heavily here: no independent judiciary (rule by law, not rule of law), comprehensive censorship, and official statistics unusable for scoring. Built almost entirely from independent sources (V-Dem, WJP, RSF), so confidence is real.",
    },
  },
  sweden: {
    categoryNotes: {
      economic:
        "A strong economic profile: very low debt, a disciplined fiscal framework, an independent Riksbank, and a low-oil-exposure energy mix. Trade is a small negative now carrying more weight.",
    },
  },
  "united-states": {
    subNotes: {
      economic: {
        trade_actions_capacity:
          "Scored on ACTIONS, not just tariff levels: a volatile, unpredictable tariff regime manufactures hostile foreign-trade relationships and pushes long-standing trading partners to diversify away from US supply and demand - a structural long-term cost on top of the near-term shock. Industrial capacity is middling and slow to reshore. Not resource-cursed, but the self-inflicted policy volatility is the trade story.",
      },
    },
  },
};

async function main() {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  for (const file of files) {
    const key = file.replace(/\.json$/, "");
    const p = path.join(dir, file);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));

    if (doc.subject_profile) doc.subject_profile.summary = SHORT_SUMMARY;

    const fix = FIXES[key];
    if (fix) {
      if (fix.summary) doc.summary = fix.summary;
      for (const [cat, note] of Object.entries(fix.categoryNotes ?? {})) {
        if (doc.categories[cat]) doc.categories[cat].notes = note;
      }
      for (const [cat, subs] of Object.entries(fix.subNotes ?? {})) {
        for (const [sk, note] of Object.entries(subs)) {
          const sf = doc.categories[cat]?.sub_factors?.[sk];
          if (sf) sf.notes = note;
        }
      }
    }

    await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
  }
  console.log(`cleanup-prose: trimmed subject_profile + fixed set-relative prose across ${files.length} files`);
}

main().catch((e) => { console.error(e); process.exit(1); });
