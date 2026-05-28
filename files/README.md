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
- **`flags`** records outstanding caveats. Every current file carries `methodology_version: "2.0-pre-source-audit"` because these scores were generated before the full v2 source-discipline re-run.

## The three decisions

Each country is scored for three decisions, which use different category weights and time horizons:

- **living** (5-10y horizon) — weights institutional and political/social factors most heavily.
- **assets** (3-7y horizon) — weights economic and institutional factors most heavily.
- **currency** (1-3y horizon) — weights economic factors most heavily; uses near-term scores.

## Important caveat on these specific scores

These objects capture the scores exactly as generated in analysis, **including** the corrections made mid-process (US reserve-currency two-horizon fix; Ukraine re-scoring after recognizing under-weighted positive skew). They **predate** the full v2 source-discipline re-run, which is the highest-priority outstanding work. In particular:

- **China**: CCP-sourced data was partially absorbed and must be rebuilt from independent proxies; true scores likely skew more negative.
- **United States**: post-2022 official data should be treated as partially-entangled (documented statistical-agency interference); confidence here may be slightly high.

See each file's `flags` array and `_comparison-index.json`'s `outstanding_work` for the full list.

## Reuse

The schema is country-agnostic and decision-agnostic. To assess a new country, copy any country file, clear the values, and populate. To re-run under updated conditions, bump `assessed_on` and `methodology_version` and keep the prior file under version control for diffing over time.
