// Second-pass (bias-corrected, non-Anglophone) refinements, 2026-05-28.
// The diverse-source re-read largely CONFIRMED v2.0; this applies the few
// supported deltas + standardized provenance flags, and normalizes any
// freelance note edits from the research agents. Run compute-scores.mjs and
// build-index.mjs afterward.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "assessments");

const patches = {
  "united-states": {
    flag: "2nd pass (2026-05-28, bias-corrected): non-US read (Al Jazeera/Doha, IMF, Eurostat, Nikkei) confirms the direction. Iran ceasefire is fragile ('on life support'); SCOTUS struck the IEEPA tariffs - a real institutional check - though a Section 122 surcharge was re-imposed; IMF COFER shows dollar erosion is real but slow. Net confirmed.",
    sub: {
      geopolitical: {
        conflict_involvement: { score: -5, notes: "Non-US sources (Al Jazeera) read the US-Iran ceasefire as more fragile than US framing - 'on life support,' both sides issuing conflicting reports (late May 2026). De-escalated from active war but unstable; held at -5 with downside risk. Taiwan tension and partner-directed rhetoric persist." },
      },
    },
  },

  china: {
    flag: "2nd pass (2026-05-28, bias-corrected): partner customs (EU/Eurostat, Japan, Korea), diaspora Mandarin (Initium 端傳媒), and Rhodium confirm. Manufacturing strength is real but increasingly a DEPENDENCY (2025 surplus ~57-68% of all growth; ASEAN transshipment escape-valve closing); deflation now 10+ quarters. Trade long and inflation nudged worse; net confirmed, not overturned.",
    sub: {
      economic: {
        trade_actions_capacity: { score_long: 1, confidence: 0.72, notes: "Partner customs confirm dominance (exports +21.8% YoY Jan-Feb 2026; EU +27.8%, ASEAN +29.4%, Korea +27%, but US -11%). Near +5 holds. Long softened to +1: the ASEAN transshipment escape-valve is closing (Vietnam's 40% transshipment tariff + rules-of-origin) and the surplus is now ~57-68% of all growth (Rhodium) - dominance as dependency, not cushion." },
        inflation: { score: -4, notes: "Deflation, not inflation - and now structural: 10+ straight quarters, GDP deflator negative into 2026 (IMF diagnostics, Initium 端傳媒, Rhodium). Worse than the earlier -3; official CPI excluded, signal from independent producer/earnings data. Raises real debt burden." },
      },
    },
  },

  ukraine: {
    flag: "2nd pass (2026-05-28, bias-corrected): Russian-EXILE (Meduza/Riga), European, IMF, and OSINT (ISW/DeepState) confirm the war is ACTIVE and talks failed (only POW swaps, no settlement). The exile read frames it as deadlocked, not momentum. EU accession is ONE cluster (Fundamentals) opening ~June 16, not a full unblock - rule_of_law near nudged to -1.",
    sub: {
      institutional: {
        rule_of_law: { score_near: -1, notes: "EU-accession step is concrete but modest: Commission proposes opening only Cluster 1 ('Fundamentals') ~June 16 2026 (new Hungarian PM Magyar negotiated a single-cluster opening, not a full unblock). Near nudged -2 -> -1; long +2 holds. Anti-corruption reforms continue under martial law." },
      },
    },
  },

  mexico: {
    flag: "2nd pass (2026-05-28, bias-corrected): Mexican independents (Animal Político, México Evalúa, Expansión) + IEP/Uppsala confirm the direction but FLAG the headline homicide drop as partly a disappearances/body-erasure artifact (integrated lethal violence ~-22%, not -44%); the 2027 judicial election was postponed to June 2028. Scores held; confidence in the violence improvement read down.",
    sub: {
      political_social: {
        social_violence: { score_near: -6, score_long: -7, confidence: 0.75, notes: "IEP Mexico Peace Index confirms improvement (peace +5.1%, best since 2007), BUT Mexican independents (México Evalúa, Animal Político) show the ~44% headline is partly artifact - disappearances up ~35% since 2018 (>133k registry); integrated lethal violence falls only ~22%. Fear rose (75.6% feel unsafe, ENVIPE); Sinaloa homicides +70% from CJNG fragmentation. Held near -6/long -7; confidence trimmed to 0.75." },
      },
      institutional: {
        rule_of_law: { notes: "2026 is the first full year of an elected judiciary; on 27-28 May 2026 Morena postponed the 2027 judicial election to June 2028 - a procedural reshuffle, not a reversal. Sharp drop in judge experience; new Judicial Discipline Tribunal can remove judges (Aristegui, La Jornada, CIDH; cross-checked beyond US think tanks). Held near -6/long -7." },
      },
    },
  },

  sweden: {
    flag: "2nd pass (2026-05-28, bias-corrected): Swedish primary sources (Polisen, BRÅ, SCB, SVT) confirm - shootings down hard, bombings the new vector, geographically concentrated; the country-average overstates personal risk outside affected suburbs. Inflation undershooting (~0.8% CPIF). No score change.",
    sub: {
      political_social: {
        social_violence: { notes: "Swedish primary data (Polisen, BRÅ): shootings down hard (Q1 2026: 15 vs 39 in Q1 2025; 2025 homicides decade-low) but bombings are the new vector (189 detonations in 2025, +39%); concentrated in metro suburbs. The Anglophone 'Sweden = war zone' framing overstates risk for ordinary residents. Near -3/long -2 held." },
      },
    },
  },

  canada: {
    flag: "2nd pass (2026-05-28, bias-corrected): Canadian + Francophone (Le Devoir, Radio-Canada) + IMF/OECD confirm and soften the catastrophist US framing (contained tariffs, real EU/SAFE realignment, improving deficit). Note: the budget survived confidence only 170-168, so the governing majority is thin. No score change.",
    sub: {
      political_social: {
        political_stability: { notes: "Carney Liberal minority; functional and peaceful transfers the norm, BUT the spring budget survived a confidence vote only 170-168 (NDP/Green abstentions) - the majority is thin. Held at +3; the thinness is a watch item, not yet instability (CBC, Radio-Canada)." },
      },
    },
  },
};

async function main() {
  let changed = 0;
  for (const [file, patch] of Object.entries(patches)) {
    const p = path.join(dir, `${file}.json`);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));
    // Dedupe any prior 2nd-pass / agent flags, then add the standardized one.
    doc.flags = doc.flags.filter(
      (f) => !f.startsWith("2nd pass (2026-05-28") && !f.startsWith("Bias-corrected 2nd"),
    );
    if (patch.flag) doc.flags.unshift(patch.flag);
    for (const [cat, subs] of Object.entries(patch.sub ?? {})) {
      for (const [subKey, fields] of Object.entries(subs)) {
        const sf = doc.categories[cat]?.sub_factors?.[subKey];
        if (!sf) { console.warn(`  MISSING ${file} ${cat}.${subKey}`); continue; }
        for (const [k, v] of Object.entries(fields)) sf[k] = v;
        changed++;
      }
    }
    await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
  }
  console.log(`apply-livedata-2: patched ${changed} sub-factors across ${Object.keys(patches).length} countries`);
}

main().catch((e) => { console.error(e); process.exit(1); });
