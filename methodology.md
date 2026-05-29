# Country Risk Assessment Framework

**Version 2**
**Project: themildtake**

A methodology for producing directional, confidence-weighted, source-disciplined assessments of countries for individual decisions such as relocation, asset holding, and currency exposure.

---

## Table of Contents

1. [Purpose and Scope](#purpose-and-scope)
2. [Core Design Principles](#core-design-principles)
3. [The Source-Quality Rating System](#the-source-quality-rating-system)
4. [How Source Quality Sets Confidence](#how-source-quality-sets-confidence)
5. [The Hierarchical Scoring Structure](#the-hierarchical-scoring-structure)
6. [The Aggregation Formulas](#the-aggregation-formulas)
7. [The Time-Horizon Mechanism](#the-time-horizon-mechanism)
8. [The Asymmetry and Skew Discipline](#the-asymmetry-and-skew-discipline)
9. [The Slant-Balance Audit](#the-slant-balance-audit)
10. [Decision Thresholds](#decision-thresholds)
11. [What the Framework Deliberately Does Not Do](#what-the-framework-deliberately-does-not-do)
12. [Changelog](#changelog)

---

## Purpose and Scope

This framework produces a directional **score** and a **confidence level** for a defined decision (such as relocating to a country, holding its assets, or holding its currency), so that multiple countries can be compared on a common scale and so that the comparison carries an explicit, auditable confidence rather than a false air of precision.

It is built for an **individual decision-maker with stated values**, not for a neutral or universal ranking. The weights encode those values and are meant to be set deliberately.

---

## Core Design Principles

The framework rests on five principles that govern every step.

### 1. Score the integrated forward expectation, not the snapshot

Each factor is scored as its expected contribution over the time horizon of the decision, combining the current level with the direction and rate of change. A factor that is strong now but eroding is scored positive but below its current level; a factor that is weak now but improving is scored negative but above its current level.

### 2. Separate magnitude from confidence

Every factor carries a **score** (how good or bad, and how strongly) and a separate **confidence** (how sure we are the score is right). These are different axes. A severe-but-uncertain factor and a mild-but-certain factor are not the same and must not be collapsed into one number.

### 3. Characterize the shape of uncertainty, not just its size

High variance with **positive skew** (most outcomes neutral to good, small tail of bad) is genuinely different from high variance with **negative skew** (most outcomes neutral to bad, small chance of good). The framework records expected value, but the analyst must flag skew explicitly, because two factors with the same expected value and the same confidence can still imply very different decisions when their outcome distributions are shaped differently. **Uncertainty is not a reason to default to pessimism; it is a property to be described.**

### 4. Weight inputs by source quality, never treat all sources as equal

Confidence is not a free-floating subjective judgment; it is disciplined by the quality and independence of the underlying sources. (See the full system below.)

### 5. Audit for slant balance

A comparison is only as trustworthy as its most contaminated input, and individually reliable sources can still produce a distorted picture if the set of them leans uniformly one way on a given country. The analyst must check this deliberately.

---

## The Source-Quality Rating System

Every input feeding a factor score is rated on **three independent axes** before it is allowed to influence confidence. This system is adapted from Ground News's media rating methodology (factuality, ownership, bias) and repurposed for country assessment.

### Axis 1: Factuality

A five-tier assessment of how reliably the source reports facts, corrects errors, and adds verified context. This axis is a property of the source in general.

| Tier | Description |
|------|-------------|
| **Very High** | Very reliable, sticks to facts, well-researched, minimal bias or sensationalism. |
| **High** | Mostly fact-based, original reporting, balanced, rarely fails fact-checks, corrects errors quickly. |
| **Mixed** | Blends objective and opinion-driven content; fails multiple fact-checks; slow to correct. |
| **Low** | Significant accuracy problems, lacks credible sourcing, omits key detail, sensational. |
| **Very Low** | Least reliable, sensational, non-objective, frequently misleads or distorts. |

### Axis 2: Independence-from-Subject

**This is the critical adaptation and the one that fixes the data-contamination problem.** Independence is scored as a *relationship between the source and the specific country being assessed*, not as a fixed property of the source. The same outlet can be independent on one subject and captured on another.

| Tier | Meaning | Treatment |
|------|---------|-----------|
| **Independent-of-subject** | No structural tie to the assessed government or its interests (e.g. a foreign newspaper or a multilateral institution reporting on a country it does not belong to). | Full weight. |
| **Partially-entangled** | Operates within the assessed country's jurisdiction or has some interest tie, but retains meaningful independence (e.g. a domestic outlet in a democracy during documented press pressure; a state statistical agency during documented but partial interference). | Reduced weight; requires cross-checking. |
| **State-controlled / captured-on-subject** | Serves the assessed entity's narrative on the matter in question (e.g. state-party media reporting on their own state; a government's own statistical apparatus reporting on itself once independence is compromised). | **Unusable for scoring.** Usable only as evidence of what the regime wishes believed. Never contributes to a factor's score or raises its confidence. |

### Axis 3: Slant Direction

Reframed from Ground News's left-right political axis into a **pro-subject versus anti-subject** axis, because for country assessment the relevant slant is whether a source tilts favorably or unfavorably toward the country being scored. A China-hawk think tank and a Beijing-friendly business council slant in opposite directions on China; both are flagged so the analyst can deliberately read across them.

This axis **does not by itself reduce a source's weight.** Its purpose is to feed the slant-balance audit, so the analyst can detect and correct lopsided input sets.

### The Resulting Data-Trust Tiers

| Tier | Composition | Effect on Confidence |
|------|-------------|---------------------|
| **Trustworthy** | Independent-of-subject + High/Very High factuality. Examples: OECD, IMF Article IV, World Bank, BIS, V-Dem, World Justice Project, Reporters Without Borders, independent academic demographers, Reuters/AP wire. | Sets confidence ceilings high. |
| **Middle** | Partially-entangled sources, OR independent sources of Mixed factuality. Includes data from democracies with degrading but still partially independent statistical institutions. | Usable, capped confidence, mandatory cross-checking against trustworthy-tier or proxy data. |
| **Untrustworthy** | State-controlled/captured-on-subject sources, and any Low/Very Low factuality source. | Excluded from scoring. Rebuild from independent proxies where credible (e.g. satellite nighttime-light data, electricity consumption, port/freight traffic, foreign-firm earnings), or declare the factor **insufficient-reliable-data**. |

### The Hard Exclusion Rule

Applied **uniformly across all countries**: any data originating from an entity reporting on itself, where that entity's reporting apparatus is state-controlled or has documented compromised independence, is excluded from scoring. This rule is content-neutral and applies regardless of which country is involved, **including democracies during documented periods of statistical interference.** Consistency is the point; the rule is only defensible if applied to allies and adversaries alike.

The rule extends to **state-funded broadcasters reporting on their own state** - not only adversary state media (Xinhua/CGTN, TASS/RT, IRNA/Press TV) but also Western government-funded outlets (Voice of America, Radio Free Asia) when the subject is the government that funds them. **Ownership tilt** (Gulf-state-owned pan-Arab outlets, oligarch-owned media) is a *slant to flag*, not an automatic exclusion, unless the outlet is captured on the specific subject.

### Source Diversity and the Anglophone Trap

A second, subtler contamination: building a country's picture only from **English-language, North-American** sources (including bias-rating tools like Ground News, which aggregate a mostly-Anglophone outlet set). This silently imports a single linguistic and geographic vantage point and is its own form of slant. To counter it:

- **Anchor each country in the language of the place**, plus a neighbor's or rival's language, plus a language-neutral multilateral index. (Mexico → Mexican independents + IMF/OECD; Ukraine → Ukrainian + Russian-*exile* + European + IMF/UN.)
- **Beware that "language of the place" sometimes has no free press.** For China there is **no neutral Mandarin-first source**: mainland media is state-controlled, Hong Kong's free press was dismantled after the 2020 National Security Law, and Taiwan - the only Mandarin-first free press - sits under existential threat from Beijing and therefore carries an anti-CCP slant *on China specifically*. So China must be read through diaspora/exile Mandarin (Initium, China Digital Times), Japanese/Korean coverage, **partner-country customs data**, and multilateral indices - never Mandarin media alone. Treat Taiwanese sources on China as a flagged tilt, not a neutral read.
- **Lean on language-neutral multilateral references** that are independent of any single government by construction: IMF (Article IV, COFER), OECD, World Bank, BIS, V-Dem, World Justice Project, Reporters Without Borders, Transparency International, ACLED / Uppsala UCDP, and cross-border investigative networks (OCCRP, ICIJ).
- Use only **independent** outlets in each language; exclude state-controlled ones uniformly (see above). A curated, regularly-updated list of independent sources by language lives on the project's Resources page.

---

## How Source Quality Sets Confidence

Confidence on each factor is **not** a free subjective judgment. It is disciplined by the source set behind the factor:

| Source Situation | Confidence |
|------------------|-----------|
| Multiple trustworthy-tier sources in agreement | ~80%+ |
| Independent sources partially conflicting, OR reliance on Mixed-factuality sources | ~60-75% |
| Reliance only on partially-entangled sources | Capped ~50% |
| Only untrustworthy-tier sources available | **Flag insufficient-reliable-data; assign no score** |

---

## The Hierarchical Scoring Structure

Two levels feed three decisions.

### Top-Level Categories

1. **Economic State**
2. **Institutional State**
3. **Political and Social State**
4. **Geopolitical State**
5. **Physical and Practical State**

*(A sixth category, **Personal Fit**, is **deferred from the base**: it is reader-specific - profession, language, credential recognition, immigration pathway, belonging - and belongs in a future per-reader tool that asks those questions and layers the result on top of this general, country-level base. The base assessment is not calibrated to any individual.)*

### Each Sub-Factor Carries

- A **score** from **-10 to +10**
- A **confidence** from **0 to 1**, set by the source-quality rules above
- A **weight** within its category (weights within a category sum to 1)
- For time-sensitive sub-factors: **two scores** - a near-term and a long-term value

---

## The Aggregation Formulas

Both levels use the same **confidence-weighted weighted average**.

### Category Level

```
                Σ (sub_score × sub_weight × sub_confidence)
Category Score = ──────────────────────────────────────────
                     Σ (sub_weight × sub_confidence)

Category Confidence = Σ (sub_weight × sub_confidence)
```

*(Because sub-weights sum to 1, category confidence is simply the weighted average of sub-factor confidences.)*

### Decision Level

```
                Σ (category_score × category_weight × category_confidence)
Decision Score = ────────────────────────────────────────────────────────
                     Σ (category_weight × category_confidence)

Decision Confidence = Σ (category_weight × category_confidence)
```

*(Category weights for a given decision sum to 1 and differ between decisions, because different decisions are sensitive to different categories.)*

### Why the Division Matters

The division normalizes the result back onto the -10 to +10 scale, so that low confidence reduces a factor's influence on everything downstream **without** artificially pulling the factor's own score toward zero. **Low confidence means "this counts for less in the aggregate," not "this is neutral."**

---

## The Time-Horizon Mechanism

Time-sensitive factors carry separate **near-term** and **long-term** scores. The decision determines which is used:

| Decision | Horizon | Score Used |
|----------|---------|-----------|
| Currency / short-horizon | ~1-3 years | Near-term |
| Assets / medium-horizon | ~3-7 years | Interpolated |
| Living / long-horizon | ~5-10 years | Long-term |

### Factors Most Likely to Diverge Between Horizons

- **Reserve-currency / international-monetary position** - typically strongly positive near-term, but can become a negative structural dependency long-term as the privilege erodes and the institutional atrophy it enabled is exposed.
- **Fiscal sustainability** - usually worsens with horizon.
- **Demographic trajectory** - compounds with time.
- **Climate exposure** - worsens with time in vulnerable regions.
- **Any institutional factor that is currently mid-level but moving** - trajectory matters more than present level.

---

## The Asymmetry and Skew Discipline

Because a simple confidence-weighted average implicitly assumes symmetric outcomes and symmetric loss, the analyst must annotate two things the formula does not capture.

### 1. Outcome Skew

Where a factor or whole country has a meaningfully skewed distribution, note whether the skew is:

- **Positive** - e.g. a war that must end and could be followed by rapid recovery and accession to a larger bloc.
- **Negative** - e.g. a demographic collapse already locked in by cohorts already born, or a privilege whose loss exposes correlated weaknesses simultaneously.

Two countries with similar expected-value scores but opposite skews are **not** equivalent prospects, and the write-up must say so.

### 2. Loss Asymmetry for the Decision-Maker

For a major life decision, the cost of a catastrophic outcome usually exceeds the foregone benefit of an upside outcome of equal probability. Expected-value scores are the starting point, but the analyst flags any factor where the downside is disproportionately costly to the specific person - such as exit-ban risk, conscription exposure, or detention risk for a foreign national - because those deserve weight beyond their probability-weighted score.

---

## The Slant-Balance Audit

Borrowed from Ground News's **Blindspot** concept.

After scoring a country, check whether the input set leans uniformly **pro-subject** or **anti-subject**. If a country's picture was built mostly from sources slanting one way (e.g. a China assessment drawn predominantly from China-hawk think tanks, or a Ukraine assessment drawn predominantly from pro-Ukrainian and Western institutional sources), the analyst **must** deliberately seek the opposite-slant source of adequate factuality and independence, and check whether it moves any score.

A cross-country comparison is only valid if each country was assessed with **comparable slant balance**; an uneven slant profile across countries contaminates the comparison even when every individual source is reliable.

---

## Decision Thresholds

| Final Decision Score | Average Confidence | Reading |
|---------------------|-------------------|---------|
| Above ~+3 | > 60% | Positive decision supported |
| Below ~-3 | > 60% | Negative decision supported |
| Between -3 and +3 | any | Genuinely mixed; personal factors outside the framework should govern |
| any | < 40% | Gather better information before deciding |

**Reversibility adjustment:** Less reversible decisions should require a larger absolute score before action, because the cost of being wrong is higher when the decision cannot easily be undone.

---

## What the Framework Deliberately Does Not Do

- It does **not** produce a universal or objective country ranking; the weights encode a specific person's values.
- It does **not** substitute for personal factors, which frequently dominate the country-level picture for any individual.
- It does **not** claim precision it lacks; where data is poor, it says so rather than inventing a number.
- It does **not** treat reputational legacy or historical standing as evidence; a country's past role as a default safe choice is not an input - only its current conditions and forward trajectory are.

---

## Changelog

### Version 2.1

- Redesigned the trade factor (`trade_actions_capacity`) to score trade-policy **actions and volatility**, **trade trajectory** (export/import trends, diversity of goods and partners), **industrial capacity** (from partner-observable data so it survives source-exclusion), and **resource-curse / paradox-of-plenty** dynamics; raised its default economic weight 0.05 → 0.17 and rebalanced the other economic sub-weights.
- Completed the full source-discipline re-run across all six countries: applied the hard exclusion rule uniformly (CCP self-reported data excluded and rebuilt from independent proxies; US post-2022 official data discounted as partially-entangled), ran the slant-balance audit, and re-examined Mexico under skew (nearshoring + demographic dividend).
- Adopted an **actions-and-data-over-stated-values** stance: where leadership is unreliable, stated intentions carry little predictive weight, so scores lean on observable actions and independent data. The optional strict-foundational-weighting (re-weight-by-stated-values) variant is deliberately not used.
- Added a recompute engine (`scripts/compute-scores.mjs`) so category and decision aggregates are derived mechanically from sub-factors under the formula, and an index builder (`scripts/build-index.mjs`).
- **Source diversity, operationalized.** Reframed the source discipline away from any single bias tool (Ground News skews English / North-American) toward multilingual triangulation; added the uniform exclusion of state-funded broadcasters on their own state (incl. VOA / Radio Free Asia on the US); and added a curated independent-sources-by-language list, each annotated with its real base/jurisdiction (exile outlets included - e.g. The Moscow Times is Amsterdam-based, Meduza Riga, Initium Singapore). Noted that some places have *no* free local-language press (China: mainland captured, Hong Kong dismantled post-NSL, Taiwan existentially slanted on China).
- Ran two live-data passes (2026-05-28); the second deliberately re-read each country through **non-Anglophone independent + multilateral** sources. The diverse-source read **largely confirmed** the scores - evidence the framework is robust to dropping the Anglophone lean - with only minor refinements (China trade-as-dependency + structural deflation, Ukraine single-cluster EU accession, a Mexico caveat that the headline homicide drop is partly a disappearances/erasure artifact).
- **Generalized the base.** Removed the reader-specific **Personal Fit** category and de-calibrated the subject profile so the base is a general, country-level assessment; the `living` weights were rebalanced across the five remaining categories. Personal fit (profession, language, immigration pathway, belonging) is deferred to a future per-reader tool.
- **Country files are self-contained.** A single country's `flags`, `summary`, and `notes` describe only that country - no cross-country comparisons or relative rankings. All comparative analysis lives in `_comparison-index.json`. (Referencing another state as a factual *actor* - e.g. US tariff actions affecting Canada - is fine; comparing *standings* is not.)

### Version 2

Added to the v1 baseline:

- The three-axis **source-quality rating system** (factuality, independence-from-subject, slant direction).
- The relationship-based **independence-from-subject axis** that fixes the contamination problem.
- The uniform **hard exclusion rule** for self-reporting by compromised state apparatuses.
- The discipline that **source quality sets confidence** rather than subjective certainty.
- The **insufficient-reliable-data** verdict for factors with no usable inputs.
- The **slant-balance audit** that checks each country's input set for uniform lean and forces a deliberate read across the slant.

> These changes move the framework from *"scores disciplined by my judgment"* to *"scores disciplined by the quality and balance of the evidence behind them."*

### Version 1 (baseline)

- Confidence-weighted scoring across a category hierarchy.
- Time-horizon sensitivity (near-term / long-term split).
- Requirement to characterize outcome skew.
- Two-level aggregation (sub-factor → category → decision).

---

## Appendix A: Standard Categories, Sub-Factors, and Weights

These are the default sub-factors and within-category weights. They are a starting point, not a straitjacket; adjust weights to the subject's stated values and note any change in the country object's `flags`.

### Economic State
| Sub-factor | Default weight | Notes |
|---|---|---|
| fiscal_state | 0.22 | Debt-to-GDP, deficit trajectory, interest burden, reform pathway. Time-split likely. |
| monetary_independence | 0.22 | Central-bank independence and credibility. |
| reserve_currency_intl_monetary | 0.16 | International monetary position. Time-split: large near-term positive for reserve issuers, eroding/long-term-negative if privilege is declining. Neutral (0) for non-reserve currencies. |
| inflation | 0.13 | Direction and management. Deflation can be worse than mild inflation in a debt-heavy economy. |
| banking_stability | 0.10 | Capitalization, hidden bad debt, regulator quality. |
| trade_actions_capacity | 0.17 | Trade scored on four things: (1) trade-policy **actions and volatility** - rapid, unpredictable shifts manufacture hostile foreign-trade relationships, a near-term negative beyond tariff levels; (2) **trajectory over time** - export/import growth and the diversity of goods and partners; (3) **industrial / manufacturing capacity** for manufacturing powers, scored from partner-observable data (customs, port/freight, foreign supply chains) so it survives the source-exclusion rule; (4) **resource-curse / paradox-of-plenty** - penalize resource-dependent economies where extraction crowds out institutions, but NOT resource-rich economies with strong institutions. Raised from the v2.0 default of 0.05 because trade actions move fast and matter for every country, not only manufacturing superpowers; the other economic weights were rebalanced to keep the sum at 1.0. |

### Institutional State
| Sub-factor | Default weight | Notes |
|---|---|---|
| rule_of_law | 0.35 | Judicial independence, executive compliance with courts, property/contract security, treatment of dissent. |
| statistical_integrity | 0.25 | Reliability and independence of official data. Drives how much the country's own numbers can be trusted elsewhere in the assessment. |
| civil_service_capacity | 0.25 | Administrative/technocratic capacity and its politicization. |
| press_freedom | 0.15 | Independent media, censorship, journalist safety. |

### Political and Social State
| Sub-factor | Default weight | Notes |
|---|---|---|
| political_stability | 0.30 | Electoral integrity, peaceful transfers, polarization. Time-split for authoritarian "suppressed instability." |
| civil_liberties | 0.20 | Speech, assembly, religion, surveillance, due process. |
| treatment_non_citizens | 0.25 | Immigration/visa pathways, due process for non-citizens, exit-ban risk. Heaviest where relocation is the decision. |
| social_cohesion / social_violence | 0.15 | Social trust, political or organized violence, war exposure. |
| demographics | 0.10 | Fertility, aging, migration, brain drain. Time-split; effects compound. |

### Geopolitical State
| Sub-factor | Default weight | Notes |
|---|---|---|
| alliance_reliability | 0.40 | Strength and reliability of alliances; degradation trajectory. |
| conflict_involvement | 0.35 | Active or potential military conflict. Time-split; for active wars, near-term is extreme and long-term depends on resolution. |
| sanctions_capital_controls | 0.25 | Sanctions exposure and capital-control risk for an asset holder. For some states capital controls are a present baseline, not a tail risk. |

### Physical and Practical State
| Sub-factor | Default weight | Notes |
|---|---|---|
| climate | 0.20 | Regional climate exposure and adaptation capacity. Time-split. |
| healthcare | 0.30 | Access, cost, outcomes, public-health capacity. |
| infrastructure | 0.20 | Transport, grid, broadband, water. |
| crime_safety | 0.15 | Violent and property crime relative to peers. |
| disaster_insurance | 0.15 | Natural-disaster exposure and insurance-market function. |

### Personal Fit (deferred to a future per-reader tool)
Reader-specific fit - credential recognition, job-market depth for a specialty, language, visa/immigration pathway, salary, belonging - is **not part of the base**. It cannot be scored once for everyone, so it is deferred to a future tool that asks the reader for profession, language, and similar facts and layers a personal-fit adjustment on top of this general base. The base files carry no `personal_fit` category.

### Default category weights per decision
Each row sums to 1.0 across the five base categories (no personal_fit). These are sensible defaults that weight institutions and political/social heavily for living; a future per-reader tool may re-weight them.

| Category | living (5-10y) | assets (3-7y) | currency (1-3y) |
|---|---|---|---|
| economic | 0.15 | 0.40 | 0.60 |
| institutional | 0.35 | 0.25 | 0.20 |
| political_social | 0.30 | 0.10 | 0.05 |
| geopolitical | 0.05 | 0.15 | 0.15 |
| physical_practical | 0.15 | 0.10 | 0.00 |
