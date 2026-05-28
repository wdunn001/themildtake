import { useMemo, useState } from "preact/hooks";
import type { GridRow } from "./pivot";
import type { DecisionKey } from "../../lib/types";
import {
  DECISION_ORDER,
  DECISION_LABELS,
  formatScore,
  formatConfidence,
  sentimentFor,
} from "../../lib/scores";

interface Props {
  rows: GridRow[];
}

type SortKey = "country" | DecisionKey;

/** Sortable, filterable grid of every country across all three decisions. */
export default function CountryGrid({ rows }: Props) {
  const [sort, setSort] = useState<SortKey>("living");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter((r) => r.country.toLowerCase().includes(q) || r.iso3.toLowerCase().includes(q))
      : rows.slice();
    base.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sort === "country") {
        av = a.country;
        bv = b.country;
      } else {
        av = a.cells[sort]?.score ?? Number.NEGATIVE_INFINITY;
        bv = b.cells[sort]?.score ?? Number.NEGATIVE_INFINITY;
      }
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return dir === "asc" ? cmp : -cmp;
    });
    return base;
  }, [rows, sort, dir, query]);

  const setSortKey = (key: SortKey) => {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "country" ? "asc" : "desc");
    }
  };

  const arrow = (key: SortKey) => (sort === key ? (dir === "asc" ? " ▲" : " ▼") : "");

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
        <span class="grid__count">{filtered.length} of {rows.length}</span>
      </div>

      <div class="table-scroll">
        <table class="grid__table">
          <thead>
            <tr>
              <th>
                <button onClick={() => setSortKey("country")}>Country{arrow("country")}</button>
              </th>
              {DECISION_ORDER.map((dk) => (
                <th class="grid__num">
                  <button onClick={() => setSortKey(dk)}>{DECISION_LABELS[dk]}{arrow(dk)}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr>
                <th scope="row" class="grid__country">
                  <a href={`/ratings/${r.iso3.toLowerCase()}/`}>{r.country}</a>
                  <span class="grid__iso">{r.iso3}</span>
                </th>
                {DECISION_ORDER.map((dk) => {
                  const cell = r.cells[dk];
                  if (!cell) return <td class="grid__num grid__empty">—</td>;
                  return (
                    <td class="grid__num">
                      <span class={`grid__score grid__score--${sentimentFor(cell.score)}`}>
                        {formatScore(cell.score)}
                      </span>
                      <span class="grid__conf">{formatConfidence(cell.confidence)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .grid__toolbar { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
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
        .grid__country a { color: var(--fg); font-weight: 600; }
        .grid__country a:hover { color: var(--data); }
        .grid__iso { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
        .grid__score { font-weight: 700; }
        .grid__score--pos { color: var(--pos); }
        .grid__score--neg { color: var(--neg); }
        .grid__score--mixed { color: var(--mixed); }
        .grid__conf { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
        .grid__empty { color: var(--fg-faint); }
      `}</style>
    </div>
  );
}
