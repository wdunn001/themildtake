import { useEffect, useMemo, useState } from "preact/hooks";
import { getAssessment, getComparisonIndex } from "../../lib/dataClient";
import { useAsync } from "./useAsync";
import { pivotIndex } from "./pivot";
import {
  CATEGORY_ORDER,
  COMPARE_PALETTE,
  DECISION_ORDER,
  DECISION_LABELS,
  categoryLabel,
  formatScore,
  sentimentFor,
} from "../../lib/scores";
import type { Assessment, DecisionKey } from "../../lib/types";
import CategoryRadar from "./CategoryRadar";
import DecisionBars from "./DecisionBars";

export default function CompareView() {
  const index = useAsync(() => getComparisonIndex(), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const allCountries = useMemo(
    () => (index.data ? pivotIndex(index.data).map((r) => ({ country: r.country, iso3: r.iso3.toLowerCase() })) : []),
    [index.data],
  );

  // Default to the top two of the living ranking once the index loads.
  useEffect(() => {
    if (index.data && selected.length === 0) {
      const top = index.data.decisions.living?.ranking.slice(0, 2).map((r) => r.iso3.toLowerCase()) ?? [];
      if (top.length) setSelected(top);
    }
  }, [index.data]);

  const key = selected.slice().sort().join(",");
  const assessments = useAsync<Assessment[]>(
    () => (selected.length ? Promise.all(selected.map((iso) => getAssessment(iso))) : Promise.resolve([])),
    [key],
  );

  const colorOf = (iso: string) => COMPARE_PALETTE[Math.max(0, selected.indexOf(iso)) % COMPARE_PALETTE.length];

  const toggle = (iso: string) =>
    setSelected((prev) => (prev.includes(iso) ? prev.filter((x) => x !== iso) : [...prev, iso]));

  const nameOf = (iso: string) => allCountries.find((c) => c.iso3 === iso)?.country ?? iso;

  // Type-ahead matches: unselected countries filtered by name or iso3, capped.
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = allCountries.filter((c) => !selected.includes(c.iso3));
    const f = q ? pool.filter((c) => c.country.toLowerCase().includes(q) || c.iso3.includes(q)) : pool;
    return f.slice(0, 8);
  }, [allCountries, selected, query]);

  const addCountry = (iso: string) => {
    setSelected((prev) => (prev.includes(iso) ? prev : [...prev, iso]));
    setQuery("");
    setActiveIdx(0);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const m = matches[activeIdx];
      if (m) addCountry(m.iso3);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && selected.length) {
      toggle(selected[selected.length - 1]);
    }
  };

  // Common categories (intersection, canonical order) so radar axes align.
  const sharedCategoryKeys = useMemo(() => {
    const list = assessments.data ?? [];
    if (!list.length) return [];
    const present = (a: Assessment) => new Set(Object.keys(a.categories));
    const sets = list.map(present);
    const common = [...sets[0]].filter((k) => sets.every((s) => s.has(k)));
    const ordered = CATEGORY_ORDER.filter((k) => common.includes(k));
    const extras = common.filter((k) => !CATEGORY_ORDER.includes(k as never));
    return [...ordered, ...extras];
  }, [assessments.data]);

  const sharedDecisions = useMemo(() => {
    const list = assessments.data ?? [];
    if (!list.length) return [] as DecisionKey[];
    return DECISION_ORDER.filter((dk) => list.every((a) => a.decisions[dk]));
  }, [assessments.data]);

  const list = assessments.data ?? [];

  const radarSeries = list.map((a) => ({
    name: a.country,
    values: sharedCategoryKeys.map((k) => a.categories[k]?.score ?? 0),
    color: colorOf(a.iso3.toLowerCase()),
  }));
  const barSeries = list.map((a) => ({
    name: a.country,
    scores: sharedDecisions.map((dk) => a.decisions[dk]?.score ?? 0),
    color: colorOf(a.iso3.toLowerCase()),
  }));

  return (
    <div class="cmp">
      <div class="cmp__picker">
        <div class="cmp__combo">
          <input
            class="cmp__input"
            type="text"
            value={query}
            placeholder={index.loading ? "Loading countries…" : "Search countries to add…"}
            disabled={index.loading}
            role="combobox"
            aria-expanded={open}
            aria-controls="cmp-listbox"
            autocomplete="off"
            onInput={(e) => {
              setQuery((e.target as HTMLInputElement).value);
              setOpen(true);
              setActiveIdx(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKey}
          />
          {open && matches.length > 0 && (
            <ul class="cmp__menu" id="cmp-listbox" role="listbox">
              {matches.map((c, i) => (
                <li role="option" aria-selected={i === activeIdx}>
                  <button
                    type="button"
                    class={`cmp__opt${i === activeIdx ? " cmp__opt--active" : ""}`}
                    // mousedown (not click) + preventDefault so the input keeps
                    // focus and the option fires before the input's blur closes the menu.
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addCountry(c.iso3);
                    }}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <span>{c.country}</span>
                    <span class="cmp__opt-iso">{c.iso3.toUpperCase()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected.length > 0 && (
          <div class="cmp__badges">
            {selected.map((iso) => (
              <span class="cmp__badge" style={{ borderColor: colorOf(iso), color: colorOf(iso) }}>
                {nameOf(iso)}
                <button
                  type="button"
                  class="cmp__badge-x"
                  aria-label={`Remove ${nameOf(iso)}`}
                  onClick={() => toggle(iso)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {selected.length < 2 ? (
        <p class="cmp__hint">Pick at least two countries to compare.</p>
      ) : assessments.loading ? (
        <p class="cmp__status">Loading assessments…</p>
      ) : assessments.error ? (
        <p class="cmp__status cmp__status--err">{assessments.error}</p>
      ) : (
        <>
          <div class="cmp__charts">
            <figure class="cmp__chart">
              <figcaption>Decision scores</figcaption>
              <DecisionBars labels={sharedDecisions.map((dk) => DECISION_LABELS[dk])} series={barSeries} height={300} />
            </figure>
            <figure class="cmp__chart">
              <figcaption>Category profiles</figcaption>
              <CategoryRadar indicatorNames={sharedCategoryKeys.map((k) => categoryLabel(k))} series={radarSeries} height={380} />
            </figure>
          </div>

          <div class="table-scroll">
            <table class="cmp__table">
              <thead>
                <tr>
                  <th>Decision</th>
                  {list.map((a) => <th class="cmp__num">{a.country}</th>)}
                </tr>
              </thead>
              <tbody>
                {sharedDecisions.map((dk) => (
                  <tr>
                    <th scope="row">{DECISION_LABELS[dk]}<span class="cmp__horizon"> {list[0].decisions[dk].horizon}</span></th>
                    {list.map((a) => {
                      const d = a.decisions[dk];
                      return (
                        <td class="cmp__num">
                          <span class={`cmp__score cmp__score--${sentimentFor(d.score)}`}>{formatScore(d.score)}</span>
                          <span class="cmp__conf">{Math.round(d.confidence * 100)}%</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        .cmp__picker { margin-bottom: 1.5rem; }
        .cmp__combo { position: relative; max-width: 28rem; }
        .cmp__input {
          width: 100%; box-sizing: border-box;
          background: var(--bg-elev); border: 1px solid var(--border-strong); color: var(--fg);
          font-family: var(--font-mono); font-size: 0.875rem; padding: 0.55rem 0.85rem; border-radius: 8px;
        }
        .cmp__input:focus { outline: none; border-color: var(--fg-muted); }
        .cmp__input::placeholder { color: var(--fg-faint); }
        .cmp__input:disabled { opacity: 0.6; cursor: wait; }
        .cmp__menu {
          position: absolute; z-index: 20; top: calc(100% + 4px); left: 0; right: 0; margin: 0; padding: 0.25rem;
          list-style: none; background: var(--bg-elev); border: 1px solid var(--border-strong); border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25); max-height: 16rem; overflow-y: auto;
        }
        .cmp__menu li { margin: 0; }
        .cmp__opt {
          display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%;
          background: none; border: none; cursor: pointer; text-align: left; color: var(--fg);
          font-family: var(--font-mono); font-size: 0.8125rem; padding: 0.4rem 0.6rem; border-radius: 6px;
        }
        .cmp__opt--active, .cmp__opt:hover { background: var(--surface); }
        .cmp__opt-iso { color: var(--fg-faint); font-size: 0.6875rem; }
        .cmp__badges { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.85rem; }
        .cmp__badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: var(--surface); border: 1px solid var(--border-strong);
          font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 600; padding: 0.3rem 0.3rem 0.3rem 0.7rem; border-radius: 999px;
        }
        .cmp__badge-x {
          display: inline-flex; align-items: center; justify-content: center; width: 1.15rem; height: 1.15rem;
          background: none; border: none; color: inherit; cursor: pointer; font-size: 1rem; line-height: 1; border-radius: 999px; opacity: 0.7;
        }
        .cmp__badge-x:hover { opacity: 1; background: var(--bg); }
        .cmp__hint, .cmp__status { font-family: var(--font-mono); color: var(--fg-faint); }
        .cmp__status--err { color: var(--neg); }
        .cmp__charts { display: grid; gap: 1.5rem; grid-template-columns: 1fr; margin-bottom: 2rem; }
        @media (min-width: 820px) { .cmp__charts { grid-template-columns: 1fr 1fr; } }
        .cmp__chart { margin: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-elev); padding: 1rem; }
        .cmp__chart figcaption { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin-bottom: 0.5rem; }
        .cmp__table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.875rem; }
        .cmp__table th, .cmp__table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--border); text-align: left; }
        .cmp__table thead th { color: var(--fg-faint); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .cmp__num { text-align: right; }
        .cmp__horizon { color: var(--fg-faint); font-size: 0.6875rem; }
        .cmp__score { font-weight: 700; }
        .cmp__score--pos { color: var(--pos); } .cmp__score--neg { color: var(--neg); } .cmp__score--mixed { color: var(--mixed); }
        .cmp__conf { color: var(--fg-faint); font-size: 0.6875rem; margin-left: 0.5rem; }
      `}</style>
    </div>
  );
}
