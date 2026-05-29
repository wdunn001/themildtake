// One-off recalibration for the 2026 Iran war + Strait of Hormuz crisis.
//
// Corroborated context (Reuters, BBC, NYT, Al Jazeera, CSIS, Atlantic Council,
// Wikipedia, Britannica) as of late May 2026:
//   - 28 Feb 2026: US + Israel launched an air war on Iran ("Operation Epic
//     Fury"); Iran blockaded the Strait of Hormuz (~1/5 of world oil + LNG) and
//     seized foreign tankers - the "Tanker War of 2026". The strait is still
//     largely shut under a fragile, repeatedly-violated 8 Apr conditional
//     ceasefire; peace talks ongoing.
//   - Multinational: Iran struck UAE, Kuwait, Bahrain, Saudi Arabia; Gulf states
//     mobilised / edged toward co-belligerency (Saudi opened King Fahd Air Base).
//   - Water war: desalination plants were attacked in Iran and Bahrain, and Iran
//     threatened the wider Gulf's water facilities - an existential risk for GCC
//     states that draw most drinking water from desalination.
//   - Global energy-supply shock; oil importers hit hard (China especially);
//     documented US munitions/interceptor-stockpile strain.
//
// This script rewrites only the affected sub-factor scores + notes (preserving
// each factor's weight and confidence), sets top-level skew where the tail
// changed, and appends an audit flag. Re-run compute-scores + build-index after.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dir = path.join(repoRoot, "assessments");

const FLAG =
  "Recalibrated 2026-05-29 for the 2026 Iran war (Operation Epic Fury, US+Israel vs Iran from 28 Feb) and the Strait of Hormuz closure: blockade of ~1/5 of world oil+LNG, attacks/threats on Gulf desalination (water security), and the global energy shock. The two-week 8 Apr ceasefire collapsed by late May - the US renewed strikes on Iran ~25-26 May (Trump convened Camp David) and the war resumed, with Hormuz still blockaded. (Reuters; BBC; NYT; CNN; ISW; Al Jazeera; CSIS; Wikipedia)";

// Per-country edits. Keys are "category.sub_factor". A score that is an array is
// a [near, long] split; a bare number is a single horizon. `skew` is optional.
const DATA = {
  "israel.json": {
    skew: "negative",
    f: {
      "geopolitical.conflict_involvement": {
        s: [-8, -3],
        n: "The 2026 US-Israel war on Iran (Operation Epic Fury, from 28 Feb): multi-front strikes across Iran, Hezbollah/Lebanon and Iraq, with ~35 Israeli dead and ~8,600 injured. The two-week 8 Apr ceasefire collapsed by late May (US renewed strikes ~25-26 May); the war has resumed and peace talks are in crisis. Long horizon still holds a normalisation tail if a settlement is eventually reached. (CNN; ISW; Al Jazeera)",
      },
      "geopolitical.alliance_reliability": {
        s: -1,
        n: "US co-belligerency in the 2026 Iran war confirms a deep alliance, set against intensifying ICJ/ICC action, arms-embargo moves, and international isolation. (Times of Israel; CFR)",
      },
    },
  },
  "iran.json": {
    skew: "negative",
    f: {
      "geopolitical.conflict_involvement": {
        s: [-9, -6],
        n: "Direct target of the 2026 US-Israel air war (Operation Epic Fury) from 28 Feb; thousands killed and infrastructure devastated. The two-week 8 Apr ceasefire collapsed by late May as the US renewed strikes (~25-26 May) and the war resumed. (CNN; ISW; Wikipedia)",
      },
      "geopolitical.sanctions_capital_controls": {
        s: -9,
        n: "Comprehensive sanctions plus a US naval blockade; Iran itself closed the Strait of Hormuz and seized foreign-flagged tankers - maximal external and self-imposed trade strangulation. (Al Jazeera; Reuters)",
      },
      "economic.trade_actions_capacity": {
        s: [-8, -6],
        n: "Oil exports collapsed under blockade and the self-imposed Hormuz closure; the chokepoint is leverage but devastates Iran's own export economy. (Reuters; BBC)",
      },
      "physical_practical.infrastructure": {
        s: [-7, -5],
        n: "Power, port, and water (desalination) infrastructure struck during the air war; rebuilding contingent on the war ending. (NYT; Atlantic Council)",
      },
    },
  },
  "iraq.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-8, -5],
        n: "A 2026-war theatre: US assets and Iran-aligned militias trading strikes on Iraqi soil. (Wikipedia; Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-8, -5],
        n: "Basra oil exports - the fiscal lifeline - run through the blockaded Strait of Hormuz; near-total near-term disruption, recovering only if the strait reopens. (Reuters; BBC)",
      },
      "economic.fiscal_state": {
        s: [-8, -6],
        n: "Oil-revenue-dependent budget hit hard by the Hormuz export shutdown. (IMF; Reuters)",
      },
    },
  },
  "saudi-arabia.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-7, -3],
        n: "Struck by Iranian missile/drone waves; opened King Fahd Air Base to US forces and edged toward co-belligerency in the 2026 Iran war. (WSJ; Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-5, 0],
        n: "Most crude exports transit the blockaded Strait of Hormuz; the ~5 mbd East-West (Petroline) pipeline to Yanbu gives a partial Red Sea bypass that cushions but cannot offset the shock. Recovers if the strait reopens. (Reuters; EIA)",
      },
      "economic.fiscal_state": {
        s: [-5, -3],
        n: "War spending plus the Hormuz-driven export/revenue disruption widen the deficit despite high prices. (IMF Art IV)",
      },
      "physical_practical.infrastructure": {
        s: [1, 4],
        n: "World-class build-out, but desalination supplies most drinking water and Iran has both threatened Gulf water plants and hit them before (Houthis, 2022) - an acute near-term water-security vulnerability. (CSIS; Atlantic Council)",
      },
    },
  },
  "uae.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-6, -3],
        n: "Targeted by Iranian strikes during the 2026 war; deeply exposed as a Gulf trade and finance hub. (Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-4, 2],
        n: "The Habshan-Fujairah pipeline (~1.5 mbd) lands some crude on the Gulf of Oman outside Hormuz, but most trade and re-export flows still depend on the blockaded strait. Partial bypass, large near-term hit. (Reuters; EIA)",
      },
      "economic.fiscal_state": {
        s: [3, 5],
        n: "Diversified, fund-backed finances absorb the shock better than peers, but Hormuz disruption and war risk dent the near term. (IMF)",
      },
      "physical_practical.infrastructure": {
        s: [4, 7],
        n: "Among the best infrastructure on the board, but heavy desalination dependence under direct Iranian water-infrastructure threats is an acute near-term vulnerability. (CSIS; Circle of Blue)",
      },
    },
  },
  "qatar.json": {
    skew: "negative",
    f: {
      "geopolitical.conflict_involvement": {
        s: [-6, -3],
        n: "Hosts the US Al Udeid air base; exposed to Iranian retaliation in the 2026 war. (Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-4, 4],
        n: "Qatari LNG - among the world's largest - ships almost entirely through the Strait of Hormuz with no pipeline bypass; the closure freezes the export economy near-term, recovering on reopening. (Reuters; BBC)",
      },
      "economic.fiscal_state": {
        s: [1, 6],
        n: "A massive LNG-revenue base, but the Hormuz blockade cuts the near-term cash flow that funds the budget and sovereign-fund inflows. (IMF; Reuters)",
      },
      "physical_practical.infrastructure": {
        s: [3, 7],
        n: "Top-tier infrastructure whose desalination system is, per analysts, 'huge, expertly engineered, and highly vulnerable' - and almost all drinking water depends on it. (Circle of Blue; CSIS)",
      },
    },
  },
  "kuwait.json": {
    skew: "negative",
    f: {
      "geopolitical.conflict_involvement": {
        s: [-7, -4],
        n: "Struck by Iranian fire and on the front line of the 2026 Gulf war. (Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-8, -4],
        n: "Almost all oil exports route through the blockaded Strait of Hormuz with no bypass - a near-total export-revenue stop. (Reuters; BBC)",
      },
      "economic.fiscal_state": {
        s: [-3, 3],
        n: "Huge reserves cushion solvency, but the Hormuz shutdown halts the oil revenue the budget runs on. (IMF)",
      },
      "physical_practical.infrastructure": {
        s: [0, 3],
        n: "Wholly desalination-dependent for water; Kuwait's electricity-and-water ministry publicly raised the alarm after Iran's threats to Gulf water plants. (Al Jazeera; CSIS)",
      },
    },
  },
  "bahrain.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-7, -3],
        n: "Home of the US Navy Fifth Fleet and a primary Iranian retaliation target in the 2026 war; sectarian-unrest risk amplified. (Al Jazeera)",
      },
      "economic.trade_actions_capacity": {
        s: [-4, 0],
        n: "Oil exports and refining feedstock move via the blockaded strait; a small, highly exposed economy. (Reuters)",
      },
      "physical_practical.infrastructure": {
        s: [1, 5],
        n: "A desalination plant on this water-scarce island was actually struck during the war - a direct hit to the drinking-water lifeline, not just a threat. (NYT; Guardian)",
      },
    },
  },
  "oman.json": {
    skew: "negative",
    f: {
      "geopolitical.conflict_involvement": {
        s: [-5, -3],
        n: "Controls the southern shore of the Strait of Hormuz; the traditional mediator is now ringed by the 2026 war, with shipping through its waters largely halted. (Reuters)",
      },
      "economic.trade_actions_capacity": {
        s: [-3, 2],
        n: "Oil exports and the Sohar/transit economy depend on Hormuz traffic that has nearly stopped. (Reuters; EIA)",
      },
      "economic.fiscal_state": {
        s: [1, 5],
        n: "Oil-revenue budget squeezed by the export disruption. (IMF)",
      },
      "physical_practical.infrastructure": {
        s: [2, 4],
        n: "Desalination-reliant and exposed to the regional water-infrastructure threat, though less central a target than the inner-Gulf states. (CSIS)",
      },
    },
  },
  "united-states.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-7, -5],
        n: "Lead belligerent in the 2026 Iran war (Operation Epic Fury) and enforcing a Gulf naval blockade; documented munitions/interceptor-stockpile strain and an open-ended regional commitment. (Wikipedia; Reuters)",
      },
    },
  },
  "china.json": {
    f: {
      "economic.inflation": {
        s: [-6, -4],
        n: "Imported energy-price shock from the Hormuz closure - China is the largest buyer of Gulf and Iranian crude through the strait - feeds input-cost inflation and a growth drag. (Reuters; BBC)",
      },
      "economic.trade_actions_capacity": {
        s: [2, 1],
        n: "Critical crude-supply disruption (roughly half of China's oil transits Hormuz, and it is Iran's main customer) hits the export-manufacturing base near-term. (Reuters)",
      },
    },
  },
  "india.json": {
    f: {
      "economic.inflation": {
        s: [0, 2],
        n: "Energy-import-price shock from the 2026 Hormuz closure (a large share of India's crude and LNG transits the strait) lifts near-term inflation. (Reuters; BBC)",
      },
    },
  },
  "japan.json": {
    f: {
      "economic.inflation": {
        s: [0, 3],
        n: "Near-total reliance on seaborne energy makes Japan acutely exposed to the 2026 Hormuz oil/LNG shock. (Reuters)",
      },
    },
  },
  "south-korea.json": {
    f: {
      "economic.inflation": {
        s: [-1, 3],
        n: "Heavy crude/LNG import dependence via Hormuz drives a near-term energy-price/inflation shock. (Reuters)",
      },
    },
  },
  // Reviewed regional spillover - note updates, scores already at/near floor or
  // net-ambiguous, plus the audit flag.
  "lebanon.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: -9,
        n: "Hezbollah is a belligerent in the 2026 Iran war; Israeli strikes on the south have continued through the ceasefire. (Al Jazeera)",
      },
    },
  },
  "yemen.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-10, -7],
        n: "Houthi forces attacked Gulf and Red Sea shipping and Saudi targets as part of the 2026 war, on top of the existing civil war. (Al Jazeera; Atlantic Council)",
      },
    },
  },
  "syria.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: [-8, -5],
        n: "Iranian-linked sites and supply lines were struck on Syrian territory during the 2026 war, compounding the post-civil-war fragility. (Wikipedia)",
      },
    },
  },
  "jordan.json": {
    f: {
      "geopolitical.conflict_involvement": {
        s: -5,
        n: "Caught under the missile/drone overflight corridor of the 2026 war, with airspace closures and economic and refugee strain. (Al Jazeera)",
      },
    },
  },
  "egypt.json": {
    f: {
      "economic.trade_actions_capacity": {
        s: [-5, -2],
        n: "The 2026 war and Red Sea/Bab-el-Mandeb shipping disruption cut Suez Canal transits and the hard-currency revenue they bring. (Reuters)",
      },
    },
  },
  "turkey.json": {
    f: {
      "economic.inflation": {
        s: [-5, -1],
        n: "An energy importer already fighting high inflation, Turkey is further squeezed by the 2026 Hormuz energy-price shock. (Reuters)",
      },
    },
  },
};

function setSF(sf, spec) {
  if (Array.isArray(spec.s)) {
    sf.score = null;
    sf.score_near = spec.s[0];
    sf.score_long = spec.s[1];
  } else {
    sf.score = spec.s;
    delete sf.score_near;
    delete sf.score_long;
  }
  if (spec.n) sf.notes = spec.n;
}

async function main() {
  let changed = 0;
  for (const [file, spec] of Object.entries(DATA)) {
    const p = path.join(dir, file);
    const doc = JSON.parse(await fs.readFile(p, "utf8"));
    if (spec.skew) doc.skew = spec.skew;
    for (const [key, edit] of Object.entries(spec.f ?? {})) {
      const [cat, sub] = key.split(".");
      const sf = doc.categories?.[cat]?.sub_factors?.[sub];
      if (!sf) throw new Error(`${file}: missing ${key}`);
      setSF(sf, edit);
    }
    // Replace any prior recalibration flag with the current one (so re-runs
    // refresh the ceasefire/status text rather than stacking duplicates).
    doc.flags = (doc.flags ?? []).filter((f) => !/2026 Iran war/.test(String(f)));
    doc.flags.push(FLAG);
    await fs.writeFile(p, JSON.stringify(doc, null, 2) + "\n");
    changed++;
    console.log(`  ${file}${spec.skew ? `  [skew -> ${spec.skew}]` : ""}`);
  }
  console.log(`[hormuz-2026] updated ${changed} assessments.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
