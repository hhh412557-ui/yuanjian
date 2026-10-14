// Push items collected elsewhere into the site's ingest pipeline (POST /api/ingest/items).
// For sources the built-in collector cannot reach: a host-side crawler, a scheduled job, a mail reader.
// Same rules as the API: every item needs a title, and either an http(s) url or a body; an item with
// no address (pasted intelligence) carries its text in `body` instead.
//
// Usage:
//   node --env-file=.env scripts/ingest-external.ts --source ext-ransomware-intel [--name "勒索情报"] items.json
//   cat items.json | node --env-file=.env scripts/ingest-external.ts --source ext-ransomware-intel -
//
// Input: a JSON array, or an object with an `items` array.
//   [{ "title": "标题", "url": "https://…", "publishedAt": "2026-10-12T08:00:00+08:00" }]
//   [{ "title": "无链接情报标题", "body": "正文…", "excerpt": "摘要…", "publishedAt": "2026-10-12T08:00:00+08:00" }]
// Add `"raw": { "_yuanjian": { "backfill": true } }` to an item to treat it as history (not today, not pushed).
import { readFileSync } from "node:fs";

const MAX_ITEMS = 50;

interface ItemIn {
  title?: unknown;
  url?: unknown;
  body?: unknown;
  excerpt?: unknown;
  identityKey?: unknown;
  publishedAt?: unknown;
  author?: unknown;
  raw?: unknown;
}

const argv = process.argv.slice(2);
const flags: Record<string, string> = {};
const positional: string[] = [];
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i].startsWith("--")) {
    flags[argv[i].slice(2)] = argv[i + 1] ?? "";
    i += 1;
  } else {
    positional.push(argv[i]);
  }
}

const sourceId = flags.source ?? "";
if (!sourceId) {
  console.error("--source <sourceId> is required");
  process.exit(1);
}
const sourceName = flags.name;
const input = positional[0] ?? "-";

const siteUrl = (process.env.SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
const token = process.env.INGEST_TOKEN;
if (!token) {
  console.error("INGEST_TOKEN is required (set it in .env, or pass it in the environment)");
  process.exit(1);
}

const text = readFileSync(input === "-" ? 0 : input, "utf8");
const parsed = JSON.parse(text) as unknown;
const list: unknown[] = Array.isArray(parsed)
  ? parsed
  : parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown[] }).items)
    ? ((parsed as { items: unknown[] }).items)
    : [];
if (!list.length) {
  console.error("input must be a non-empty array, or an object with a non-empty items array");
  process.exit(1);
}

// Keep only what the API would accept, so a bad row is visible here instead of silently dropped there.
const seen = new Set<string>();
const clean: ItemIn[] = [];
let dropped = 0;
for (const raw of list) {
  const it = (raw ?? {}) as ItemIn;
  const title = typeof it.title === "string" ? it.title.trim() : "";
  const url = typeof it.url === "string" ? it.url.trim() : "";
  const text = typeof it.body === "string" ? it.body.trim() : "";
  const httpUrl = /^https?:\/\//i.test(url) ? url : "";
  if (!title || (!httpUrl && !text) || (httpUrl && seen.has(httpUrl))) {
    dropped += 1;
    continue;
  }
  if (httpUrl) seen.add(httpUrl);
  clean.push({
    title,
    url: httpUrl,
    ...(text ? { body: text } : {}),
    ...(typeof it.excerpt === "string" && it.excerpt.trim() ? { excerpt: it.excerpt.trim() } : {}),
    ...(typeof it.identityKey === "string" && it.identityKey.trim() ? { identityKey: it.identityKey.trim() } : {}),
    ...(typeof it.publishedAt === "string" && it.publishedAt.trim() ? { publishedAt: it.publishedAt.trim() } : {}),
    ...(typeof it.author === "string" && it.author.trim() ? { author: it.author.trim() } : {}),
    ...(it.raw && typeof it.raw === "object" ? { raw: it.raw } : {}),
  });
}
if (!clean.length) {
  console.error(`no valid items: ${list.length} in, all dropped (title, and an http(s) url or a body, are required)`);
  process.exit(1);
}

let created = 0;
for (let i = 0; i < clean.length; i += MAX_ITEMS) {
  const batch = clean.slice(i, i + MAX_ITEMS);
  const pushed = await fetch(`${siteUrl}/api/ingest/items`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ sourceId, ...(sourceName ? { sourceName } : {}), items: batch }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await pushed.text();
  if (!pushed.ok) {
    console.error(`ingest failed: HTTP ${pushed.status} ${body.slice(0, 300)}`);
    process.exit(1);
  }
  const result = JSON.parse(body) as { created?: number };
  created += result.created ?? 0;
  console.log(`batch ${Math.floor(i / MAX_ITEMS) + 1}: sent ${batch.length}, created ${result.created ?? 0}`);
}
console.log(JSON.stringify({ sourceId, received: list.length, valid: clean.length, dropped, created }));
