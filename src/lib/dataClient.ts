import type { Assessment, ComparisonIndex } from "./types";

// Runtime fetch against the statically-hosted JSON (synced into public/data/
// by scripts/sync-data.mjs). Same-origin, so no CORS. Base path is overridable
// for previews / alternate mounts.
const DATA_BASE = "/data";

export function comparisonIndexUrl(base: string = DATA_BASE): string {
  return `${base}/comparison-index.json`;
}

export function assessmentUrl(iso3: string, base: string = DATA_BASE): string {
  return `${base}/assessments/${iso3.toLowerCase()}.json`;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function getComparisonIndex(base?: string): Promise<ComparisonIndex> {
  return getJson<ComparisonIndex>(comparisonIndexUrl(base));
}

export function getAssessment(iso3: string, base?: string): Promise<Assessment> {
  return getJson<Assessment>(assessmentUrl(iso3, base));
}
