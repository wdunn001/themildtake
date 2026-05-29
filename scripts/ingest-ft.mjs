// Ingest FT pulls from the pidscraper cache into research/ft/.
// Reads ../pidscraper/output/ft/*.json (override with FT_OUTPUT_DIR or argv[2]),
// writes one citation-grade research/ft/<sha1>.md per article (metadata + a capped
// excerpt + the cache pointer) and updates research/ft/manifest.json. Full article
// text is NOT copied into the repo (copyright) — only a short excerpt for citation.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.FT_OUTPUT_DIR || process.argv[2] || resolve(REPO, "..", "pidscraper", "output", "ft");
const DEST = join(REPO, "research", "ft");
const MANIFEST = join(DEST, "manifest.json");
const EXCERPT = 600;

if (!existsSync(SRC)) {
  console.error(`[ingest-ft] source not found: ${SRC}\n  Run the scraper first (see research/ft/README.md), or pass the path as an argument.`);
  process.exit(1);
}
mkdirSync(DEST, { recursive: true });

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { articles: [] };
const byUrl = new Map(manifest.articles.map((a) => [a.url, a]));

let ingested = 0, skipped = 0;
for (const f of readdirSync(SRC).filter((f) => f.endsWith(".json"))) {
  const sha = f.replace(/\.json$/, "");
  const rec = JSON.parse(readFileSync(join(SRC, f), "utf8"));
  if (rec.challenged) { console.warn(`[ingest-ft] SKIP (cloudflare-challenged): ${rec.url}`); skipped++; continue; }
  const text = (rec.text || "").replace(/\s+/g, " ").trim();
  const excerpt = text.slice(0, EXCERPT) + (text.length > EXCERPT ? " …" : "");
  const note = `---
title: ${JSON.stringify(rec.title || "")}
url: ${rec.url}
author: ${JSON.stringify(rec.author || "")}
date: ${JSON.stringify(rec.date || "")}
fetched_at: ${rec.fetched_at || ""}
chars: ${rec.chars ?? text.length}
paywalled: ${!!rec.paywalled}
source: FT
iso3: ${(byUrl.get(rec.url)?.iso3) ? JSON.stringify(byUrl.get(rec.url).iso3) : "null"}
cache: ../../../pidscraper/output/ft/${f}
---

# ${rec.title || "(untitled)"}

${rec.standfirst ? rec.standfirst + "\n\n" : ""}**Excerpt (first ${EXCERPT} chars, for citation only):**

> ${excerpt}

_Full text is not stored in-repo (copyright); see the cache pointer above. Cite as e.g. (FT ${rec.date || (rec.fetched_at || "").slice(0, 10)})._
`;
  writeFileSync(join(DEST, `${sha}.md`), note);
  const entry = {
    sha1: sha, url: rec.url, title: rec.title || "", author: rec.author || "",
    date: rec.date || "", fetched_at: rec.fetched_at || "", chars: rec.chars ?? text.length,
    paywalled: !!rec.paywalled, iso3: byUrl.get(rec.url)?.iso3 ?? null, note_file: `${sha}.md`,
  };
  if (byUrl.has(rec.url)) Object.assign(byUrl.get(rec.url), entry);
  else { manifest.articles.push(entry); byUrl.set(rec.url, entry); }
  ingested++;
  if (rec.paywalled) console.warn(`[ingest-ft] WARN (looks paywalled — session may have lapsed): ${rec.url}`);
}

manifest.articles.sort((a, b) => (a.iso3 || "ZZZ").localeCompare(b.iso3 || "ZZZ"));
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[ingest-ft] ingested ${ingested}, skipped ${skipped}; manifest now ${manifest.articles.length} articles → ${MANIFEST}`);
