// Curated relocation/asset/currency "pathway" data for a demand tier of popular
// destinations. Hand-curated, plain .mjs (importable by Node sync-data and the
// browser). Joins to the assessment data by iso3.
//
// IMPORTANT: programs and thresholds change often; the officialUrl portals are
// the authoritative, current source. Capital figures are approximate USD and for
// orientation only. This is general information, NOT legal, financial, or
// immigration advice. Destinations not listed here degrade gracefully in the UI
// ("personalization data not yet available"). No-go states are intentionally
// omitted. No em dashes anywhere in this file.
//
// Shape per entry:
//   { iso3, country, languages:[], demandProfessions:[],
//     immigration:[ {name, type, eligibility:{minCapitalUsd, professions:[], languageReq}, difficulty, timeToPrYears, timeToCitizenshipYears, officialUrl} ],
//     assets:{ foreignPropertyOwnership:"open|restricted|prohibited", foreignSecurities:"open|restricted", nonResidentBrokerage:"yes|hard|no", note, officialUrl },
//     currency:{ capitalAccountOpen:bool, nonResidentBanking:"easy|moderate|hard", fxControls:"none|some|strict", centralBankUrl },
//     credentials:{ note, url },
//     links:{ immigration, investment, centralBank } }
//
// professions clusters: tech, medical, engineering, finance, legal, trades, academic, any.

export const PATHWAYS = {
  PRT: {
    iso3: "PRT", country: "Portugal", languages: ["Portuguese"],
    demandProfessions: ["tech", "medical", "engineering", "academic"],
    immigration: [
      { name: "D8 digital nomad / remote work", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://aima.gov.pt/en" },
      { name: "D7 passive income / retiree", type: "income", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://aima.gov.pt/en" },
      { name: "Golden visa (investment, funds route; real-estate route closed 2023)", type: "investor", eligibility: { minCapitalUsd: 550000, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://aima.gov.pt/en" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "EU member; open property and securities markets.", officialUrl: "https://www.bportugal.pt/en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bportugal.pt/en" },
    credentials: { note: "EU professional-qualifications recognition; regulated professions need formal recognition.", url: "https://aima.gov.pt/en" },
    links: { immigration: "https://aima.gov.pt/en", investment: "https://www.portugalglobal.pt/EN", centralBank: "https://www.bportugal.pt/en" },
  },
  ESP: {
    iso3: "ESP", country: "Spain", languages: ["Spanish"],
    demandProfessions: ["tech", "medical", "engineering", "academic"],
    immigration: [
      { name: "Digital nomad visa", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://www.inclusion.gob.es/" },
      { name: "Non-lucrative visa (passive income)", type: "income", eligibility: { minCapitalUsd: 30000, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://www.inclusion.gob.es/" },
      { name: "Highly qualified professional (work)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "finance"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://www.inclusion.gob.es/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "EU member; golden-visa property route ended 2025, but ownership itself is open.", officialUrl: "https://www.bde.es/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bde.es/" },
    credentials: { note: "EU recognition framework; citizenship needs ~10y residence (2y for Ibero-American origins).", url: "https://www.inclusion.gob.es/" },
    links: { immigration: "https://www.inclusion.gob.es/", investment: "https://www.investinspain.org/en", centralBank: "https://www.bde.es/" },
  },
  IRL: {
    iso3: "IRL", country: "Ireland", languages: ["English", "Irish"],
    demandProfessions: ["tech", "medical", "finance", "engineering"],
    immigration: [
      { name: "Critical Skills Employment Permit", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "medical", "finance", "engineering"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://www.irishimmigration.ie/" },
      { name: "General Employment Permit", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://www.irishimmigration.ie/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open market; English-speaking finance/tech hub.", officialUrl: "https://www.centralbank.ie/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.centralbank.ie/" },
    credentials: { note: "EU recognition; Common Travel Area gives UK citizens automatic live/work rights.", url: "https://www.irishimmigration.ie/" },
    links: { immigration: "https://www.irishimmigration.ie/", investment: "https://www.idaireland.com/", centralBank: "https://www.centralbank.ie/" },
  },
  NLD: {
    iso3: "NLD", country: "Netherlands", languages: ["Dutch", "English"],
    demandProfessions: ["tech", "engineering", "finance", "academic"],
    immigration: [
      { name: "Highly Skilled Migrant", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "finance"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://ind.nl/en" },
      { name: "Self-employed / startup (DAFT for US citizens)", type: "skilled", eligibility: { minCapitalUsd: 5000, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://ind.nl/en" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market; English widely used in business.", officialUrl: "https://www.dnb.nl/en/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.dnb.nl/en/" },
    credentials: { note: "EU recognition; the US-NL Friendship Treaty (DAFT) is an unusually low-capital self-employment route.", url: "https://ind.nl/en" },
    links: { immigration: "https://ind.nl/en", investment: "https://investinholland.com/", centralBank: "https://www.dnb.nl/en/" },
  },
  DEU: {
    iso3: "DEU", country: "Germany", languages: ["German"],
    demandProfessions: ["engineering", "tech", "medical", "trades", "academic"],
    immigration: [
      { name: "EU Blue Card", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "medical", "finance"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 4, timeToCitizenshipYears: 5, officialUrl: "https://www.make-it-in-germany.com/en/" },
      { name: "Opportunity Card (job-seeker, points-based)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://www.make-it-in-germany.com/en/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market.", officialUrl: "https://www.bundesbank.de/en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bundesbank.de/en" },
    credentials: { note: "Recognition required for regulated trades/medical; 2024 law shortened citizenship to ~5y.", url: "https://www.anerkennung-in-deutschland.de/html/en/" },
    links: { immigration: "https://www.make-it-in-germany.com/en/", investment: "https://www.gtai.de/en/", centralBank: "https://www.bundesbank.de/en" },
  },
  EST: {
    iso3: "EST", country: "Estonia", languages: ["Estonian", "English"],
    demandProfessions: ["tech", "finance"],
    immigration: [
      { name: "Digital nomad visa", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 8, officialUrl: "https://www.politsei.ee/en" },
      { name: "Startup / e-Residency company route", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 8, officialUrl: "https://www.e-resident.gov.ee/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market; e-Residency eases company/account setup (not residence).", officialUrl: "https://www.eestipank.ee/en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.eestipank.ee/en" },
    credentials: { note: "EU recognition; Estonian language needed for citizenship.", url: "https://www.politsei.ee/en" },
    links: { immigration: "https://www.politsei.ee/en", investment: "https://investinestonia.com/", centralBank: "https://www.eestipank.ee/en" },
  },
  CHE: {
    iso3: "CHE", country: "Switzerland", languages: ["German", "French", "Italian"],
    demandProfessions: ["finance", "tech", "engineering", "medical"],
    immigration: [
      { name: "EU/EFTA work + residence (free movement)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://www.sem.admin.ch/sem/en/home.html" },
      { name: "Non-EU skilled work permit (quota, employer-sponsored)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["finance", "tech", "engineering", "medical"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 10, timeToCitizenshipYears: 10, officialUrl: "https://www.sem.admin.ch/sem/en/home.html" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Lex Koller restricts non-resident foreign property purchase; securities are open.", officialUrl: "https://www.snb.ch/en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.snb.ch/en" },
    credentials: { note: "Strong recognition for regulated fields; non-EU labor access is quota-limited and hard.", url: "https://www.sem.admin.ch/sem/en/home.html" },
    links: { immigration: "https://www.sem.admin.ch/sem/en/home.html", investment: "https://www.s-ge.com/en", centralBank: "https://www.snb.ch/en" },
  },
  SWE: {
    iso3: "SWE", country: "Sweden", languages: ["Swedish", "English"],
    demandProfessions: ["tech", "engineering", "medical", "academic"],
    immigration: [
      { name: "Work permit (employer-sponsored)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "medical"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 4, timeToCitizenshipYears: 5, officialUrl: "https://www.migrationsverket.se/English.html" },
      { name: "EU Blue Card", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "finance"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 4, timeToCitizenshipYears: 5, officialUrl: "https://www.migrationsverket.se/English.html" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market; English widely spoken.", officialUrl: "https://www.riksbank.se/en-gb/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.riksbank.se/en-gb/" },
    credentials: { note: "EU recognition; salary/insurance thresholds apply to work permits.", url: "https://www.migrationsverket.se/English.html" },
    links: { immigration: "https://www.migrationsverket.se/English.html", investment: "https://investsweden.com/", centralBank: "https://www.riksbank.se/en-gb/" },
  },
  ITA: {
    iso3: "ITA", country: "Italy", languages: ["Italian"],
    demandProfessions: ["tech", "engineering", "academic", "medical"],
    immigration: [
      { name: "Digital nomad / remote work visa", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://vistoperitalia.esteri.it/home/en" },
      { name: "Elective residence (passive income)", type: "income", eligibility: { minCapitalUsd: 35000, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 10, officialUrl: "https://vistoperitalia.esteri.it/home/en" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market; citizenship by descent (jure sanguinis) possible for many.", officialUrl: "https://www.bancaditalia.it/?lang=en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bancaditalia.it/?lang=en" },
    credentials: { note: "EU recognition; ancestry (jure sanguinis) is a strong route for those with Italian-born ancestors.", url: "https://vistoperitalia.esteri.it/home/en" },
    links: { immigration: "https://vistoperitalia.esteri.it/home/en", investment: "https://www.ice.it/en", centralBank: "https://www.bancaditalia.it/?lang=en" },
  },
  GRC: {
    iso3: "GRC", country: "Greece", languages: ["Greek"],
    demandProfessions: ["tech", "academic", "any"],
    immigration: [
      { name: "Digital nomad visa", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 7, timeToCitizenshipYears: 7, officialUrl: "https://www.migration.gov.gr/en/" },
      { name: "Golden visa (real-estate investment)", type: "investor", eligibility: { minCapitalUsd: 280000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 0, timeToCitizenshipYears: 7, officialUrl: "https://www.migration.gov.gr/en/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open EU market; golden-visa thresholds raised in prime areas.", officialUrl: "https://www.bankofgreece.gr/en" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bankofgreece.gr/en" },
    credentials: { note: "EU recognition; Greek language needed for citizenship.", url: "https://www.migration.gov.gr/en/" },
    links: { immigration: "https://www.migration.gov.gr/en/", investment: "https://www.enterprisegreece.gov.gr/en/", centralBank: "https://www.bankofgreece.gr/en" },
  },
  CAN: {
    iso3: "CAN", country: "Canada", languages: ["English", "French"],
    demandProfessions: ["tech", "medical", "engineering", "trades", "finance"],
    immigration: [
      { name: "Express Entry (Federal Skilled Worker, points-based)", type: "skilled", eligibility: { minCapitalUsd: 10000, professions: ["tech", "medical", "engineering", "finance"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 0, timeToCitizenshipYears: 3, officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
      { name: "Provincial Nominee Programs", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 0, timeToCitizenshipYears: 3, officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
      { name: "Start-up Visa (entrepreneur)", type: "investor", eligibility: { minCapitalUsd: 150000, professions: ["tech"], languageReq: "basic" }, difficulty: "hard", timeToPrYears: 0, timeToCitizenshipYears: 3, officialUrl: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "A temporary foreign-buyer ban on some residential property applies; securities are open.", officialUrl: "https://www.bankofcanada.ca/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "easy", fxControls: "none", centralBankUrl: "https://www.bankofcanada.ca/" },
    credentials: { note: "Regulated professions (medical/legal/engineering) need provincial credential assessment; English/French scored in Express Entry.", url: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
    lottery: [{ name: "Parents and Grandparents Program (PGP)", note: "Sponsorship invitations are drawn by lottery from a pool of submitted interest-to-sponsor forms.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship/sponsor-parents-grandparents.html" }],
    licensing: {
      medical: { note: "Provincial colleges plus the Medical Council of Canada (MCCQE); credential assessment required.", url: "https://mcc.ca/" },
      engineering: { note: "Provincial associations (e.g. PEO) license P.Eng after academic and exam assessment.", url: "https://engineerscanada.ca/" },
    },
    links: { immigration: "https://www.canada.ca/en/immigration-refugees-citizenship.html", investment: "https://www.investcanada.ca/", centralBank: "https://www.bankofcanada.ca/" },
  },
  MEX: {
    iso3: "MEX", country: "Mexico", languages: ["Spanish"],
    demandProfessions: ["tech", "any"],
    immigration: [
      { name: "Temporary resident (income/savings)", type: "income", eligibility: { minCapitalUsd: 45000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 4, timeToCitizenshipYears: 5, officialUrl: "https://www.gob.mx/inm" },
      { name: "Permanent resident (higher savings / family)", type: "income", eligibility: { minCapitalUsd: 180000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 0, timeToCitizenshipYears: 5, officialUrl: "https://www.gob.mx/inm" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Coast/border 'restricted zone' property is held via a bank trust (fideicomiso); elsewhere open.", officialUrl: "https://www.banxico.org.mx/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.banxico.org.mx/" },
    credentials: { note: "Spanish helpful; nearshoring is lifting demand for engineering/tech.", url: "https://www.gob.mx/inm" },
    links: { immigration: "https://www.gob.mx/inm", investment: "https://www.gob.mx/se", centralBank: "https://www.banxico.org.mx/" },
  },
  URY: {
    iso3: "URY", country: "Uruguay", languages: ["Spanish"],
    demandProfessions: ["tech", "finance", "any"],
    immigration: [
      { name: "Residence by income / pension", type: "income", eligibility: { minCapitalUsd: 18000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 0, timeToCitizenshipYears: 3, officialUrl: "https://migracion.minterior.gub.uy/" },
      { name: "Mercosur residence (regional nationals)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 2, timeToCitizenshipYears: 3, officialUrl: "https://migracion.minterior.gub.uy/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Very open to foreign owners; stable, low-corruption regional leader.", officialUrl: "https://www.bcu.gub.uy/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bcu.gub.uy/" },
    credentials: { note: "Spanish needed; territorial tax regime is attractive for new residents.", url: "https://migracion.minterior.gub.uy/" },
    links: { immigration: "https://migracion.minterior.gub.uy/", investment: "https://www.uruguayxxi.gub.uy/en/", centralBank: "https://www.bcu.gub.uy/" },
  },
  CRI: {
    iso3: "CRI", country: "Costa Rica", languages: ["Spanish"],
    demandProfessions: ["tech", "any"],
    immigration: [
      { name: "Rentista (guaranteed income)", type: "income", eligibility: { minCapitalUsd: 30000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 3, timeToCitizenshipYears: 7, officialUrl: "https://www.migracion.go.cr/" },
      { name: "Digital nomad visa", type: "digital-nomad", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 3, timeToCitizenshipYears: 7, officialUrl: "https://www.migracion.go.cr/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Foreigners can own property outright (some maritime-zone limits).", officialUrl: "https://www.bccr.fi.cr/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bccr.fi.cr/" },
    credentials: { note: "Spanish helpful; stable democracy with no standing army.", url: "https://www.migracion.go.cr/" },
    links: { immigration: "https://www.migracion.go.cr/", investment: "https://www.cinde.org/en", centralBank: "https://www.bccr.fi.cr/" },
  },
  AUS: {
    iso3: "AUS", country: "Australia", languages: ["English"],
    demandProfessions: ["medical", "engineering", "tech", "trades", "academic"],
    immigration: [
      { name: "Skilled Independent (points-based, skills list)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["medical", "engineering", "tech", "trades"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 0, timeToCitizenshipYears: 4, officialUrl: "https://immi.homeaffairs.gov.au/" },
      { name: "Employer-sponsored (Skills in Demand)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 2, timeToCitizenshipYears: 4, officialUrl: "https://immi.homeaffairs.gov.au/" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "FIRB approval required; non-residents largely limited to new dwellings. Securities open.", officialUrl: "https://www.rba.gov.au/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.rba.gov.au/" },
    credentials: { note: "Regulated professions need skills assessment by the relevant authority; English testing applies.", url: "https://immi.homeaffairs.gov.au/" },
    links: { immigration: "https://immi.homeaffairs.gov.au/", investment: "https://www.globalaustralia.gov.au/", centralBank: "https://www.rba.gov.au/" },
  },
  NZL: {
    iso3: "NZL", country: "New Zealand", languages: ["English"],
    demandProfessions: ["medical", "engineering", "tech", "trades"],
    immigration: [
      { name: "Skilled Migrant Category (points)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["medical", "engineering", "tech", "trades"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 2, timeToCitizenshipYears: 5, officialUrl: "https://www.immigration.govt.nz/" },
      { name: "Accredited Employer Work Visa", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 2, timeToCitizenshipYears: 5, officialUrl: "https://www.immigration.govt.nz/" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Overseas Investment Act largely bars non-residents from buying existing homes. Securities open.", officialUrl: "https://www.rbnz.govt.nz/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.rbnz.govt.nz/" },
    credentials: { note: "Skills assessment for regulated fields; trans-Tasman rights for Australians.", url: "https://www.immigration.govt.nz/" },
    links: { immigration: "https://www.immigration.govt.nz/", investment: "https://www.nzte.govt.nz/", centralBank: "https://www.rbnz.govt.nz/" },
  },
  SGP: {
    iso3: "SGP", country: "Singapore", languages: ["English", "Mandarin", "Malay", "Tamil"],
    demandProfessions: ["finance", "tech", "engineering", "medical"],
    immigration: [
      { name: "Employment Pass (high-salary professionals, COMPASS)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["finance", "tech", "engineering"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 2, timeToCitizenshipYears: 4, officialUrl: "https://www.mom.gov.sg/" },
      { name: "ONE Pass (top-tier talent)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["finance", "tech"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 2, timeToCitizenshipYears: 4, officialUrl: "https://www.mom.gov.sg/" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Heavy Additional Buyer's Stamp Duty on foreigners; landed property restricted. Securities fully open.", officialUrl: "https://www.mas.gov.sg/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.mas.gov.sg/" },
    credentials: { note: "English-medium; PR and citizenship are selective with a limited path to belonging.", url: "https://www.ica.gov.sg/" },
    links: { immigration: "https://www.mom.gov.sg/", investment: "https://www.edb.gov.sg/", centralBank: "https://www.mas.gov.sg/" },
  },
  JPN: {
    iso3: "JPN", country: "Japan", languages: ["Japanese"],
    demandProfessions: ["tech", "engineering", "academic", "any"],
    immigration: [
      { name: "Highly Skilled Professional (points)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "finance", "academic"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 1, timeToCitizenshipYears: 5, officialUrl: "https://www.isa.go.jp/en/" },
      { name: "Engineer / Specialist in Humanities work visa", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "any"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 5, officialUrl: "https://www.isa.go.jp/en/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Foreigners may own freehold property; financing without residence is harder.", officialUrl: "https://www.boj.or.jp/en/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.boj.or.jp/en/" },
    credentials: { note: "Japanese language strongly aids settlement; the HSP route fast-tracks PR.", url: "https://www.isa.go.jp/en/" },
    links: { immigration: "https://www.isa.go.jp/en/", investment: "https://www.jetro.go.jp/en/", centralBank: "https://www.boj.or.jp/en/" },
  },
  ARE: {
    iso3: "ARE", country: "United Arab Emirates", languages: ["Arabic", "English"],
    demandProfessions: ["finance", "tech", "engineering", "medical"],
    immigration: [
      { name: "Golden Visa (talent / investor, 10y)", type: "investor", eligibility: { minCapitalUsd: 540000, professions: ["finance", "tech", "medical", "any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 0, timeToCitizenshipYears: 30, officialUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
      { name: "Employer-sponsored work residence", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 0, timeToCitizenshipYears: 30, officialUrl: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Freehold ownership in designated zones; no personal income tax. Citizenship is very rare.", officialUrl: "https://www.centralbank.ae/en/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.centralbank.ae/en/" },
    credentials: { note: "English-friendly business hub; residence is renewable but a path to citizenship is essentially closed.", url: "https://u.ae/en/information-and-services/visa-and-emirates-id" },
    links: { immigration: "https://u.ae/en/information-and-services/visa-and-emirates-id", investment: "https://www.investuae.gov.ae/", centralBank: "https://www.centralbank.ae/en/" },
  },
  MUS: {
    iso3: "MUS", country: "Mauritius", languages: ["English", "French"],
    demandProfessions: ["finance", "tech", "any"],
    immigration: [
      { name: "Occupation Permit (professional / investor)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["finance", "tech", "any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 3, timeToCitizenshipYears: 7, officialUrl: "https://edbmauritius.org/" },
      { name: "Premium / retiree residence", type: "income", eligibility: { minCapitalUsd: 18000, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 3, timeToCitizenshipYears: 7, officialUrl: "https://edbmauritius.org/" },
    ],
    assets: { foreignPropertyOwnership: "restricted", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Foreign property purchase limited to approved schemes (PDS/IRS); securities open.", officialUrl: "https://www.bom.mu/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "easy", fxControls: "none", centralBankUrl: "https://www.bom.mu/" },
    credentials: { note: "English/French-speaking; stable, well-governed financial hub and Africa's regional leader.", url: "https://edbmauritius.org/" },
    links: { immigration: "https://edbmauritius.org/", investment: "https://edbmauritius.org/", centralBank: "https://www.bom.mu/" },
  },
  CHL: {
    iso3: "CHL", country: "Chile", languages: ["Spanish"],
    demandProfessions: ["tech", "engineering", "medical", "any"],
    immigration: [
      { name: "Temporary residence (work / professional)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "medical"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 2, timeToCitizenshipYears: 5, officialUrl: "https://serviciomigraciones.cl/" },
      { name: "Mercosur residence (regional nationals)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["any"], languageReq: "none" }, difficulty: "easy", timeToPrYears: 2, timeToCitizenshipYears: 5, officialUrl: "https://serviciomigraciones.cl/" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open to foreign owners; most stable economy in the region.", officialUrl: "https://www.bcentral.cl/en/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bcentral.cl/en/" },
    credentials: { note: "Spanish needed; regulated professions require revalidation of degrees.", url: "https://serviciomigraciones.cl/" },
    links: { immigration: "https://serviciomigraciones.cl/", investment: "https://www.investchile.gob.cl/", centralBank: "https://www.bcentral.cl/en/" },
  },
  USA: {
    iso3: "USA", country: "United States", languages: ["English"],
    demandProfessions: ["tech", "medical", "engineering", "finance", "academic"],
    immigration: [
      { name: "H-1B specialty worker (annual lottery)", type: "lottery", eligibility: { minCapitalUsd: 0, professions: ["tech", "engineering", "finance", "medical", "academic"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 5, timeToCitizenshipYears: 6, officialUrl: "https://www.uscis.gov/working-in-the-united-states/h-1b-specialty-occupations" },
      { name: "O-1 extraordinary ability", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "academic", "any"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 5, timeToCitizenshipYears: 6, officialUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/o-1-visa-individuals-with-extraordinary-ability-or-achievement" },
      { name: "EB employment-based green card", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "medical", "engineering", "finance"], languageReq: "none" }, difficulty: "hard", timeToPrYears: 0, timeToCitizenshipYears: 5, officialUrl: "https://www.uscis.gov/green-card/green-card-eligibility/green-card-for-employment-based-immigrants" },
      { name: "EB-5 investor", type: "investor", eligibility: { minCapitalUsd: 800000, professions: ["any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 0, timeToCitizenshipYears: 5, officialUrl: "https://www.uscis.gov/working-in-the-united-states/permanent-workers/eb-5-immigrant-investor-program" },
    ],
    lottery: [{ name: "Diversity Visa (DV) lottery", note: "About 55,000 green cards a year by random draw, for nationals of under-represented countries (most high-volume origins are excluded).", url: "https://travel.state.gov/content/travel/en/us-visas/immigrate/diversity-visa-program-entry.html", pastResultsUrl: "https://www.usa.gov/dv-lottery-results" }],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Foreigners can own property and securities freely; deepest, most liquid markets.", officialUrl: "https://www.federalreserve.gov/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.federalreserve.gov/" },
    credentials: { note: "State-by-state licensing for regulated professions; foreign medical graduates certify via ECFMG before a US residency.", url: "https://www.uscis.gov/working-in-the-united-states" },
    licensing: {
      medical: { note: "ECFMG certification plus USMLE, then a US residency and a state medical board license.", url: "https://www.ecfmg.org/" },
      legal: { note: "Admission is state-by-state; most states require a US JD or an LLM plus the state bar exam.", url: "https://www.americanbar.org/" },
      engineering: { note: "PE licensure via NCEES exams, state-administered; many roles do not require a PE.", url: "https://ncees.org/" },
    },
    links: { immigration: "https://www.uscis.gov/", investment: "https://www.selectusa.gov/", centralBank: "https://www.federalreserve.gov/" },
  },
  GBR: {
    iso3: "GBR", country: "United Kingdom", languages: ["English"],
    demandProfessions: ["tech", "medical", "finance", "engineering", "academic"],
    immigration: [
      { name: "Skilled Worker visa (sponsored)", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "medical", "engineering", "finance"], languageReq: "basic" }, difficulty: "moderate", timeToPrYears: 5, timeToCitizenshipYears: 6, officialUrl: "https://www.gov.uk/skilled-worker-visa" },
      { name: "Global Talent visa", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["tech", "academic", "any"], languageReq: "none" }, difficulty: "moderate", timeToPrYears: 3, timeToCitizenshipYears: 6, officialUrl: "https://www.gov.uk/global-talent" },
      { name: "Health and Care Worker visa", type: "skilled", eligibility: { minCapitalUsd: 0, professions: ["medical"], languageReq: "basic" }, difficulty: "easy", timeToPrYears: 5, timeToCitizenshipYears: 6, officialUrl: "https://www.gov.uk/health-care-worker-visa" },
      { name: "Innovator Founder visa", type: "investor", eligibility: { minCapitalUsd: 0, professions: ["tech", "any"], languageReq: "basic" }, difficulty: "hard", timeToPrYears: 3, timeToCitizenshipYears: 6, officialUrl: "https://www.gov.uk/innovator-founder-visa" },
    ],
    assets: { foreignPropertyOwnership: "open", foreignSecurities: "open", nonResidentBrokerage: "yes", note: "Open property and securities markets; a deep global financial center.", officialUrl: "https://www.bankofengland.co.uk/" },
    currency: { capitalAccountOpen: true, nonResidentBanking: "moderate", fxControls: "none", centralBankUrl: "https://www.bankofengland.co.uk/" },
    credentials: { note: "Regulated professions need UK body recognition; the Common Travel Area gives Irish citizens automatic rights.", url: "https://www.gov.uk/browse/visas-immigration" },
    licensing: {
      medical: { note: "GMC registration (often via PLAB or an approved route) is required to practise.", url: "https://www.gmc-uk.org/" },
      legal: { note: "Solicitors qualify via the SRA (SQE route); barristers via the Bar.", url: "https://www.sra.org.uk/" },
      engineering: { note: "Chartered status via the Engineering Council and a licensed institution.", url: "https://www.engc.org.uk/" },
    },
    links: { immigration: "https://www.gov.uk/browse/visas-immigration", investment: "https://www.great.gov.uk/international/", centralBank: "https://www.bankofengland.co.uk/" },
  },
};
