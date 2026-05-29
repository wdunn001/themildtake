import { useMemo } from "preact/hooks";
import { getAssessment } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { DECISION_LABELS, COMPARE_PALETTE } from "../../lib/scores";
import type { Assessment, DecisionKey } from "../../lib/types";
import HorizonTrajectory from "./HorizonTrajectory";

const NATIVE_IDX: Record<string, number> = { currency: 0, assets: 1, living: 2 };

interface Props {
  /** iso3 list, as an array or comma-separated string (e.g. "usa,chn"). */
  countries: string | string[];
  /** Which decision's weighting to project. Defaults to living. */
  decision?: DecisionKey;
  caption?: string;
  height?: number;
}

/** Article-embeddable: overlays several countries' near->long score trajectory
 *  for one decision. Use in MDX with a client directive. */
export default function CountryTrajectory({ countries, decision = "living", caption, height = 320 }: Props) {
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
      .filter((a) => a.decisions[decision]?.trajectory)
      .map((a, i) => {
        const tr = a.decisions[decision]!.trajectory!;
        return {
          name: a.country,
          points: [tr.near, tr.mid, tr.long] as [number, number, number],
          nativeIndex: NATIVE_IDX[decision],
          color: COMPARE_PALETTE[i % COMPARE_PALETTE.length],
        };
      });
  }, [data, decision]);

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
        {caption ?? `${DECISION_LABELS[decision]} score · near → long horizon`}
      </figcaption>
      <style>{`
        .ct { margin: 1.75rem 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .ct__cap { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); text-align: center; margin-top: 0.5rem; }
        .ct__status { font-family: var(--font-mono); color: var(--fg-muted); padding: 2rem 0; text-align: center; }
      `}</style>
    </figure>
  );
}
