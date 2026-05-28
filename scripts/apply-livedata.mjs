// Applies the 2026-05-28 live-data validation pass to the assessments.
// Each patch sets specific sub-factor fields (score / score_near / score_long /
// confidence / notes) by category+key, and prepends a provenance flag. Run
// compute-scores.mjs and build-index.mjs afterward to refresh aggregates.
//
// Findings were triangulated across multilateral bodies (IMF, OECD, UN, BIS,
// IMF COFER) and a deliberately diverse, non-US press set; see each note.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(here, "..", "assessments");

const FLAG =
  "Live-data refresh (2026-05-28): factors re-validated against diverse, independent sources (multilateral bodies + non-US/non-Anglophone press; state-self-reported data still excluded). Notes mark what moved.";

const patches = {
  "united-states": {
    flag: FLAG,
    sub: {
      economic: {
        fiscal_state: { confidence: 0.8, notes: "IMF Article IV (Apr 2026, fully independent): deficit ~7-7.5% GDP, debt >140% by 2031, flagged a global tail risk. Two 2026 shutdowns; debt-ceiling pressure live. Confidence raised - independent/multilateral corroboration now anchors this, not entangled official data." },
        monetary_fed_independence: { score_long: -5, confidence: 0.65, notes: "Apr 2026 FOMC held rates (4 dissents); Warsh in as chair but seen as weak; SCOTUS signaled it will likely BLOCK the Cook removal (rule-of-law positive). Independence stressed but courts are protecting governors - long-term nudged up." },
        reserve_currency_intl_monetary: { score_long: -3, confidence: 0.75, notes: "USD reserve share 56.9% (Q3 2025, IMF COFER) - a 31-yr low; central banks net-sold USD and gold now exceeds Treasuries as primary reserve asset. Near-term privilege intact (+5) but long-term erosion accelerating - long nudged to -3." },
        inflation: { confidence: 0.65, notes: "April 2026 CPI +3.8% y/y (highest since 2023), independently corroborated (PIIE, Cleveland Fed); ~40% of the gain from the Iran oil shock, tariffs adding ~0.8% to core PCE. Direction now confirmed by independent estimates, not the entangled CPI alone." },
      },
      geopolitical: {
        conflict_involvement: { score: -5, confidence: 0.8, notes: "US-Iran ceasefire reached ~Apr 8 2026 (Pakistan-mediated), extended but fragile with sporadic strikes (Al Jazeera, NPR; non-US balance). De-escalated from active war - a move up with positive skew. Taiwan tension and partner-directed rhetoric persist." },
      },
      political_social: {
        treatment_non_citizens: { confidence: 0.88, notes: "ICE detention peaked ~70.8k (Jan); ~540k deported; ~70% of detainees without convictions; $100k H-1B fee; SCOTUS barred court review of visa revocations; birthright EO still blocked, ruling due ~late June. Edging worse; well-documented (TRAC, American Immigration Council)." },
      },
    },
  },

  china: {
    flag: FLAG,
    sub: {
      economic: {
        trade_actions_capacity: { score_long: 2, confidence: 0.72, notes: "Externally verified via partner customs: 'new three' (solar/battery/EV) exports +53% YoY early 2026, China ~74% of battery exports, >90% graphite processing (EIA). BUT US imports from China fell ~13%->10% share; sharper friend-shoring/transshipment to ASEAN/Mexico/India (ECB, S&P, CaixaBank). Near-term dominance reaffirmed (+5); long softened to +2 as decoupling bites." },
      },
      political_social: {
        demographics: { score_long: -9, confidence: 0.85, notes: "2025 births only ~7.92M (record low); population fell ~3.4M in 2025 (vs 1.4M in 2024) - decline more than doubled; fertility ~1.0; ~60M decline 2026-2035 (independent demographers Yi Fuxian, UNC). Worse and faster than assumed - long to -9." },
      },
      geopolitical: {
        conflict_involvement: { score_near: -2, notes: "Visible Taiwan pressure eased: ~169 ADIZ incursions Apr 2026 / 121 Mar - post-2024 monthly lows vs prior ~300+/month; sustained CCG coercion near Kinmen continues. Read as recalibration, not policy change - near nudged to -2; long-term Taiwan/SCS/India risk unchanged at -4." },
      },
    },
  },

  ukraine: {
    flag: FLAG,
    sub: {
      economic: {
        fiscal_state: { confidence: 0.8, notes: "IMF EFF approved Feb 2026 ($8.1B, part of a $136.5B 4-yr package); 2026 financing gap ~$52B filled via ERA/EU/G7/WB; 2026-27 residual ~$63B. Program now formalized (was pending) - confidence raised, score unchanged (catastrophic but financed)." },
      },
      institutional: {
        rule_of_law: { score_near: -2, score_long: 2, confidence: 0.65, notes: "EU-accession veto logjam breaking: Orban ousted (March 2026 Hungarian election); Commission to open Cluster 1 on June 16, more clusters in July. Anti-corruption reforms continue under martial law. Near improved to -2, long to +2 - the reform trajectory is now concrete action." },
      },
      geopolitical: {
        conflict_involvement: { confidence: 0.8, notes: "War STILL ACTIVE as of May 2026: front largely static (ISW/OSINT), localized Russian pushes near Pokrovsk, no breakthrough. Heavy Trump-brokered diplomacy (May truce, Istanbul talks) produced only POW swaps - no settlement; Russia 'has not budged.' Hold near -10; confidence up on OSINT corroboration." },
      },
      physical_practical: {
        infrastructure: { confidence: 0.8, notes: "Winter 2025-26 grid damage severe (waves of 300+ drones/30+ missiles; thermal & hydro bombed out, surviving on nuclear; rolling 3-4hr blackouts). ~$588B reconstruction need; long-term rebuild upside. Worse-confirmed; confidence up (UN, ISW)." },
      },
    },
  },

  mexico: {
    flag: FLAG,
    sub: {
      economic: {
        trade_actions_capacity: { confidence: 0.75, notes: "Nearshoring confirmed record-setting: Q1 2026 FDI ~$23.59B, +10.4% YoY (Expansion/IMCO, Mexican independent); electronics +58.7% (AI datacenters), autos +20.4%. Durability hinges on the July USMCA review; some inflow is Chinese firms (Section 301 probe). Near -3 hold, long +3 confirmed; confidence up." },
        monetary_independence: { confidence: 0.78, notes: "Banxico cut to 6.50% (May 7, split vote) - autonomy intact (IMF, OECD, BBVA); inflation ~4.1% easing. Confidence up." },
      },
      institutional: {
        rule_of_law: { confidence: 0.78, notes: "2026 is the first full year of an elected judiciary; sharp drop in judge experience; new Judicial Discipline Tribunal can remove judges (CSIS, Wilson Center, UN Rapporteur). 2027 elects the remaining ~4,000. Confirmed; confidence up." },
      },
      political_social: {
        social_violence: { score_near: -6, score_long: -7, confidence: 0.8, notes: "MATERIALLY BETTER than the pre-audit '-8/-8 with 2026 unrest': homicides falling sharply (-44% Sep 2024 -> Feb 2026; Feb 2026 the lowest in a decade, cross-checked vs IEP Mexico Peace Index & Uppsala UCDP). El Mencho killed Feb 2026 triggered acute unrest, but the trend is down. Tail risk if CJNG fragments. Near -6, long -7." },
        demographics: { score_long: 2, notes: "Median age ~30; ~67% working-age; a genuine dividend, but CONAPO flags ~2030 as the turning point (over-60s overtake under-15s). Long credited at +2 (was +3) given the closing window." },
        treatment_non_citizens: { score: 2, confidence: 0.7, notes: "Visa rules unchanged (still net-welcoming to professionals/expats), but 2026 anti-gentrification protests in CDMX ('gringos go home') and rent-regulation plans turned sentiment, not policy. Nudged +3 -> +2." },
      },
    },
  },

  sweden: {
    flag: FLAG,
    sub: {
      economic: {
        inflation: { confidence: 0.72, notes: "Riksbank held at 1.75% (5th hold); CPIF 0.8% April 2026 (from 1.6%), headline -0.1% - UNDERSHOOTING the ~1.5% modeled, partly a food-VAT cut. Mild deflation watch for a strong, low-debt economy; score held +4, confidence eased." },
      },
      political_social: {
        social_violence: { score_near: -3, confidence: 0.8, notes: "Shootings down hard (Q1 2026: 15 vs 39 in Q1 2025; 2025 homicides decade-low), but bombings are the new vector (189 detonations in 2025, +39%). Concentrated in metro suburbs. Net near-term improvement -> near -3; long -2 hold (Polisen, BRA, SVT - Swedish independent)." },
        treatment_non_citizens: { confidence: 0.75, notes: "From 1 June 2026 the work-permit salary floor rises to 90% of median; family reunification stricter - but the reform explicitly protects highly-skilled workers, so a veterinarian/researcher clears it easily. Score -1 hold; confidence up (Migrationsverket)." },
      },
      geopolitical: {
        conflict_involvement: { confidence: 0.75, notes: "Hybrid-threat tempo up: GNSS jamming surged (733 incidents YTD), UAV/undersea-cable incidents, explicit Baltic-island-grab warnings; defense at 2.8% GDP, Gotland remilitarized, conscription scaled up. Tail risk real, not base case; near -4/long -3 hold, confidence up (CEPA, Atlantic Council, gov.se)." },
      },
    },
  },

  canada: {
    flag: FLAG,
    sub: {
      economic: {
        trade_actions_capacity: { score_near: -4, confidence: 0.82, notes: "Feb 2026 US Supreme Court struck down the IEEPA tariffs; the US replaced them with a 10% Section 122 surcharge (USMCA-exempt) + retained auto/steel/aluminum tariffs - less hostile than the early-2026 peak but persistent, and Canada was left out of the first USMCA review round (leverage warning). Diversification now concrete (EU CETA, ASEAN). Near -5 -> -4; long -2 hold." },
      },
      geopolitical: {
        alliance_reliability: { score: -2, confidence: 0.78, notes: "Five Eyes expulsion stayed RHETORIC, not action (Canada took part in the Nov 2025 Five Eyes summit); annexation rhetoric persists. Real action is the counter-pivot: Canada joined the EU SAFE EUR150B program (first non-European member) and deepened EU defence ties. Scored on actions -> -3 to -2." },
      },
      political_social: {
        treatment_non_citizens: { confidence: 0.78, notes: "2026-28 plan holds PR steady at 380k/yr (not cut further); temporary residents cut hard (-45%), student visas down; all via published plan, due process, no mass deportation. +2 confirmed; confidence up (IRCC)." },
      },
    },
  },
};

function applyField(sf, key, val) {
  sf[key] = val;
}

async function main() {
  let changed = 0;
  for (const [file, patch] of Object.entries(patches)) {
    const p = path.join(dir, `${file}.json`);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));
    if (patch.flag && !doc.flags.includes(patch.flag)) doc.flags.unshift(patch.flag);
    for (const [cat, subs] of Object.entries(patch.sub)) {
      for (const [subKey, fields] of Object.entries(subs)) {
        const sf = doc.categories[cat]?.sub_factors?.[subKey];
        if (!sf) {
          console.warn(`  MISSING ${file} ${cat}.${subKey}`);
          continue;
        }
        for (const [k, v] of Object.entries(fields)) applyField(sf, k, v);
        changed++;
      }
    }
    await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
  }
  console.log(`apply-livedata: patched ${changed} sub-factors across ${Object.keys(patches).length} countries`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
