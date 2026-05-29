// Pack the runtime data (public/data/**.json) into MessagePack and precompress
// each artifact with gzip + brotli (NO zstd), mirroring how the SaaS app ships
// timeseries/black-box logs: binary body + transport-layer compression.
//
// For every <name>.json we emit:
//   <name>.msgpack      (binary, the canonical wire format the client decodes)
//   <name>.msgpack.gz   (gzip -9, served by nginx gzip_static)
//   <name>.msgpack.br   (brotli max, served by nginx brotli_static if available)
//
// The .json files are kept (human-readable source / fallback). Run after
// sync-data, before the Astro build, so dist/ ships the precompressed binaries.
//
// Usage: node scripts/pack-data.mjs

import { promises as fs } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { encode } from "@msgpack/msgpack";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dataDir = path.join(repoRoot, "public", "data");

async function walkJson(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkJson(p)));
    else if (entry.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const gzip = (buf) => zlib.gzipSync(buf, { level: zlib.constants.Z_BEST_COMPRESSION });
const brotli = (buf) =>
  zlib.brotliCompressSync(buf, {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
      [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
    },
  });

async function main() {
  try {
    await fs.access(dataDir);
  } catch {
    console.error(`pack-data: ${dataDir} not found - run sync-data first.`);
    process.exit(1);
  }

  const files = await walkJson(dataDir);
  let packed = 0;
  let jsonBytes = 0;
  let mpBytes = 0;
  let brBytes = 0;

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    const obj = JSON.parse(raw);
    const mp = Buffer.from(encode(obj));
    const base = file.replace(/\.json$/, ".msgpack");
    await fs.writeFile(base, mp);
    await fs.writeFile(base + ".gz", gzip(mp));
    const br = brotli(mp);
    await fs.writeFile(base + ".br", br);
    packed++;
    jsonBytes += Buffer.byteLength(raw);
    mpBytes += mp.length;
    brBytes += br.length;
  }

  const pct = (a, b) => (b === 0 ? "0" : (100 * (1 - a / b)).toFixed(1));
  console.log(
    `pack-data: packed ${packed} files → .msgpack(+.gz/.br). ` +
      `json ${(jsonBytes / 1024).toFixed(0)}KB → msgpack ${(mpBytes / 1024).toFixed(0)}KB ` +
      `(${pct(mpBytes, jsonBytes)}% smaller) → brotli ${(brBytes / 1024).toFixed(0)}KB ` +
      `(${pct(brBytes, jsonBytes)}% off the raw JSON).`,
  );
}

main().catch((e) => {
  console.error("pack-data failed:", e);
  process.exit(1);
});
