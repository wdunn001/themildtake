import { useMemo } from "preact/hooks";
import { getAssessment } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { COMPARE_PALETTE } from "../../lib/scores";
import type { Assessment, DecisionKey } from "../../lib/types";
import HorizonTrajectory from "./HorizonTrajectory";

const ORDER: DecisionKey[] = ["currency", "assets", "living"];

interface Props {
  /** iso3 list, as an array or comma-separated string (e.g. "usa,chn"). */
  countries: string | string[];
  caption?: string;
  height?: number;
}

/** Article-embeddable: overlays each country's risk read across the three
 *  decision horizons — currency (near) -> assets (mid) -> living (long). */
export default function CountryTrajectory({ countries, caption, height = 320 }: Props) {
  const isos = (Array.isArray(countries) ? countries : countries.split(","))
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const key = isos.join(",");
  const { data, error, loading } = useAsync<Assessment[]>(
    () => Promise.all(isos.map((i) => getAssessment(i))),
    [key],
  );

  const lines = useMemo(() => {
    const list = data ?? [];
    return list
      .filter((a) => ORDER.every((dk) => a.decisions[dk]))
      .map((a, i) => ({
        name: a.country,
        points: ORDER.map((dk) => a.decisions[dk].score) as [number, number, number],
        color: COMPARE_PALETTE[i % COMPARE_PALETTE.length],
      }));
  }, [data]);

  return (
    <figure class="ct">
      {loading ? (
        <p class="ct__status">Loading trajectory…</p>
      ) : error || !lines.length ? (
        <p class="ct__status">Couldn’t load trajectory data.</p>
      ) : (
        <HorizonTrajectory lines={lines} height={height} />
      )}
      <figcaption class="ct__cap">
        {caption ?? "Risk read across horizons: currency (near) → living (long)"}
      </figcaption>
      <style>{`
        .ct { margin: 1.75rem 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .ct__cap { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); text-align: center; margin-top: 0.5rem; }
        .ct__status { font-family: var(--font-mono); color: var(--fg-muted); padding: 2rem 0; text-align: center; }
      `}</style>
    </figure>
  );
}
