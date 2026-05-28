# Worked Patterns

Concrete patterns for emitting country objects. The authoritative shape is `assets/schema.json`; this file shows how to handle the cases that are easy to get wrong.

## A minimal but complete category block

```json
"institutional": {
  "score": -5.6,
  "confidence": 0.76,
  "skew": "negative",
  "notes": "Most clearly negative category; multiple independent sub-factors agree.",
  "sub_factors": {
    "rule_of_law":          { "score": -5, "weight": 0.35, "confidence": 0.70, "notes": "Courts mostly functioning but pressure on judges and selective defiance." },
    "statistical_integrity":{ "score": -7, "weight": 0.25, "confidence": 0.85, "notes": "Agency head fired over a number; staffing cut; series eliminated." },
    "civil_service_capacity":{ "score": -6, "weight": 0.25, "confidence": 0.75, "notes": "Reclassifications, RIFs, loss of technical expertise." },
    "press_freedom":        { "score": -4, "weight": 0.15, "confidence": 0.65, "notes": "Ranking down; legal pressure; diversity remains." }
  }
}
```

Every sub-factor carries `weight` and `confidence`; weights within the block sum to 1.0. The category `score`/`confidence` are the aggregation-formula outputs, not free entries.

## Time-split (two-horizon) sub-factor

When a factor genuinely differs by horizon, use `score_near` and `score_long` and set `score` to `null`. Single-horizon factors do the opposite.

```json
"reserve_currency_intl_monetary": {
  "score_near": 5, "score_long": -2, "score": null,
  "weight": 0.20, "confidence": 0.70,
  "notes": "Reserve share eroding (e.g. 72%->58% over two decades). Strong near-term privilege; long-term becomes a structural dependency as the atrophy it enabled is exposed."
},
"inflation": {
  "score": -4, "score_near": null, "score_long": null,
  "weight": 0.15, "confidence": 0.70,
  "notes": "Single-horizon factor."
}
```

Which horizon flows into which decision: currency → near, assets → interpolate, living → long.

## Proxy-rebuild after excluding state-controlled data

When the hard exclusion rule strips a factor of its native sources, rebuild from independent proxies and say so in `notes`, and lower confidence to reflect proxy uncertainty.

```json
"fiscal_state": {
  "score_near": -4, "score_long": -5, "score": null,
  "weight": 0.25, "confidence": 0.55,
  "notes": "Official figures excluded (state-controlled statistical apparatus). Estimate rebuilt from independent proxies: cross-border bank data, bond-market pricing, and foreign-firm disclosures. Confidence lowered for proxy reliance."
}
```

## Insufficient-reliable-data verdict

When no usable inputs exist even after seeking proxies, do not invent a number.

```json
"some_factor": {
  "score": null, "score_near": null, "score_long": null,
  "weight": 0.10, "confidence": 0.0,
  "insufficient_reliable_data": true,
  "notes": "Only state-controlled sources available; no credible independent proxy. Excluded from this category's aggregation (drop its weight and renormalize the remaining weights)."
}
```

When a factor is dropped this way, renormalize the remaining sub-factor weights in that category so they still sum to 1.0, and note it.

## Honest flags

`flags` is where the object stays honest about its own limits. Examples of good flags:

```json
"flags": [
  "Scores predate a full source-discipline re-audit.",
  "State-controlled official data excluded; economics rebuilt from independent proxies; true scores may skew more negative.",
  "Post-interference official data from a democracy treated as partially-entangled; confidence may be slightly high.",
  "HIGH-VARIANCE / POSITIVE-SKEW case: outcome depends heavily on resolution of an active conflict.",
  "NEGATIVE-SKEW case: a key adverse trend is largely locked in.",
  "Loss-asymmetry: exit-ban / conscription / detention risk for a foreign national deserves weight beyond its probability.",
  "An under-weighted strength (e.g. manufacturing capacity) was up-weighted from the default; note the deviation."
]
```

## Comparison index (multiple countries)

When comparing countries, emit one object per country plus a comparison index that ranks them per decision and records cross-cutting findings and outstanding work.

```json
{
  "title": "N-Country Comparison Index",
  "methodology_version": "2.0",
  "assessed_on": "YYYY-MM-DD",
  "subject_profile": { "summary": "...", "stated_values": ["..."] },
  "scale": { "min": -10, "max": 10,
    "thresholds": { "clear_positive": ">= +3", "mixed": "between -3 and +3",
                    "clear_negative": "<= -3", "insufficient_confidence": "confidence < 0.40" } },
  "decisions": {
    "living": { "horizon": "5-10y", "ranking": [
      { "rank": 1, "country": "Sweden", "iso3": "SWE", "score": 3.86, "confidence": 0.77, "skew": "symmetric" }
    ] },
    "assets":   { "horizon": "3-7y", "ranking": [] },
    "currency": { "horizon": "1-3y", "ranking": [] }
  },
  "headline_findings": ["..."],
  "outstanding_work": ["..."]
}
```

Rank by `score` within each decision. Keep the index scores byte-for-byte consistent with the individual country files — a quick cross-check script that compares them is worth running before presenting.

## Self-consistency check before presenting

Always: (1) confirm every JSON file parses; (2) confirm sub-factor weights sum to 1.0 within each category (after any renormalization); (3) confirm decision-level category weights sum to 1.0; (4) if a comparison index exists, confirm its scores match the per-country files exactly.
