import { qualifyingPrograms } from "../../lib/personalFit";
import { formatScore, sentimentFor } from "../../lib/scores";
import type { Category, Pathway, Profile } from "../../lib/types";

interface Props {
  pathway: Pathway;
  profile: Profile;
  personalFit: Category | null;
}

const SUBFACTOR_LABEL: Record<string, string> = {
  language_match: "Language",
  immigration_pathway: "Immigration",
  credential_recognition: "Credentials",
  profession_demand: "Demand",
  cost_of_entry: "Cost of entry",
  belonging: "Belonging",
};

export default function PathwayCard({ pathway, profile, personalFit }: Props) {
  const qualifying = qualifyingPrograms(pathway, profile);
  const shown = qualifying.length ? qualifying : pathway.immigration;
  const best = shown.reduce(
    (b, p) => (b && b.timeToCitizenshipYears <= p.timeToCitizenshipYears ? b : p),
    shown[0],
  );

  return (
    <div class="pc">
      {personalFit && (
        <div class="pc__fit">
          {Object.entries(personalFit.sub_factors).map(([k, sf]) => (
            <span class={`pc__chip pc__chip--${sentimentFor(sf.score as number)}`}>
              {SUBFACTOR_LABEL[k] ?? k} {formatScore(sf.score as number)}
            </span>
          ))}
        </div>
      )}

      <div class="pc__cols">
        <section class="pc__sec">
          <h4>Immigration {qualifying.length ? "" : "(none matched yet)"}</h4>
          <ul class="pc__list">
            {shown.map((p) => (
              <li>
                <a href={p.officialUrl} target="_blank" rel="noopener">{p.name}</a>
                <span class="pc__meta">{p.type} &middot; {p.difficulty} &middot; PR ~{p.timeToPrYears || "?"}y &middot; citizenship ~{p.timeToCitizenshipYears || "?"}y</span>
              </li>
            ))}
          </ul>
        </section>

        <section class="pc__sec">
          <h4>Assets</h4>
          <p class="pc__line">Foreign property: <strong>{pathway.assets.foreignPropertyOwnership}</strong> &middot; securities: {pathway.assets.foreignSecurities} &middot; non-resident brokerage: {pathway.assets.nonResidentBrokerage}</p>
          <p class="pc__note">{pathway.assets.note}</p>
          <a href={pathway.assets.officialUrl} target="_blank" rel="noopener">Official source &rarr;</a>
        </section>

        <section class="pc__sec">
          <h4>Currency / banking</h4>
          <p class="pc__line">Capital account: <strong>{pathway.currency.capitalAccountOpen ? "open" : "restricted"}</strong> &middot; non-resident banking: {pathway.currency.nonResidentBanking} &middot; FX controls: {pathway.currency.fxControls}</p>
          <a href={pathway.currency.centralBankUrl} target="_blank" rel="noopener">Central bank &rarr;</a>
        </section>

        <section class="pc__sec">
          <h4>Languages &amp; credentials</h4>
          <p class="pc__line">Spoken: {pathway.languages.join(", ")}</p>
          <p class="pc__note">{pathway.credentials.note}</p>
        </section>
      </div>

      <div class="pc__start">
        <strong>How to start:</strong> {best ? (
          <>the <a href={best.officialUrl} target="_blank" rel="noopener">{best.name}</a> route looks like your shortest path - check eligibility on the official portal, then line up documents (proof of funds, qualifications, language tests where required).</>
        ) : "see the official immigration portal for current routes."}
      </div>

      <style>{`
        .pc { border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 0.75rem; font-size: 0.875rem; }
        .pc__fit { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
        .pc__chip { font-family: var(--font-mono); font-size: 0.6875rem; padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid var(--border-strong); }
        .pc__chip--pos { color: var(--pos); } .pc__chip--neg { color: var(--neg); } .pc__chip--mixed { color: var(--mixed); }
        .pc__cols { display: grid; gap: 1.25rem; grid-template-columns: 1fr; }
        @media (min-width: 720px) { .pc__cols { grid-template-columns: 1fr 1fr; } }
        .pc__sec h4 { font-family: var(--font-mono); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin: 0 0 0.5rem; }
        .pc__list { list-style: none; margin: 0; padding: 0; }
        .pc__list li { margin-bottom: 0.5rem; }
        .pc__list a, .pc__sec a { color: var(--data); }
        .pc__meta { display: block; color: var(--fg-faint); font-family: var(--font-mono); font-size: 0.6875rem; }
        .pc__line { color: var(--fg-muted); margin: 0 0 0.3rem; }
        .pc__line strong { color: var(--fg); }
        .pc__note { color: var(--fg-faint); margin: 0 0 0.4rem; }
        .pc__start { margin-top: 1rem; padding: 0.75rem; background: var(--bg-elev); border-radius: 8px; color: var(--fg-muted); }
        .pc__start strong { color: var(--fg); }
        .pc__start a { color: var(--data); }
      `}</style>
    </div>
  );
}
