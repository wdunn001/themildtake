import { useEffect, useMemo, useState } from "preact/hooks";
import { getComparisonIndex, getAssessment } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { pivotIndex } from "./pivot";
import { personalize } from "../../lib/personalFit";
import { PATHWAYS } from "../../data/pathways.mjs";
import CountryGrid from "./CountryGrid";
import type { Assessment, DecisionKey, Profile } from "../../lib/types";

const DEST_ISOS = Object.keys(PATHWAYS);
const DKEYS: DecisionKey[] = ["living", "assets", "currency"];

export default function RatingsOverview() {
  const { data, error, loading } = useAsync(() => getComparisonIndex(), []);
  const rows = useMemo(() => (data ? pivotIndex(data) : []), [data]);

  // Apply the reader's saved relocate profile, if any, to personalize the grid.
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("themildtake:relocate-profile");
      if (raw) setProfile(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Personalized scores for the curated destinations (only those have pathway data).
  const personal = useAsync<Record<string, Record<string, number>>>(
    async () => {
      if (!profile) return {};
      const list = await Promise.all(DEST_ISOS.map((i) => getAssessment(i)));
      const map: Record<string, Record<string, number>> = {};
      for (const a of list as Assessment[]) {
        const p = personalize(a, profile);
        if (!p.hasData) continue;
        map[a.iso3] = Object.fromEntries(DKEYS.map((d) => [d, p.decisions[d]?.score ?? 0]));
      }
      return map;
    },
    [profile],
  );

  if (loading) return <p class="ro__status">Loading ratings…</p>;
  if (error || !data) return <p class="ro__status ro__status--err">Couldn’t load ratings data. {error}</p>;

  return (
    <div class="ro">
      <CountryGrid rows={rows} personalScores={personal.data ?? {}} hasProfile={!!profile} />
      <style>{`
        .ro__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .ro__status--err { color: var(--neg); }
      `}</style>
    </div>
  );
}
