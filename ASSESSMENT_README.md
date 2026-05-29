# Country Assessments

Structured, reusable assessment data generated under the [Country Risk Assessment Framework v2](../country-risk-assessment-methodology.md) for the **themildtake** project.

## Files

| File | Contents |
|------|----------|
| `_schema.json` | JSON Schema (draft-07) defining the structure every country file conforms to. |
| `_comparison-index.json` | Cross-country comparison: decision-level rankings, headline findings, outstanding work. |
| `united-states.json` | USA assessment |
| `canada.json` | Canada assessment |
| `mexico.json` | Mexico assessment |
| `sweden.json` | Sweden assessment |
| `ukraine.json` | Ukraine assessment |
| `china.json` | China assessment |

## Conventions

- **Scores** range `-10` to `+10`. **Confidence** ranges `0` to `1`. **Weights** within a category sum to `1.0`.
- **Time-sensitive sub-factors** use `score_near` (1-3y) and `score_long` (5-10y) with `score: null`. Single-horizon factors use `score` with the two horizon fields null.
- **`skew`** records the shape of the outcome distribution (`positive` / `negative` / `symmetric` / `unknown`), which the expected-value math does not capture and which is decision-relevant.
- **`flags`** records caveats and provenance. Every current file carries `methodology_version: "2.0"`: the full v2 source-discipline re-run has been applied, plus two live-data passes (the second bias-corrected through non-Anglophone independent sources). Each file's `flags` array records what the re-run and passes changed.

## The three decisions

Each country is scored for three decisions, which use different category weights and time horizons:

- **living** (5-10y horizon) - weights institutional and political/social factors most heavily.
- **assets** (3-7y horizon) - weights economic and institutional factors most heavily.
- **currency** (1-3y horizon) - weights economic factors most heavily; uses near-term scores.

## Provenance of these scores

These objects reflect the **completed** v2.0 source-discipline re-run and two live-data passes (2026-05-28). In particular:

- **China**: CCP-sourced data is excluded under the hard exclusion rule and rebuilt from independent proxies (partner customs, freight, BIS/IIF debt, independent demographers); manufacturing capacity is credited via partner-observable data.
- **United States**: post-2022 official data is discounted as partially-entangled (documented statistical-agency interference); confidence on official-data-dependent factors is lowered.
- **All six**: trade re-weighted and scored on actions/trajectory/capacity/resource-curse; slant-balance audit run; a second pass re-validated each country through non-Anglophone independent + multilateral sources, which **largely confirmed** the scores.

See each file's `flags` array for the per-country specifics and `_comparison-index.json`'s `outstanding_work` for what remains (ongoing monitoring).

## Reuse

The schema is country-agnostic and decision-agnostic. To assess a new country, copy any country file, clear the values, and populate. To re-run under updated conditions, bump `assessed_on` and `methodology_version` and keep the prior file under version control for diffing over time.
