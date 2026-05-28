---
name: country-risk-assessment
description: >-
  Produce structured, source-disciplined, confidence-weighted risk assessments
  of countries for individual decisions such as relocation, holding a country's
  assets, or holding its currency. Use this skill whenever the user wants to
  compare countries, evaluate whether to move/emigrate/relocate somewhere, judge
  whether a country is a good place to hold money, assets, or currency, weigh a
  country's institutional/economic/political/geopolitical trajectory, or score
  any nation on livability, stability, or investment-safety grounds, even if they
  don't say the words "risk assessment." Also use it when the user references a
  prior assessment, a scored country, "the framework," "themildtake," or asks to
  add a new country to an existing comparison. Output is a per-country JSON object
  (and optionally a markdown writeup) on a consistent reusable schema.
---

# Country Risk Assessment Framework

This skill produces a directional **score** (−10 to +10) and an explicit **confidence** (0 to 1) for a defined decision about a country, so that multiple countries can be compared on one auditable scale. It is built for an **individual decision-maker with stated values**, not for a neutral universal ranking. The weights encode that person's values and must be set deliberately.

The single most important idea: **the output is only as trustworthy as its inputs, so confidence is set by source quality, not by the analyst's gut.** Most failures of this kind of analysis come from treating all sources as equal, treating a government's self-reporting as fact, or letting "the US is the default safe choice" do unearned work. This skill is engineered against those failure modes.

## When to apply which part

- For the **full method, definitions, scales, and rules**, read `references/methodology.md`. Read it before scoring anything for the first time in a session.
- For **the exact JSON output shape**, use `assets/schema.json` and the worked patterns in `references/examples.md`.
- For **source rating and the contamination rules**, the core is summarized below and detailed in `references/methodology.md`.

## The workflow

Follow these steps in order. Do not skip the search step or the source-rating step; they are what make this more than vibes.

### 1. Establish the subject and their values

The assessment is calibrated to a person. Capture (or infer from the conversation, then confirm): who they are, their profession and its portability, citizenship, and **their stated values** — i.e. what they weight most heavily. If the user has said things like "rule of law matters more than GDP" or "I care about personal freedom," those drive the weight matrix. If unstated, ask once, briefly, then proceed with a sensible default and say what you assumed.

### 2. Search for current conditions — always

Country conditions change constantly. **Never score from training-data memory alone.** For each country, search the web for current fiscal/economic state, central-bank and institutional developments, political and civil-liberties conditions, geopolitical/conflict status, and anything the user specifically flagged. Recency matters: leaders, laws, deficits, wars, and currency standing all move. Search per-country and per-topic rather than one combined query.

### 3. Rate every source before trusting it

This is the discipline that fixes contamination. For each input, assess three axes (full detail in `references/methodology.md`):

- **Factuality** — Very High / High / Mixed / Low / Very Low. A property of the source in general.
- **Independence-from-subject** — is the source structurally independent *of the country being assessed*? This is a relationship, not a fixed trait: the same outlet can be reliable on one country and captured on another.
  - **Independent** (foreign press, multilateral bodies reporting on a country they don't belong to) → full weight.
  - **Partially-entangled** (a domestic outlet during documented press pressure; a state statistical agency during documented partial interference) → reduced weight, must cross-check.
  - **State-controlled / captured-on-subject** (state-party media on their own state; a compromised statistical apparatus reporting on itself) → **UNUSABLE for scoring.** Use only as a signal of what the regime wants believed. Never let it raise confidence.
- **Slant** — pro-subject vs anti-subject. Does not reduce weight by itself; it feeds the slant-balance audit in step 7.

**The hard exclusion rule, applied uniformly to allies and adversaries alike:** any data from an entity reporting on *itself* where that entity's reporting apparatus is state-controlled or has documented compromised independence is excluded from scoring. When this strips a factor of all usable inputs, rebuild it from **independent proxies** (e.g. satellite night-lights, electricity consumption, port/freight traffic, foreign-firm earnings in place of a state's own GDP) or mark it **insufficient-reliable-data** and assign no score. Do not manufacture a point estimate from unusable data.

### 4. Score the six categories

Score each category from its sub-factors. The categories are **Economic State, Institutional State, Political and Social State, Geopolitical State, Physical and Practical State**, plus **Personal Fit** when the assessment is for a specific person. Each sub-factor gets a score (−10..+10), a weight within its category (weights sum to 1.0), and a confidence set by step 3's source quality, not by gut feel. Sub-factor and category definitions are in `references/methodology.md`.

Two scoring disciplines that are easy to get wrong:

- **Score the integrated forward expectation over the decision's time horizon, not the snapshot.** A factor strong now but eroding scores positive-but-below-current-level; weak now but improving scores negative-but-above. For factors that genuinely differ by horizon (reserve-currency status, fiscal sustainability, demographics, climate, any mid-level-but-moving institution), assign **two scores** — `score_near` (1–3y) and `score_long` (5–10y).
- **A reserve / dominant currency is a large near-term positive that can become a long-term negative** (the privilege lets institutions atrophy; when it erodes, correlated weaknesses surface together). Do not score it as uniformly good or, worse, only on its negative trajectory.

### 5. Aggregate with the confidence-weighted formula

Both levels use the same formula. For a category:

```
Category Score      = Σ(sub_score × sub_weight × sub_confidence) / Σ(sub_weight × sub_confidence)
Category Confidence = Σ(sub_weight × sub_confidence)      [= weighted avg of sub-confidences, since weights sum to 1]
```

For a decision, identically one level up, using category scores/confidences and the decision's category weights (which sum to 1.0 and differ per decision):

```
Decision Score      = Σ(cat_score × cat_weight × cat_confidence) / Σ(cat_weight × cat_confidence)
Decision Confidence = Σ(cat_weight × cat_confidence)
```

The division normalizes back onto the −10..+10 scale, so **low confidence reduces a factor's downstream influence without dragging its own score toward zero.** Low confidence means "counts for less," not "neutral." Pick the horizon-appropriate score: currency decision → near; assets → interpolate; living → long.

### 6. Characterize skew and loss asymmetry (the formula misses these)

The confidence-weighted average assumes symmetric outcomes and symmetric loss. It doesn't capture two things you must annotate by hand:

- **Outcome skew.** High variance with **positive skew** (a war that must end, then EU accession and reconstruction) is fundamentally different from high variance with **negative skew** (a locked-in demographic collapse; a privilege whose loss exposes correlated weaknesses). Two countries with equal expected value and equal confidence but opposite skew are **not** equivalent. **Uncertainty is not a license to default to pessimism** — characterize the distribution honestly; a high-variance-positive-skew country can rationally beat a low-variance-negative-drift one.
- **Loss asymmetry for this person.** For a major life decision, a catastrophic outcome costs more than an equal-probability upside gains. Flag factors where the downside is disproportionately costly to *this individual* (exit-ban, conscription, detention risk for a foreign national) and weight them beyond their probability-weighted score.

### 7. Run the slant-balance audit

Before finalizing, check whether the input set for each country leans uniformly pro- or anti-subject. If a country was assessed mostly from one slant (e.g. a China picture built only from China-hawk think tanks, or a Ukraine picture built only from pro-Ukraine institutional sources), deliberately seek the **opposite-slant source** of adequate factuality and independence and check whether it moves any score. A cross-country comparison is only valid if every country was assessed with **comparable slant balance** — uneven slant contaminates the comparison even when each individual source is reliable.

### 8. Emit the JSON object

Produce one JSON object per country conforming to `assets/schema.json`. Populate every category and sub-factor with score, weight, confidence, and a short `notes` justification; include `skew` per category; set the three `decisions`; write a narrative `summary`; and record honest `flags` (e.g. "scores predate full source audit," "CCP data excluded, economics rebuilt from proxies," "high-variance positive-skew case"). Keep `methodology_version` and `assessed_on` accurate. If comparing multiple countries, also emit a comparison index (see `references/examples.md`). Validate the JSON parses before presenting.

## Decision thresholds (for interpreting the final numbers)

- Score ≥ +3 with confidence > 0.60 → positive decision supported.
- Score ≤ −3 with confidence > 0.60 → negative decision supported.
- Between −3 and +3 → genuinely mixed; personal factors outside the framework should govern.
- Any decision with confidence < 0.40 → gather better information before deciding.
- Less reversible decisions (relocating a family) require a larger absolute score before acting than easily reversible ones (currency holdings).

For the **assets** and **currency** decisions, state plainly that this is an analytical framework and not financial or investment advice, and that the user should validate with a licensed professional who knows their full situation. For relocation, note that immigration, tax, and legal specifics need professional confirmation. The framework informs judgment; it does not replace it.

## What this skill must not do

- Do **not** produce a universal/objective ranking; weights encode one person's values.
- Do **not** substitute for personal factors, which often dominate for an individual.
- Do **not** claim precision it lacks; where data is poor, say "insufficient reliable data."
- Do **not** treat reputational legacy ("default safe country") as evidence; only current conditions and forward trajectory count.
- Do **not** let government self-reporting raise confidence, for any country, ally or adversary.

## Bundled resources

- `references/methodology.md` — full framework: every principle, the source-rating system in detail, category and sub-factor definitions, formulas, horizons, thresholds, and the changelog. Read first.
- `references/examples.md` — worked patterns: how a populated country object looks, how time-split factors and the proxy-rebuild and insufficient-data cases are encoded, and the comparison-index shape.
- `assets/schema.json` — the JSON Schema (draft-07) every country object must validate against.
