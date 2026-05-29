// Mobility reference data for the personalization layer. Hand-curated, plain
// .mjs so both Node (sync-data) and the browser can import it. Keeps the
// origin->destination "pathway" factors O(n): we store per-country bloc
// membership plus a coarse passport-strength tier, and compute language overlap,
// shared free-movement / residency rights, and visa-access ease in the client
// from origin + destination attributes rather than authoring n^2 country pairs.
//
// Terms change; treat this as a planning aid, not legal advice. No em dashes.

// Free-movement / residency blocs (iso3 members). Sharing a bloc with a
// destination usually means a far easier residency or entry right.
export const BLOCS = {
  // EU single market: full freedom of movement among members.
  EU: ["AUT","BEL","BGR","HRV","CYP","CZE","DNK","EST","FIN","FRA","DEU","GRC","HUN","IRL","ITA","LVA","LTU","LUX","MLT","NLD","POL","PRT","ROU","SVK","SVN","ESP","SWE"],
  // EEA = EU + these three (freedom of movement extends here).
  EEA_EXTRA: ["ISL","LIE","NOR"],
  // Switzerland has bilateral free movement with the EU/EFTA.
  EFTA: ["CHE","ISL","LIE","NOR"],
  // Common Travel Area: UK + Ireland citizens live/work freely in each other.
  CTA: ["GBR","IRL"],
  // Mercosur residency agreement (a 2-year then permanent residence path among members).
  MERCOSUR_RES: ["ARG","BRA","PRY","URY","BOL","CHL","COL","ECU","PER"],
  // Gulf Cooperation Council (free movement of citizens among members).
  GCC: ["SAU","ARE","QAT","KWT","BHR","OMN"],
  // Trans-Tasman: Australia and New Zealand citizens live/work freely in each other.
  TRANS_TASMAN: ["AUS","NZL"],
  // CARICOM single market (skilled-national free movement among members).
  CARICOM: ["ATG","BHS","BRB","BLZ","DMA","GRD","GUY","HTI","JAM","KNA","LCA","VCT","SUR","TTO"],
};

// Coarse passport-strength tier by origin iso3 (visa-free reach band). Used only
// to estimate how easy short-stay/visa access to a destination is when no bloc
// applies. Approximate bands, not a ranked index.
export const PASSPORT_TIER = {
  // very-high: near-global visa-free access
  DEU:"very-high", FRA:"very-high", ITA:"very-high", ESP:"very-high", JPN:"very-high",
  SGP:"very-high", KOR:"very-high", NLD:"very-high", SWE:"very-high", FIN:"very-high",
  LUX:"very-high", AUT:"very-high", CHE:"very-high", IRL:"very-high", PRT:"very-high",
  GBR:"very-high", USA:"very-high", CAN:"very-high", AUS:"very-high", NZL:"very-high",
  NOR:"very-high", DNK:"very-high", BEL:"very-high",
  // high
  EST:"high", CZE:"high", POL:"high", GRC:"high", SVN:"high", MLT:"high", CYP:"high",
  ARE:"high", CHL:"high", URY:"high", ISR:"high", MYS:"high",
  // mid
  ARG:"mid", BRA:"mid", MEX:"mid", CRI:"mid", PAN:"mid", QAT:"mid", KWT:"mid",
  BHR:"mid", MUS:"mid", ZAF:"mid", TUR:"mid", THA:"mid", GEO:"mid", SRB:"mid",
  // low: heavy visa requirements to most high-demand destinations
  CHN:"low", IND:"low", NGA:"low", PAK:"low", EGY:"low", PHL:"low", IDN:"low",
  VNM:"low", BGD:"low", IRN:"low", RUS:"low", LKA:"low", KEN:"low", GHA:"low",
};

export const PASSPORT_TIER_DEFAULT = "mid";

// Membership helpers (used by the client personalization layer).
export function sharesFreeMovement(originIso3, destIso3) {
  const eea = [...BLOCS.EU, ...BLOCS.EEA_EXTRA];
  const groups = [eea, BLOCS.CTA, BLOCS.GCC, BLOCS.TRANS_TASMAN];
  return groups.some((g) => g.includes(originIso3) && g.includes(destIso3));
}

export function sharesResidencyPath(originIso3, destIso3) {
  // Looser than free movement: a privileged residence route exists between members.
  const groups = [BLOCS.MERCOSUR_RES, BLOCS.CARICOM];
  if (groups.some((g) => g.includes(originIso3) && g.includes(destIso3))) return true;
  // EFTA <-> EU residence rights also count as a privileged path.
  const eea = [...BLOCS.EU, ...BLOCS.EEA_EXTRA];
  return eea.includes(originIso3) && eea.includes(destIso3);
}

export function passportTier(originIso3) {
  return PASSPORT_TIER[originIso3] ?? PASSPORT_TIER_DEFAULT;
}
