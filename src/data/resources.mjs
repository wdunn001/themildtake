// Curated external resources that inform the methodology, shared by the
// Resources page (static cards) and scripts/sync-data.mjs (best-effort RSS
// snapshot). Plain .mjs so both Vite/Astro and Node can import it.
//
// Source discipline (v2.0): triangulate across a deliberately DIVERSE,
// multi-regional, multi-lingual set of INDEPENDENT sources. The hard exclusion
// rule is applied UNIFORMLY — government-controlled outlets are out for the
// country that controls them, and that includes Western state broadcasters
// (e.g. VOA / Radio Free Asia are US-government-funded) on their own state, not
// only adversary state media. Ownership tilt (Gulf-owned pan-Arab, oligarch-
// owned) is a slant flag, not automatic exclusion.

export const RESOURCES = [
  {
    id: "ground-news",
    name: "Ground News",
    url: "https://ground.news/",
    role: "Bias & coverage check",
    description:
      "A quick way to see how a story splits across the political spectrum and to check an outlet's bias/factuality. One input among many — triangulate against the multilateral indices and the independent press below rather than treating any single aggregator as the gate.",
    feed: null,
  },
  // ── Multilateral / language-neutral references (reduce Anglophone bias by design) ──
  {
    id: "vdem",
    name: "V-Dem",
    url: "https://www.v-dem.net/",
    role: "Democracy data",
    kind: "index",
    description:
      "Varieties of Democracy — Gothenburg-based, with a global network of multilingual country experts. The backbone reference for rule-of-law, civil-liberties, and institutional trajectory scoring.",
    feed: null,
  },
  {
    id: "wjp",
    name: "World Justice Project",
    url: "https://worldjusticeproject.org/rule-of-law-index/",
    role: "Rule of law",
    kind: "index",
    description: "Rule of Law Index — survey-based, cross-national, independent of any single government. Anchors the institutional category.",
    feed: null,
  },
  {
    id: "rsf",
    name: "Reporters Without Borders",
    url: "https://rsf.org/en",
    role: "Press freedom",
    kind: "index",
    description: "RSF (Paris) — World Press Freedom Index, French/global. Anchors press-freedom scoring and helps rate whether a country's own media can be trusted on itself.",
    feed: null,
  },
  {
    id: "transparency",
    name: "Transparency International",
    url: "https://www.transparency.org/en/cpi",
    role: "Corruption",
    kind: "index",
    description: "Corruption Perceptions Index (Berlin-HQ, global chapters). Cross-checks institutional capture and the integrity dimension.",
    feed: null,
  },
  {
    id: "imf",
    name: "IMF",
    url: "https://www.imf.org/en/Publications/SPROLLs/Article-iv-staff-reports",
    role: "Independent macro",
    kind: "index",
    description: "Article IV staff reports and COFER reserve data — independent of the country being assessed, the cleanest way around state-self-reported fiscal/growth figures.",
    feed: null,
  },
  {
    id: "bellingcat",
    name: "Bellingcat",
    url: "https://www.bellingcat.com/",
    role: "Open-source investigation",
    kind: "investigative",
    description: "Amsterdam-based open-source (OSINT) collective — geolocation, flight/ship tracking, satellite and social-media verification. Independent, methods-transparent, and language-agnostic: the gold standard for verifying conflict, sanctions-evasion, and state-violence claims from primary evidence rather than any outlet's framing.",
    feed: { url: "https://www.bellingcat.com/feed/", label: "latest investigations" },
  },
  {
    id: "occrp",
    name: "OCCRP",
    url: "https://www.occrp.org/en",
    role: "Cross-border investigative",
    kind: "investigative",
    description: "Organized Crime and Corruption Reporting Project — a multilingual network of local investigative outlets across regions; built to defeat single-country/single-language blind spots. The network behind much cross-border corruption and state-capture reporting.",
    feed: { url: "https://www.occrp.org/en/feed", label: "investigations" },
  },
  {
    id: "icij",
    name: "ICIJ",
    url: "https://www.icij.org/",
    role: "Cross-border investigative",
    kind: "investigative",
    description: "International Consortium of Investigative Journalists — the network behind the Panama and Pandora Papers; pools 100+ outlets across languages and borders to expose offshore finance, corruption, and elite capture.",
    feed: { url: "https://www.icij.org/feed/", label: "investigations" },
  },
  // ── Tools & feeds ──
  {
    id: "integrity-index",
    name: "Integrity Index",
    url: "https://integrityindex.us/",
    role: "Congressional integrity",
    description:
      "Integrity grades for every member of Congress and 2026 candidate, built from FEC filings, STOCK Act trades, PAC money, lobbying ties, and conflict-of-interest signals. No public API.",
    feed: { url: "https://stockingthecapitol.substack.com/feed", label: "Stocking the Capitol updates" },
  },
  {
    id: "fivethirtyeight",
    name: "FiveThirtyEight data",
    url: "https://github.com/fivethirtyeight/data",
    role: "Open datasets",
    description:
      "The data and code behind FiveThirtyEight's articles (CC-BY-4.0). We watch the repository's commit feed to know when an underlying dataset has changed.",
    feed: { url: "https://github.com/fivethirtyeight/data/commits/master.atom", label: "data repo commits" },
  },
  {
    id: "snopes",
    name: "Snopes",
    url: "https://www.snopes.com/",
    role: "Fact-check",
    description:
      "Long-running fact-checking reference for rumors, viral claims, and misinformation — a quick gut-check before a claim is treated as fact.",
    feed: { url: "https://www.snopes.com/feed/", label: "latest fact-checks" },
  },
];

// Independent (NON-government-controlled) press by language. The rule: prefer
// the language of the place, plus a neighbor's or rival's language, plus a
// multilateral. "Excluded" lists are state-controlled and out for their own
// country; "tilt" means usable but flag the ownership slant.
export const INDEPENDENT_PRESS_BY_LANGUAGE = [
  {
    language: "English",
    use: "US, UK, global wires — strongest for markets/macro; watch US ownership capture",
    note: "US media ownership has concentrated toward administration-aligned owners in the last year (e.g. CBS/Paramount via the Skydance–Ellison acquisition, with board/editorial appointees close to the administration). Treat such captured US outlets as ownership-tilted (partially-entangled) on US politics, not neutral — lean on the global wires and non-Anglophone press instead.",
    independent: ["Reuters (London, wire)", "Associated Press (NYC, wire)", "The Guardian (London)", "BBC (London, public, arm's-length)", "The Economist (London)"],
    tilt: ["CBS / Paramount (US, Skydance–Ellison-owned, administration-aligned)", "most US cable/network news (concentrated ownership — flag the proprietor's tilt)"],
    excluded: ["VOA / Radio Free Asia / RFE-RL (US-government-funded — out on the US under the uniform rule)"],
  },
  {
    language: "Spanish",
    use: "Mexico, Latin America, Spain",
    independent: ["Animal Político (Mexico City)", "Aristegui Noticias (Mexico City)", "Proceso (Mexico City)", "El Faro (El Salvador → relocated to Costa Rica 2023)", "Ojo Público (Lima)", "elDiario.es (Madrid)", "CONNECTAS (Bogotá hub)"],
    excluded: ["TeleSUR (VE state)", "Granma / Prensa Latina (CU state)"],
  },
  {
    language: "Arabic",
    use: "MENA, Gulf, Iran-adjacent",
    independent: ["Mada Masr (Cairo, often blocked)", "Daraj (Beirut)", "Nawaat (Tunis)", "Inkyfada (Tunis)", "ARIJ network (Amman)"],
    tilt: ["Al Jazeera (Doha, Qatari-owned)", "Asharq / Al Arabiya (Dubai/Riyadh, Saudi-owned)"],
    excluded: ["SANA (SY state)", "IRNA / Press TV (IR state)", "SPA (SA state)", "Al-Ahram (EG state)"],
  },
  {
    language: "Mandarin / Chinese",
    use: "China — no neutral Mandarin-first free press exists (see note)",
    note: "Mainland media is state-controlled; Hong Kong's free press was dismantled after the 2020 National Security Law (Apple Daily, Stand News gone). Taiwan is the ONLY Mandarin-first free press — but it is existentially threatened by Beijing, so on China specifically it carries an anti-CCP slant. Net: for China, lean on diaspora/exile Mandarin + Japanese/Korean coverage + partner customs data + multilateral indices, not Mandarin media alone.",
    independent: ["Initium Media 端傳媒 (founded HK → Singapore, exile)", "China Digital Times (Berkeley, US — diaspora)"],
    tilt: ["Taiwan press — CommonWealth 天下, CNA, UDN (Taipei): free, but anti-CCP slant ON CHINA", "Caixin 財新 (Beijing): best mainland economic, but partially-entangled"],
    excluded: ["Xinhua, People's Daily, Global Times, CGTN (CCP state)", "Hong Kong post-NSL outlets (free press dismantled)", "RFA & VOA Chinese (US-gov-funded — out under the uniform rule)"],
  },
  {
    language: "Russian",
    use: "Russia, Ukraine, Central Asia — EXILE outlets only (flag émigré/oppositional slant + no on-the-ground access)",
    independent: ["Meduza (Riga, Latvia)", "Novaya Gazeta Europe (relocated EU)", "The Moscow Times (Amsterdam)", "iStories (relocated EU)", "Mediazona (distributed/exile)"],
    excluded: ["TASS, RT, RIA Novosti, Sputnik (RU state)"],
  },
  {
    language: "Ukrainian",
    use: "Ukraine (flag the natural pro-Ukraine lean)",
    independent: ["Ukrainska Pravda (Kyiv)", "Kyiv Independent (Kyiv, English)", "NV.ua (Kyiv)", "Hromadske (Kyiv)"],
    excluded: [],
  },
  {
    language: "French",
    use: "EU, Francophone Africa, Québec",
    independent: ["Le Monde (Paris)", "Mediapart (Paris)", "AFP (Paris, wire)", "Le Devoir (Montréal, QC)"],
    tilt: ["RFI / France 24 (Paris, public, arm's-length)"],
    excluded: [],
  },
  {
    language: "German",
    use: "EU economy & institutions",
    independent: ["Der Spiegel (Hamburg)", "Süddeutsche Zeitung (Munich)", "FAZ (Frankfurt)"],
    tilt: ["Deutsche Welle (Bonn, public, arm's-length)"],
    excluded: [],
  },
  {
    language: "Japanese / Korean",
    use: "China & Asian supply chains (strong independent lens on China)",
    independent: ["Nikkei Asia (Tokyo)", "Asahi Shimbun (Tokyo)", "Hankyoreh (Seoul)", "Korea Economic Daily (Seoul)"],
    excluded: [],
  },
  {
    language: "Swedish / Nordic",
    use: "Sweden",
    independent: ["Dagens Nyheter (Stockholm)", "SVT / Sveriges Radio (Stockholm, public)", "The Local Sweden (Stockholm, English)"],
    excluded: [],
  },
  {
    language: "Portuguese / Hindi",
    use: "Brazil, India, Global South",
    independent: ["Agência Pública (São Paulo)", "Folha de S.Paulo (São Paulo)", "Scroll.in (Mumbai)", "The Wire (New Delhi)"],
    excluded: [],
  },
];
