import type { ComparisonIndex, DecisionKey, Skew } from "../../lib/types";
import { DECISION_ORDER } from "../../lib/scores";

export interface GridCell {
  score: number;
  confidence: number;
  skew?: Skew;
  rank: number;
}

export interface GridRow {
  country: string;
  iso3: string;
  cells: Partial<Record<DecisionKey, GridCell>>;
}

/** Pivot the per-decision rankings into one row per country (columns = decisions). */
export function pivotIndex(index: ComparisonIndex): GridRow[] {
  const byCountry = new Map<string, GridRow>();
  for (const dk of DECISION_ORDER) {
    const decision = index.decisions[dk];
    if (!decision) continue;
    for (const row of decision.ranking) {
      let entry = byCountry.get(row.iso3);
      if (!entry) {
        entry = { country: row.country, iso3: row.iso3, cells: {} };
        byCountry.set(row.iso3, entry);
      }
      entry.cells[dk] = {
        score: row.score,
        confidence: row.confidence,
        skew: row.skew,
        rank: row.rank,
      };
    }
  }
  return [...byCountry.values()];
}
