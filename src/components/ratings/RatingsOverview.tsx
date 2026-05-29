import { useMemo } from "preact/hooks";
import { getComparisonIndex } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { pivotIndex } from "./pivot";
import CountryGrid from "./CountryGrid";

export default function RatingsOverview() {
  const { data, error, loading } = useAsync(() => getComparisonIndex(), []);
  const rows = useMemo(() => (data ? pivotIndex(data) : []), [data]);

  if (loading) return <p class="ro__status">Loading ratings…</p>;
  if (error || !data) return <p class="ro__status ro__status--err">Couldn’t load ratings data. {error}</p>;

  // One sortable grid of every country across all three decisions, with skew.
  // The grid's column headers sort by any decision, so a separate ranking view
  // is redundant.
  return (
    <div class="ro">
      <CountryGrid rows={rows} />
      <style>{`
        .ro__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .ro__status--err { color: var(--neg); }
      `}</style>
    </div>
  );
}
