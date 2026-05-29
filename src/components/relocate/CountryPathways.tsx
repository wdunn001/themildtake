import { qualifyingPrograms } from "../../lib/personalFit";
import type { ImmigrationProgram, Pathway, Profile } from "../../lib/types";

interface Props {
  pathway: Pathway;
  profile?: Profile | null;
}

const TYPE_LABEL: Record<string, string> = {
  skilled: "Work / skilled",
  investor: "Investment",
  income: "Income / passive",
  "digital-nomad": "Digital nomad",
  family: "Family",
  ancestry: "Ancestry / descent",
  student: "Student",
  lottery: "Lottery / draw",
};
const TYPE_ORDER = ["skilled", "investor", "income", "digital-nomad", "family", "ancestry", "student", "lottery"];
const PROF_LABEL: Record<string, string> = {
  medical: "Medical", legal: "Legal", engineering: "Engineering", finance: "Finance", tech: "Tech", trades: "Trades", academic: "Academic",
};

/** Rich, profile-optional renderer of a destination's relocation, asset,
 *  currency, licensing and lottery pathways, grouped into sub-categories. */
export default function CountryPathways({ pathway, profile }: Props) {
  const qualifyingNames = new Set(
    profile ? qualifyingPrograms(pathway, profile).map((p) => p.name) : [],
  );
  const byType: Record<string, ImmigrationProgram[]> = {};
  for (const p of pathway.immigration) (byType[p.type] ??= []).push(p);
  const groups = TYPE_ORDER.filter((t) => byType[t]?.length);

  const licenseKeys = pathway.licensing
    ? Object.keys(pathway.licensing).sort((a, b) =>
        a === profile?.profession ? -1 : b === profile?.profession ? 1 : 0,
      )
    : [];

  return (
    <div class="cp2">
      <section class="cp2__sec">
        <h3>Relocation routes</h3>
        {groups.map((t) => (
          <div class="cp2__grp">
            <span class="cp2__grplabel">{TYPE_LABEL[t] ?? t}</span>
            <ul class="cp2__list">
              {byType[t].map((p) => (
                <li>
                  <a href={p.officialUrl} target="_blank" rel="noopener">{p.name}</a>
                  {qualifyingNames.has(p.name) && <span class="cp2__match" title="You plausibly qualify">you may qualify</span>}
                  <span class="cp2__meta">{p.difficulty} &middot; PR ~{p.timeToPrYears || "?"}y &middot; citizenship ~{p.timeToCitizenshipYears || "?"}y</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {pathway.lottery && pathway.lottery.length > 0 && (
        <section class="cp2__sec">
          <h3>Lotteries / random draws</h3>
          <ul class="cp2__list">
            {pathway.lottery.map((l) => (
              <li>
                <a href={l.url} target="_blank" rel="noopener">{l.name}</a>
                <span class="cp2__note">{l.note}</span>
                {l.pastResultsUrl && <a class="cp2__sub" href={l.pastResultsUrl} target="_blank" rel="noopener">past results &amp; odds &rarr;</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div class="cp2__cols">
        <section class="cp2__sec">
          <h3>Asset acquisition</h3>
          <p class="cp2__line">Foreign property: <strong>{pathway.assets.foreignPropertyOwnership}</strong></p>
          <p class="cp2__line">Securities: {pathway.assets.foreignSecurities} &middot; non-resident brokerage: {pathway.assets.nonResidentBrokerage}</p>
          <p class="cp2__note">{pathway.assets.note}</p>
          <a href={pathway.assets.officialUrl} target="_blank" rel="noopener">Official source &rarr;</a>
        </section>

        <section class="cp2__sec">
          <h3>Currency &amp; banking</h3>
          <p class="cp2__line">Capital account: <strong>{pathway.currency.capitalAccountOpen ? "open" : "restricted"}</strong></p>
          <p class="cp2__line">Non-resident banking: {pathway.currency.nonResidentBanking} &middot; FX controls: {pathway.currency.fxControls}</p>
          <a href={pathway.currency.centralBankUrl} target="_blank" rel="noopener">Central bank &rarr;</a>
        </section>
      </div>

      {licenseKeys.length > 0 && (
        <section class="cp2__sec">
          <h3>Professional licensing</h3>
          <ul class="cp2__list">
            {licenseKeys.map((k) => (
              <li class={k === profile?.profession ? "cp2__lic--you" : ""}>
                <strong>{PROF_LABEL[k] ?? k}{k === profile?.profession ? " (you)" : ""}:</strong> {pathway.licensing[k].note}{" "}
                <a href={pathway.licensing[k].url} target="_blank" rel="noopener">body &rarr;</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p class="cp2__credit">
        Languages: {pathway.languages.join(", ")}. {pathway.credentials.note}{" "}
        <a href={pathway.links.immigration} target="_blank" rel="noopener">Immigration portal &rarr;</a>
      </p>
      <p class="cp2__disclaimer">General information, not legal, financial, immigration, or tax advice. Confirm current terms on the official links.</p>

      <style>{`
        .cp2 { font-size: 0.875rem; }
        .cp2__sec { margin-bottom: 1.25rem; }
        .cp2__sec h3 { font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-faint); margin: 0 0 0.6rem; }
        .cp2__grp { margin-bottom: 0.6rem; }
        .cp2__grplabel { font-family: var(--font-mono); font-size: 0.6875rem; color: var(--fg-muted); }
        .cp2__list { list-style: none; margin: 0.25rem 0 0; padding: 0; }
        .cp2__list li { margin-bottom: 0.45rem; }
        .cp2__list a { color: var(--data); }
        .cp2__match { font-family: var(--font-mono); font-size: 0.625rem; color: var(--pos); border: 1px solid var(--pos); border-radius: 999px; padding: 0.05rem 0.4rem; margin-left: 0.5rem; }
        .cp2__meta { display: block; color: var(--fg-faint); font-family: var(--font-mono); font-size: 0.6875rem; }
        .cp2__note { color: var(--fg-faint); margin: 0.15rem 0; display: block; }
        .cp2__sub { display: inline-block; font-size: 0.75rem; margin-top: 0.15rem; }
        .cp2__cols { display: grid; gap: 1.25rem; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .cp2__cols { grid-template-columns: 1fr 1fr; } }
        .cp2__line { color: var(--fg-muted); margin: 0 0 0.25rem; }
        .cp2__line strong { color: var(--fg); }
        .cp2__lic--you { color: var(--fg); }
        .cp2__credit { color: var(--fg-muted); margin-top: 1rem; }
        .cp2__credit a { color: var(--data); }
        .cp2__disclaimer { font-size: 0.75rem; color: var(--fg-faint); margin-top: 0.5rem; border-left: 3px solid var(--mixed); padding-left: 0.6rem; }
      `}</style>
    </div>
  );
}
