---
title: "Does more data make the scores more extreme? We checked."
description: "A common worry about any scoring system: the countries you know most about get the strongest opinions. We built a diagnostic to test it directly against all 193 assessments. The answer — and what confidence, the second axis, is actually for."
datePublished: "2026-05-29"
author:
  name: The Mild Take
section: Analysis
tags:
  - methodology
  - confidence
  - limitations
  - bias
---

## Abstract

Every score on the board comes with a **confidence** value, and confidence tracks
roughly how much reliable data stands behind the assessment. That raises a fair
worry: *do the countries we have the most data on end up with the most extreme
scores* — a rich-get-richer effect where familiarity manufactures conviction? We
turned the question into a measurement and ran it across all 193 assessments. The
result: **no meaningful effect, and if anything a slightly negative one.**

## The two-axis design

A score is never presented alone. It is paired with a confidence level on a
separate axis, because "how does this country read" and "how sure are we" are
different questions. Where official data is compromised, confidence is pulled
*down* and the caveat is recorded on the assessment rather than smoothed over.
The US statistical-agency entanglement, for example, lowers confidence on US
inflation and fiscal sub-factors instead of silently trusting or silently
discarding the numbers.

That design only works if confidence isn't secretly driving the scores
themselves. So we tested it.

## The diagnostic

`scripts/analyze-bias.mjs` computes, across all 193 countries, the correlation
between three **data-richness proxies** — mean sub-factor confidence, count of
distinct cited sources, and total notes length — and the **absolute** decision
scores `|living|`, `|assets|`, `|currency|`. If more data produced more extreme
scores, these correlations would be strongly positive.

They aren't:

| richness proxy     | corr w/ \|living\| | \|assets\| | \|currency\| |
|--------------------|-------------------:|-----------:|-------------:|
| mean confidence    |              −0.07 |      +0.04 |        +0.11 |
| distinct sources   |              −0.11 |      −0.08 |        −0.07 |
| notes length       |              −0.14 |      −0.16 |        −0.19 |

For the living decision the effect is essentially zero to slightly *negative* —
more sourcing and longer notes go with marginally *less* extreme scores, not
more. The mild positive readings on assets/currency confidence (+0.04, +0.11) are
small and have a benign explanation below.

## Why a small positive on assets/currency is expected — and harmless

The confidence quartiles tell the same story. Comparing the mean `|score|` of the
lowest-confidence quartile vs. the highest:

- **living:** 3.21 → 3.15 (Δ −0.06, flat)
- **assets:** 2.65 → 3.22 (Δ +0.56)
- **currency:** 2.35 → 3.28 (Δ +0.94)

The gap on assets and currency is **expected by design, not bias**: the dataset
deliberately hedges data-poor states toward the center — they are flagged
"insufficient reliable data," scored cautiously, and gated to an "insufficient
confidence" reading. That policy *lowers* the absolute scores of low-confidence
countries, which mechanically widens the quartile gap. It is the framework being
honest about thin data, not conviction inflating with familiarity.

## The structural backstop

There is also a mathematical guarantee behind all of this. The composite is a
**confidence-weighted average** of sub-factor scores:

```
composite = Σ(score · weight · confidence) / Σ(weight · confidence)
```

An average can never exceed its inputs. So `|composite|` can never be larger than
the largest `|sub-score|` — the aggregation **cannot manufacture extremeness**.
If extremeness exists anywhere, it lives in the **authored sub-scores**, and the
remedy would be a calibration pass on authoring, never a change to the formula.
The diagnostic exists to tell us whether that authoring problem is present. Right
now, it isn't.

## Discussion: the biases we *do* guard against

The data-richness effect is the worry people raise first; it turns out to be the
one that isn't there. The biases that genuinely require discipline are different,
and they are handled in the authoring rules rather than the math:

- **The reputation trap.** Scoring **observable actions, not stated values** —
  which is what puts a rich democracy near the bottom when its institutions drift.
- **The Anglophone-source trap.** Over-weighting English-language coverage skews
  toward Anglophone narratives; assessments are cross-checked against
  non-Anglophone independent sources.
- **The captured-media trap.** In closed regimes, state or captured media is
  *excluded* rather than scored as neutral, so closed states don't float up on
  the absence of bad press.

## Limitations

- The "distinct sources" and "notes length" proxies are crude stand-ins for data
  richness; they capture sourcing density, not source *quality*.
- The diagnostic detects a *linear* relationship; a non-linear or
  region-specific effect could hide under a near-zero global correlation.
- Confidence is itself an authored judgment, so this is a consistency check, not
  an external validation.

## What would change this

If a future re-run pushed `corr(meanConfidence, |living|)` above ~0.5, the script
prints a warning and the response would be an **authoring calibration pass** —
re-examining whether data-rich countries are carrying systematically larger
sub-scores — not a change to the aggregation. The math is not where extremeness
could come from; the inputs are, and they are what we keep watching.

Run it yourself: `npm run analyze-bias`. The whole point of the project is a score
you can argue with, attached to a confidence you can audit.
