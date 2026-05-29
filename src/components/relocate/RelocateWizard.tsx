import { useEffect, useMemo, useState } from "preact/hooks";
import { getComparisonIndex, getAssessment } from "../../lib/dataClient";
import { useAsync } from "../ratings/useAsync";
import { personalize } from "../../lib/personalFit";
import { PATHWAYS } from "../../data/pathways.mjs";
import { formatScore, sentimentFor } from "../../lib/scores";
import type { Assessment, CapitalBand, DecisionKey, Goal, ProfessionCluster, Profile } from "../../lib/types";
import PathwayCard from "./PathwayCard";

const STORAGE_KEY = "themildtake:relocate-profile";
const DEST_ISOS = Object.keys(PATHWAYS);

const GOALS: [Goal, string, DecisionKey][] = [
  ["live", "Live there", "living"],
  ["invest", "Hold assets there", "assets"],
  ["currency", "Hold its currency", "currency"],
];
const PROFESSIONS: [ProfessionCluster, string][] = [
  ["any", "Any / other"], ["tech", "Tech / software"], ["medical", "Medical / health"],
  ["engineering", "Engineering"], ["finance", "Finance"], ["legal", "Legal"],
  ["trades", "Skilled trades"], ["academic", "Academic / research"],
];
const CAPITAL: [CapitalBand, string][] = [
  ["none", "No investable capital"], ["under50k", "Under $50k"], ["50k-250k", "$50k - $250k"],
  ["250k-1m", "$250k - $1M"], ["over1m", "Over $1M"],
];

const DEFAULT_PROFILE: Profile = {
  originIso3: "USA", citizenships: ["USA"], languages: ["English"],
  profession: "any", capitalBand: "50k-250k", goals: ["live"],
};

function loadProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return DEFAULT_PROFILE;
}

export default function RelocateWizard() {
  const index = useAsync(() => getComparisonIndex(), []);
  const assessments = useAsync<Assessment[]>(() => Promise.all(DEST_ISOS.map((i) => getAssessment(i))), []);

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [view, setView] = useState<"personalized" | "base">("personalized");
  const [showRefine, setShowRefine] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount; persist on change thereafter.
  useEffect(() => {
    setProfile(loadProfile());
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile, hydrated]);

  const set = (patch: Partial<Profile>) => setProfile((p) => ({ ...p, ...patch }));

  const originCountries = useMemo(() => {
    const r = index.data?.decisions?.living?.ranking ?? [];
    return r.map((x) => ({ iso3: x.iso3, country: x.country })).sort((a, b) => a.country.localeCompare(b.country));
  }, [index.data]);

  const goal = profile.goals[0] ?? "live";
  const goalDecision = (GOALS.find((g) => g[0] === goal)?.[2] ?? "living") as DecisionKey;

  const results = useMemo(() => {
    const list = assessments.data ?? [];
    const rows = list.map((a) => {
      const p = personalize(a, profile);
      const baseScore = a.decisions[goalDecision]?.score ?? 0;
      const persScore = p.decisions[goalDecision]?.score ?? baseScore;
      return {
        iso3: a.iso3, country: a.country, pathway: p.pathway, personalFit: p.personalFit,
        baseScore, persScore, delta: +(persScore - baseScore).toFixed(2),
      };
    });
    rows.sort((x, y) => (view === "personalized" ? y.persScore - x.persScore : y.baseScore - x.baseScore));
    return rows;
  }, [assessments.data, profile, goalDecision, view]);

  const loading = index.loading || assessments.loading;
  const priorities = profile.priorities ?? {};

  return (
    <div class="rw">
      <form class="rw__form" onSubmit={(e) => e.preventDefault()}>
        <div class="rw__grid">
          <label class="rw__field">
            <span>From (your citizenship)</span>
            <select value={profile.originIso3} onChange={(e) => set({ originIso3: (e.target as HTMLSelectElement).value })}>
              {originCountries.map((c) => <option value={c.iso3}>{c.country}</option>)}
            </select>
          </label>
          <label class="rw__field">
            <span>Goal</span>
            <select value={goal} onChange={(e) => set({ goals: [(e.target as HTMLSelectElement).value as Goal] })}>
              {GOALS.map(([g, label]) => <option value={g}>{label}</option>)}
            </select>
          </label>
          <label class="rw__field">
            <span>Profession</span>
            <select value={profile.profession} onChange={(e) => set({ profession: (e.target as HTMLSelectElement).value as ProfessionCluster })}>
              {PROFESSIONS.map(([p, label]) => <option value={p}>{label}</option>)}
            </select>
          </label>
          <label class="rw__field">
            <span>Investable capital</span>
            <select value={profile.capitalBand} onChange={(e) => set({ capitalBand: (e.target as HTMLSelectElement).value as CapitalBand })}>
              {CAPITAL.map(([c, label]) => <option value={c}>{label}</option>)}
            </select>
          </label>
          <label class="rw__field rw__field--wide">
            <span>Languages you speak (comma-separated)</span>
            <input
              type="text"
              value={profile.languages.join(", ")}
              placeholder="English, Spanish"
              onInput={(e) => set({ languages: (e.target as HTMLInputElement).value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </label>
        </div>

        <button type="button" class="rw__refinebtn" onClick={() => setShowRefine((s) => !s)} aria-expanded={showRefine}>
          {showRefine ? "Hide refinements" : "Refine (ancestry, family, priorities) +"}
        </button>

        {showRefine && (
          <div class="rw__refine">
            <label class="rw__check">
              <input type="checkbox" checked={!!profile.hasFamilyTies} onChange={(e) => set({ hasFamilyTies: (e.target as HTMLInputElement).checked })} />
              I have close family already settled abroad
            </label>
            <div class="rw__field rw__field--wide">
              <span>Ancestry / descent eligibility (select any that apply)</span>
              <div class="rw__chips">
                {DEST_ISOS.map((iso) => {
                  const on = profile.ancestryIso3?.includes(iso);
                  return (
                    <button type="button" class={`rw__chip${on ? " rw__chip--on" : ""}`} onClick={() => {
                      const cur = new Set(profile.ancestryIso3 ?? []);
                      on ? cur.delete(iso) : cur.add(iso);
                      set({ ancestryIso3: [...cur] });
                    }}>{PATHWAYS[iso].country}</button>
                  );
                })}
              </div>
            </div>
            <div class="rw__sliders">
              <span class="rw__slabel">How much should personal fit weigh, per decision?</span>
              {(GOALS.map((g) => g[2]) as DecisionKey[]).map((dk) => (
                <label class="rw__slider">
                  <span>{dk}</span>
                  <input type="range" min="0" max="0.5" step="0.05"
                    value={priorities[dk] ?? (dk === "living" ? 0.2 : dk === "assets" ? 0.1 : 0.05)}
                    onInput={(e) => set({ priorities: { ...priorities, [dk]: parseFloat((e.target as HTMLInputElement).value) } })} />
                  <span class="rw__sval">{Math.round((priorities[dk] ?? (dk === "living" ? 0.2 : dk === "assets" ? 0.1 : 0.05)) * 100)}%</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </form>

      <div class="rw__resultshead">
        <h2>Best matches for <strong>{GOALS.find((g) => g[0] === goal)?.[1].toLowerCase()}</strong></h2>
        <div class="rw__toggle" role="group" aria-label="View">
          <button class={view === "personalized" ? "on" : ""} onClick={() => setView("personalized")}>Personalized</button>
          <button class={view === "base" ? "on" : ""} onClick={() => setView("base")}>Base</button>
        </div>
      </div>

      {loading ? (
        <p class="rw__status">Loading destinations...</p>
      ) : (
        <ol class="rw__list">
          {results.map((r, i) => {
            const score = view === "personalized" ? r.persScore : r.baseScore;
            return (
              <li class="rw__row">
                <div class="rw__rowtop" onClick={() => setOpen(open === r.iso3 ? null : r.iso3)}>
                  <span class="rw__rank">{i + 1}</span>
                  <a class="rw__country" href={`/ratings/${r.iso3.toLowerCase()}/`} onClick={(e) => e.stopPropagation()}>{r.country}</a>
                  <span class={`rw__score rw__score--${sentimentFor(score)}`}>{formatScore(score)}</span>
                  {view === "personalized" && r.delta !== 0 && (
                    <span class={`rw__delta rw__delta--${r.delta > 0 ? "pos" : "neg"}`}>personal fit {formatScore(r.delta)}</span>
                  )}
                  <span class="rw__expand">{open === r.iso3 ? "Hide" : "Pathways"}</span>
                </div>
                {open === r.iso3 && r.pathway && (
                  <PathwayCard pathway={r.pathway} profile={profile} personalFit={r.personalFit} />
                )}
              </li>
            );
          })}
        </ol>
      )}

      <style>{`
        .rw__form { background: var(--bg-elev); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem; }
        .rw__grid { display: grid; gap: 1rem; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .rw__grid { grid-template-columns: 1fr 1fr; } }
        .rw__field { display: flex; flex-direction: column; gap: 0.35rem; }
        .rw__field--wide { grid-column: 1 / -1; }
        .rw__field span { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); }
        .rw__field select, .rw__field input, .rw__refine input[type="text"] {
          background: var(--bg); border: 1px solid var(--border-strong); border-radius: 6px;
          padding: 0.5rem 0.65rem; color: var(--fg); font-family: var(--font-mono); font-size: 0.875rem;
        }
        .rw__refinebtn { margin-top: 1rem; background: none; border: 0; color: var(--data); cursor: pointer; font-family: var(--font-mono); font-size: 0.8125rem; }
        .rw__refine { margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .rw__check { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--fg-muted); }
        .rw__chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .rw__chip { background: var(--bg); border: 1px solid var(--border-strong); color: var(--fg-muted); cursor: pointer; font-family: var(--font-mono); font-size: 0.6875rem; padding: 0.25rem 0.55rem; border-radius: 999px; }
        .rw__chip--on { background: var(--surface); color: var(--fg); border-color: var(--data); }
        .rw__sliders { display: flex; flex-direction: column; gap: 0.5rem; }
        .rw__slabel { font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); }
        .rw__slider { display: grid; grid-template-columns: 5rem 1fr 3rem; align-items: center; gap: 0.75rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--fg-muted); }
        .rw__slider input[type="range"] { accent-color: var(--data); }
        .rw__sval { text-align: right; color: var(--fg); }
        .rw__resultshead { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
        .rw__resultshead h2 { font-size: 1.1rem; }
        .rw__toggle { display: inline-flex; gap: 0.25rem; padding: 0.2rem; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 8px; }
        .rw__toggle button { background: none; border: 0; cursor: pointer; color: var(--fg-muted); font-family: var(--font-mono); font-size: 0.8125rem; padding: 0.35rem 0.8rem; border-radius: 6px; }
        .rw__toggle button.on { background: var(--surface); color: var(--fg); font-weight: 600; }
        .rw__status { font-family: var(--font-mono); color: var(--fg-muted); }
        .rw__list { list-style: none; margin: 0; padding: 0; }
        .rw__row { border-bottom: 1px solid var(--border); }
        .rw__rowtop { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 0; cursor: pointer; }
        .rw__rank { font-family: var(--font-mono); color: var(--fg-faint); font-size: 0.8125rem; width: 1.5rem; text-align: right; }
        .rw__country { color: var(--fg); font-weight: 600; flex: 1; }
        .rw__country:hover { color: var(--data); }
        .rw__score { font-family: var(--font-mono); font-weight: 700; }
        .rw__score--pos { color: var(--pos); } .rw__score--neg { color: var(--neg); } .rw__score--mixed { color: var(--mixed); }
        .rw__delta { font-family: var(--font-mono); font-size: 0.6875rem; }
        .rw__delta--pos { color: var(--pos); } .rw__delta--neg { color: var(--neg); }
        .rw__expand { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-faint); text-transform: uppercase; letter-spacing: 0.05em; }
      `}</style>
    </div>
  );
}
