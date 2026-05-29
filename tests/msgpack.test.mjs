// Phase-B integrity guard: the MessagePack the client decodes must round-trip
// the canonical JSON exactly. Encode -> decode -> deep-equal against the source
// for a sample assessment and the comparison index. Also checks the precompressed
// .msgpack.gz / .msgpack.br decompress back to the same bytes nginx would serve.

import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

import { encode, decode } from "@msgpack/msgpack";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const dataDir = path.join(repoRoot, "public", "data");

async function readJson(rel) {
  return JSON.parse(await fs.readFile(path.join(dataDir, rel), "utf8"));
}

test("a sample assessment round-trips through MessagePack", async () => {
  const src = await readJson("assessments/nor.json");
  const decoded = decode(encode(src));
  assert.deepEqual(decoded, src);
});

test("the comparison index round-trips through MessagePack", async () => {
  const src = await readJson("comparison-index.json");
  const decoded = decode(encode(src));
  assert.deepEqual(decoded, src);
  assert.equal(decoded.decisions.living.ranking.length, src.decisions.living.ranking.length);
});

test("the packed .msgpack on disk decodes to the canonical JSON", async () => {
  const src = await readJson("comparison-index.json");
  const packed = await fs.readFile(path.join(dataDir, "comparison-index.msgpack"));
  const decoded = decode(new Uint8Array(packed));
  assert.deepEqual(decoded, src);
});

test("precompressed gzip/brotli artifacts decompress to the raw .msgpack", async () => {
  const raw = await fs.readFile(path.join(dataDir, "comparison-index.msgpack"));
  const gz = await fs.readFile(path.join(dataDir, "comparison-index.msgpack.gz"));
  const br = await fs.readFile(path.join(dataDir, "comparison-index.msgpack.br"));
  assert.deepEqual(zlib.gunzipSync(gz), raw, "gzip must restore the raw msgpack");
  assert.deepEqual(zlib.brotliDecompressSync(br), raw, "brotli must restore the raw msgpack");
  // The compressed payloads should actually be smaller than the raw bytes.
  assert.ok(gz.length < raw.length, "gzip should shrink the payload");
  assert.ok(br.length < raw.length, "brotli should shrink the payload");
});
