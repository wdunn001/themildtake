import { decode } from "@msgpack/msgpack";
import type { Assessment, ComparisonIndex } from "./types";

// Runtime fetch against the statically-hosted data (synced into public/data/ by
// scripts/sync-data.mjs, packed to MessagePack by scripts/pack-data.mjs). We
// fetch the binary .msgpack and decode client-side — mirroring how the SaaS app
// ships timeseries/black-box logs. nginx serves the precompressed .msgpack.gz /
// .msgpack.br via gzip_static/brotli_static (Content-Encoding), so the browser
// transparently decompresses and we decode the raw msgpack bytes either way.
// Same-origin, so no CORS. Base path is overridable for previews / alternate mounts.
const DATA_BASE = "/data";

export function comparisonIndexUrl(base: string = DATA_BASE): string {
  return `${base}/comparison-index.msgpack`;
}

export function assessmentUrl(iso3: string, base: string = DATA_BASE): string {
  return `${base}/assessments/${iso3.toLowerCase()}.msgpack`;
}

async function getPacked<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = await res.arrayBuffer();
  return decode(new Uint8Array(buf)) as T;
}

export function getComparisonIndex(base?: string): Promise<ComparisonIndex> {
  return getPacked<ComparisonIndex>(comparisonIndexUrl(base));
}

export function getAssessment(iso3: string, base?: string): Promise<Assessment> {
  return getPacked<Assessment>(assessmentUrl(iso3, base));
}
