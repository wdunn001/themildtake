// Aggregation of per-member congressional integrity scores into chamber- and
// body-level "representativeness" signals.
//
// Premise (per project intent): if you score every member on integrity —
// conflicts of interest, PAC capture, stock trading, lobbying ties — then
// aggregating those scores says something about whether the body as a whole
// works for its constituents or for private interests.
//
// Data note: integrityindex.us (the intended source) exposes no public API or
// bulk dataset, so population is manual or via a separate ingestion from the
// underlying public sources (FEC, STOCK Act, OpenSecrets, Quiver). The shipped
// dataset is a clearly-labeled SAMPLE; aggregation logic is real.

export type Chamber = "house" | "senate";

export interface Member {
  name: string;
  chamber: Chamber;
  state?: string;
  district?: number;
  party?: string;
  /** Integrity score on scale.min..scale.max (higher = fewer conflicts). */
  score: number;
}

export interface GradeBand {
  grade: string;
  min: number;
}

export interface CongressData {
  source: string;
  source_note?: string;
  is_sample?: boolean;
  updated: string;
  scale: { min: number; max: number; note?: string; bands: GradeBand[] };
  /** body-mean cutoffs for the representativeness verdict. */
  thresholds: { representative: number; captured: number };
  members: Member[];
}

export interface Aggregate {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
}

export function aggregate(members: Member[]): Aggregate {
  if (members.length === 0) return { count: 0, mean: 0, median: 0, min: 0, max: 0 };
  const scores = members.map((m) => m.score).sort((a, b) => a - b);
  const sum = scores.reduce((a, b) => a + b, 0);
  const mid = Math.floor(scores.length / 2);
  const median = scores.length % 2 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
  return {
    count: scores.length,
    mean: sum / scores.length,
    median,
    min: scores[0],
    max: scores[scores.length - 1],
  };
}

export function gradeFor(score: number, bands: GradeBand[]): string {
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  for (const b of sorted) if (score >= b.min) return b.grade;
  return sorted[sorted.length - 1]?.grade ?? "?";
}

export type VerdictKey = "representative" | "mixed" | "captured";

export interface Verdict {
  key: VerdictKey;
  label: string;
  blurb: string;
}

export function verdictFor(mean: number, thresholds: { representative: number; captured: number }): Verdict {
  if (mean >= thresholds.representative) {
    return {
      key: "representative",
      label: "Broadly representative",
      blurb: "Aggregate integrity sits above the representative threshold — most members score clean of major capture signals.",
    };
  }
  if (mean <= thresholds.captured) {
    return {
      key: "captured",
      label: "Captured by private interests",
      blurb: "Aggregate integrity sits at or below the capture threshold — conflicts of interest dominate the body as a whole.",
    };
  }
  return {
    key: "mixed",
    label: "Mixed / partially captured",
    blurb: "Aggregate integrity falls between the thresholds — a meaningful share of members carry capture signals, but not the whole body.",
  };
}

/** Count of members in each grade band, ordered high grade -> low. */
export function distribution(members: Member[], bands: GradeBand[]): { grade: string; count: number }[] {
  const order = [...bands].sort((a, b) => b.min - a.min).map((b) => b.grade);
  const counts = new Map<string, number>(order.map((g) => [g, 0]));
  for (const m of members) {
    const g = gradeFor(m.score, bands);
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }
  return order.map((grade) => ({ grade, count: counts.get(grade) ?? 0 }));
}

export function byParty(members: Member[]): { party: string; agg: Aggregate }[] {
  const groups = new Map<string, Member[]>();
  for (const m of members) {
    const p = m.party || "Other";
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p)!.push(m);
  }
  return [...groups.entries()]
    .map(([party, ms]) => ({ party, agg: aggregate(ms) }))
    .sort((a, b) => b.agg.count - a.agg.count);
}

export function shareBelow(members: Member[], cutoff: number): number {
  if (members.length === 0) return 0;
  return members.filter((m) => m.score < cutoff).length / members.length;
}
