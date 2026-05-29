// Prebuild step: copy the canonical assessment data into public/data/ so the
// ratings app can fetch it at runtime from static hosting. The repo root is the
// single source of truth; public/data/ is generated and gitignored.
//
// Assessment files are named by country slug (e.g. united-states.json) but the
// ratings pages key off ISO3 (USA). We read each file's `iso3` and write it as
// <iso3-lowercase>.json so /data/assessments/<iso3>.json resolves.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";
import { RESOURCES } from "../src/data/resources.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");

const FEED_ITEM_LIMIT = 5;
const FEED_TIMEOUT_MS = 7000;
const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) themildtake-feedbot/1.0";

const srcAssessmentsDir = path.join(repoRoot, "assessments");
const srcComparisonIndex = path.join(repoRoot, "_comparison-index.json");
const srcSchema = path.join(repoRoot, "schema.json");

const outDir = path.join(repoRoot, "public", "data");
const outAssessmentsDir = path.join(outDir, "assessments");

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, "utf8"));
}

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

function asArray(v) {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

// Decode HTML entities left in feed titles. WordPress/Substack feeds often
// double-encode (the XML carries `&amp;#8217;`), so after XML parsing a literal
// `&#8217;` / `&#038;` remains; decode numeric refs + the common named ones.
function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&"); // last, so we don't re-introduce entities
}

function textOf(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") return String(v["#text"] ?? v["@_term"] ?? "");
  return String(v);
}

function atomLink(link) {
  const links = asArray(link);
  const alt = links.find((l) => l && typeof l === "object" && (l["@_rel"] === "alternate" || !l["@_rel"]));
  const chosen = alt ?? links[0];
  if (!chosen) return undefined;
  return typeof chosen === "string" ? chosen : chosen["@_href"];
}

/** Normalize an RSS 2.0 or Atom document into {title, link, date} items. */
function normalizeFeed(body) {
  const doc = xml.parse(body);
  if (doc?.rss?.channel) {
    return asArray(doc.rss.channel.item).map((i) => ({
      title: decodeEntities(textOf(i.title).trim()),
      link: decodeEntities(typeof i.link === "string" ? i.link : i.link?.["@_href"]),
      date: i.pubDate ?? i.published ?? null,
    }));
  }
  if (doc?.feed) {
    return asArray(doc.feed.entry).map((e) => ({
      title: decodeEntities(textOf(e.title).trim()),
      link: decodeEntities(atomLink(e.link)),
      date: e.updated ?? e.published ?? null,
    }));
  }
  return [];
}

async function fetchFeed(resource) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FEED_TIMEOUT_MS);
  try {
    const res = await fetch(resource.feed.url, {
      signal: controller.signal,
      headers: { "user-agent": BROWSER_UA, accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.text();
    const items = normalizeFeed(body).slice(0, FEED_ITEM_LIMIT);
    return { ok: true, label: resource.feed.label, url: resource.feed.url, items };
  } catch (err) {
    return { ok: false, label: resource.feed.label, url: resource.feed.url, items: [], error: String(err?.message ?? err) };
  } finally {
    clearTimeout(timer);
  }
}

// Best-effort RSS/Atom snapshot so the Resources page can show whether anything
// changed. Never throws: a blocked/slow feed degrades to an empty source entry.
async function snapshotFeeds(outDir) {
  const withFeeds = RESOURCES.filter((r) => r.feed?.url);
  const sources = {};
  if (process.env.SKIP_FEEDS === "1") {
    for (const r of withFeeds) sources[r.id] = { ok: false, skipped: true, label: r.feed.label, url: r.feed.url, items: [] };
    console.log("sync-data: SKIP_FEEDS=1, wrote empty feed snapshot");
  } else {
    const results = await Promise.all(withFeeds.map((r) => fetchFeed(r).then((res) => [r.id, res])));
    for (const [id, res] of results) sources[id] = res;
    const okCount = Object.values(sources).filter((s) => s.ok).length;
    console.log(`sync-data: feed snapshot — ${okCount}/${withFeeds.length} sources reachable`);
  }
  await fs.writeFile(
    path.join(outDir, "feeds.json"),
    JSON.stringify({ fetchedAt: new Date().toISOString(), sources }),
  );
}

async function main() {
  // Start clean so removed source files don't linger in public/data/.
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outAssessmentsDir, { recursive: true });

  // comparison-index.json (source has a leading underscore)
  const comparison = await readJson(srcComparisonIndex);
  await fs.writeFile(
    path.join(outDir, "comparison-index.json"),
    JSON.stringify(comparison),
  );

  // schema.json (handy for consumers / validation)
  try {
    const schema = await readJson(srcSchema);
    await fs.writeFile(path.join(outDir, "schema.json"), JSON.stringify(schema));
  } catch {
    // schema.json is optional for the runtime app; skip if absent.
  }

  // Per-country assessments -> <iso3>.json
  const entries = await fs.readdir(srcAssessmentsDir);
  const jsonFiles = entries.filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  let written = 0;
  for (const file of jsonFiles) {
    const data = await readJson(path.join(srcAssessmentsDir, file));
    const iso3 = String(data.iso3 || "").toLowerCase();
    if (!iso3) {
      console.warn(`sync-data: ${file} has no iso3, skipping`);
      continue;
    }
    await fs.writeFile(
      path.join(outAssessmentsDir, `${iso3}.json`),
      JSON.stringify(data),
    );
    written++;
  }

  console.log(`sync-data: wrote comparison-index + ${written} assessments to public/data/`);

  await snapshotFeeds(outDir);
}

main().catch((err) => {
  console.error("sync-data failed:", err);
  process.exit(1);
});
