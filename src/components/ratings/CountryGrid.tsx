import { useMemo, useState } from "preact/hooks";
import type { GridRow } from "./pivot";
import type { DecisionKey, Skew } from "../../lib/types";
import {
  DECISION_ORDER,
  DECISION_LABELS,
  formatScore,
  formatConfidence,
  sentimentFor,
  colorFor,
} from "../../lib/scores";

interface Props {
  rows: GridRow[];
}

type SortKey = "country" | "skew" | DecisionKey;

// Skew is a country-level property (identical across the three decisions), so it
// is one column rather than per-cell. Higher rank sorts first when descending.
const SKEW_RANK: Record<string, number> = { positive: 2, symmetric: 1, negative: 0, unknown: -1 };
const skewOf = (r: GridRow): Skew | undefined =>
  r.cells.living?.skew ?? r.cells.assets?.skew ?? r.cells.currency?.skew;
const skewGlyph = (s?: Skew) =>
  s === "positive" ? "▲" : s === "negative" ? "▼" : s === "symmetric" ? "→" : "—";
const skewSent = (s?: Skew) => (s === "positive" ? "pos" : s === "negative" ? "neg" : "mixed");

// Header tooltips — make explicit that these are forward-looking risk reads, not
// snapshots of current quality / value.
const COMBINE_HINT = " Ctrl/⌘-click to combine decisions into one ranking.";
const DECISION_TIP: Record<string, string> = {
  living:
    "Risk read for living / relocating there over ~5–10 years (long-term). NOT a measure of current quality of life." +
    COMBINE_HINT,
  assets:
    "Risk read for holding assets there over ~3–7 years (mid-term). NOT a measure of current asset value." +
    COMBINE_HINT,
  currency:
    "Risk read for holding its currency over ~1–3 years (near-term). NOT a measure of current exchange-rate value." +
    COMBINE_HINT,
};
const POS_TIP = "Position in the current sort. Persists when you filter.";
const COUNTRY_TIP = "Sort by name. Click a row to open the full assessment.";
const SKEW_TIP =
  "Which way the tail leans beyond the central score: positive = upside, negative = downside, symmetric = balanced.";

/** Sortable, filterable grid of every country across all three decisions. */
export default function CountryGrid({ rows }: Props) {
  const [sort, setSort] = useState<SortKey>("living");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [skewFilter, setSkewFilter] = useState<"all" | Skew>("all");
  // Ctrl/Cmd-click decision headers to combine them; the grid then ranks by the
  // average of the selected decisions. Empty = single-column sort via `sort`.
  const [multi, setMulti] = useState<DecisionKey[]>([]);
  const [minConf, setMinConf] = useState(0);

  // Combined value for a row under the active multi-sort (mean of selected
  // decision scores), or null when not in multi mode.
  const combinedScore = (r: GridRow): number => {
    const vals = multi.map((dk) => r.cells[dk]?.score).filter((v): v is number => typeof v === "number");
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : Number.NEGATIVE_INFINITY;
  };

  // Representative confidence for the active ranking metric, used by the
  // confidence-threshold filter: the selected decisions' mean in multi mode, the
  // sorted decision's confidence in single mode, else the best across decisions.
  const rowConf = (r: GridRow): number => {
    if (multi.length > 0) {
      const cs = multi.map((dk) => r.cells[dk]?.confidence).filter((v): v is number => typeof v === "number");
      return cs.length ? cs.reduce((a, b) => a + b, 0) / cs.length : 0;
    }
    if (sort === "living" || sort === "assets" || sort === "currency") return r.cells[sort]?.confidence ?? 0;
    return Math.max(0, ...DECISION_ORDER.map((dk) => r.cells[dk]?.confidence ?? 0));
  };

  // Rank the FULL set by the current sort first, stamping each row with its
  // position (1-based). Filtering happens afterward, so a row keeps its place
  // in the current sort even when the list is filtered down.
  const ranked = useMemo(() => {
    const base = rows.slice();
    base.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (multi.length > 0) {
        av = combinedScore(a);
        bv = combinedScore(b);
      } else if (sort === "country") {
        av = a.country;
        bv = b.country;
      } else if (sort === "skew") {
        av = SKEW_RANK[skewOf(a) ?? "unknown"] ?? -1;
        bv = SKEW_RANK[skewOf(b) ?? "unknown"] ?? -1;
      } else {
        av = a.cells[sort]?.score ?? Number.NEGATIVE_INFINITY;
        bv = b.cells[sort]?.score ?? Number.NEGATIVE_INFINITY;
      }
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return dir === "asc" ? cmp : -cmp;
    });
    return base.map((row, i) => ({ row, pos: i + 1 }));
  }, [rows, sort, dir, multi]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter(({ row }) => {
      if (skewFilter !== "all" && skewOf(row) !== skewFilter) return false;
      if (minConf > 0 && rowConf(row) < minConf) return false;
      if (q && !(row.country.toLowerCase().includes(q) || row.iso3.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [ranked, query, skewFilter, minConf]);

  const isDecision = (key: SortKey): key is DecisionKey =>
    key === "living" || key === "assets" || key === "currency";

  const setSortKey = (key: SortKey, additive = false) => {
    if (additive && isDecision(key)) {
      // Toggle this decision in/out of the combined-rank set.
      setMulti((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
      setDir("desc");
      return;
    }
    setMulti([]);
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "country" ? "asc" : "desc");
    }
  };

  const inMulti = (key: SortKey) => multi.length > 0 && isDecision(key) && multi.includes(key);
  const headerActive = (key: SortKey) => (multi.length > 0 ? inMulti(key) : sort === key);
  const arrow = (key: SortKey) => {
    if (inMulti(key)) return dir === "asc" ? " ▲" : " ▼";
    if (multi.length === 0 && sort === key) return dir === "asc" ? " ▲" : " ▼";
    return "";
  };

  return (
    <div class="grid">
      <div class="grid__toolbar">
        <input
          type="search"
          class="grid__search"
          placeholder="Filter countries…"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          aria-label="Filter countries"
        />
        <div class="grid__skewfilter" role="group" aria-label="Filter by skew">
          {(["all", "positive", "symmetric", "negative"] as const).map((s) => (
            <button
              class={`grid__skewbtn${skewFilter === s ? " grid__skewbtn--on" : ""}`}
              onClick={() => setSkewFilter(s)}
              aria-pressed={skewFilter === s}
              title={s === "all" ? "Show all skews" : `Show only ${s}-skew countries`}
            >
              {s === "all" ? "All skews" : `${skewGlyph(s)} ${s}`}
            </button>
          ))}
        </div>
        <label class="grid__confctl" title="Hide countries below this confidence on the active ranking metric">
          min conf <strong>{Math.round(minConf * 100)}%</strong>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={minConf}
            onInput={(e) => setMinConf(parseFloat((e.target as HTMLInputElement).value))}
            aria-label="Minimum confidence"
          />
        </label>
        <span class="grid__count">{filtered.length} of {rows.length}</span>
      </div>

      {multi.length > 0 && (
        <p class="grid__multinote">
          Combined rank — average of {multi.map((dk) => DECISION_LABELS[dk]).join(" + ")}; the{" "}
          <strong>⋈</strong> column reflects it. Ctrl/⌘-click a decision header to add or remove it,
          or click any header normally to reset.
        </p>
      )}

      <div class="table-scroll">
        <table class="grid__table">
          <thead>
            <tr>
              <th class="grid__poscol" title={POS_TIP}>{multi.length > 0 ? "⋈" : "#"}</th>
              <th>
                <button
                  class={headerActive("country") ? "grid__h--on" : undefined}
                  onClick={() => setSortKey("country")}
                  title={COUNTRY_TIP}
                >Country{arrow("country")}</button>
              </th>
              {DECISION_ORDER.map((dk) => (
                <th class="grid__num">
                  <button
                    class={headerActive(dk) ? "grid__h--on" : undefined}
                    onClick={(e) => setSortKey(dk, e.ctrlKey || e.metaKey)}
                    title={DECISION_TIP[dk]}
                  >{DECISION_LABELS[dk]}{arrow(dk)}</button>
                </th>
              ))}
              <th class="grid__skewcol">
                <button
                  class={headerActive("skew") ? "grid__h--on" : undefined}
                  onClick={() => setSortKey("skew")}
                  title={SKEW_TIP}
                >Skew{arrow("skew")}</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ row: r, pos }) => (
              <tr>
                <td class="grid__pos">{pos}</td>
                <th scope="row" class="grid__country">
                  <a href={`/ratings/${r.iso3.toLowerCase()}/`}>{r.country}</a>
                  <span class="grid__iso">{r.iso3}</span>
                </th>
                {DECISION_ORDER.map((dk) => {
                  const cell = r.cells[dk];
                  if (!cell) return <td class="grid__num grid__empty">—</td>;
                  return (
                    <td class="grid__num">
                      <div class="grid__cell">
                        <div class="grid__cellhead">
                          <span class={`grid__score grid__score--${sentimentFor(cell.score)}`}>
                            {formatScore(cell.score)}
                          </span>
                          <span class="grid__conf">{formatConfidence(cell.confidence)}</span>
                        </div>
                        <span class="grid__bar" aria-hidden="true">
                          <span class="grid__bar-axis" />
                          <span
                            class="grid__bar-fill"
                            style={{
                              width: `${(Math.abs(cell.score) / 10) * 50}%`,
                              background: colorFor(cell.score),
                              left: cell.score >= 0 ? "50%" : undefined,
                              right: cell.score < 0 ? "50%" : undefined,
                            }}
                          />
                        </span>
                      </div>
                    </td>
                  );
                })}
                <td class="grid__skewcell">
                  <span class={`grid__skewtag grid__skewtag--${skewSent(skewOf(r))}`}>
                    {skewGlyph(skewOf(r))} {skewOf(r) ?? "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .grid__toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; margin-bottom: 1rem; }
        .grid__skewfilter { display: inline-flex; gap: 0.25rem; padding: 0.2rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; }
        .grid__skewbtn {
          background: none; border: 0; cursor: pointer; color: var(--fg-muted); text-transform: capitalize;
          font-family: var(--font-mono); font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 6px;
        }
        .grid__skewbtn:hover { color: var(--fg); }
        .grid__skewbtn--on { background: var(--surface); color: var(--fg); font-weight: 600; }
        .grid__multinote { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); margin: 0 0 1rem; }
        .grid__multinote strong { color: var(--fg); }
        .grid__table thead button.grid__h--on { color: var(--fg); }
        .grid__search {
          flex: 1;
          max-width: 320px;
          background: var(--bg-elev);
          border: 1px solid var(--border-strong);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: var(--fg);
          font-family: var(--font-mono);
          font-size: 0.875rem;
        }
        .grid__search:focus { outline: none; border-color: var(--data); }
        .grid__confctl { display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); }
        .grid__confctl strong { color: var(--fg); min-width: 2.5rem; display: inline-block; }
        .grid__confctl input[type="range"] { accent-color: var(--data); width: 8rem; cursor: pointer; }
        .grid__count { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-faint); }
        .table-scroll { overflow-x: auto; }
        .grid__table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); }
        .grid__table th, .grid__table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border); text-align: left; }
        .grid__table thead th { border-bottom: 1px solid var(--border-strong); }
        .grid__table thead button {
          background: none; border: 0; color: var(--fg-faint); cursor: pointer;
          font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.06em;
          text-transform: uppercase; padding: 0;
        }
        .grid__table thead button:hover { color: var(--fg); }
        .grid__num { text-align: right; }
        .grid__num.grid__num { text-align: right; }
        thead .grid__num button { width: 100%; text-align: right; }
        .grid__cell { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .grid__cellhead { display: flex; align-items: baseline; gap: 0.4rem; }
        .grid__cellhead .grid__conf { margin-left: 0; }
        .grid__bar { position: relative; width: 88px; max-width: 100%; height: 6px; border-radius: 3px; background: var(--confidence-track); overflow: hidden; }
        .grid__bar-axis { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: var(--border-strong); }
        .grid__bar-fill { position: absolute; top: 0; bottom: 0; border-radius: 3px; }
        @media (max-width: 720px) { .grid__bar { display: none; } }
        .grid__poscol { width: 2.5rem; }
        .grid__pos.grid__pos { text-align: right; color: var(--fg-faint); font-size: 0.8125rem; font-variant-numeric: tabular-nums; padding-right: 0.5rem; }
        .grid__country a { color: var(--fg); font-weight: 600; }
        .grid__country a:hover { color: var(--data); }
        .grid__iso { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
        .grid__score { font-weight: 700; }
        .grid__score--pos { color: var(--pos); }
        .grid__score--neg { color: var(--neg); }
        .grid__score--mixed { color: var(--mixed); }
        .grid__conf { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
        .grid__empty { color: var(--fg-faint); }
        .grid__skewcol { text-align: right; }
        .grid__skewcell.grid__skewcell { text-align: right; }
        thead .grid__skewcol button { width: 100%; text-align: right; }
        .grid__skewtag { font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .grid__skewtag--pos { color: var(--pos); }
        .grid__skewtag--neg { color: var(--neg); }
        .grid__skewtag--mixed { color: var(--fg-muted); }
      `}</style>
    </div>
  );
}
