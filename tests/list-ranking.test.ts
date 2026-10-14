// The website's own list order: the Beijing day first, then the site's category weight (AI and network
// security ahead of current affairs and general news), then the item's own time. A partner-fed board
// (a topic bound to one source, boards.ts) stays out of the general list but keeps its category page.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@yuanjian/backend/db";
import { loadPool } from "@yuanjian/backend/publication/pool";
import { BOARD_SOURCE_IDS } from "@yuanjian/backend/publication/boards";

const T = `rank-${tag()}`;
// A day of its own, newer than anything a template seeds: Beijing 2026-12-01 20:00.
const now = new Date("2026-12-01T12:00:00Z");
const id = (suffix: string) => `${T}-${suffix}`;
const mine = (ids: string[]) => ids.filter((item) => item.startsWith(`${T}-`));
const HOUR = 3600_000;

after(closeDb);
before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${T}, ${T}, 'rss', 'T2')`;
  for (const board of BOARD_SOURCE_IDS) {
    await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${board}, ${board}, 'external', 'T2')
      ON CONFLICT (id) DO NOTHING`;
  }
});

async function add(suffix: string, category: string, ageHours: number, source = T) {
  const at = new Date(+now - ageHours * HOUR);
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
    VALUES (${id(suffix)}, ${source}, ${id(suffix)}, ${`https://example.test/${id(suffix)}`}, ${id(suffix)}, ${at}, ${at})`;
  await sql`INSERT INTO publications (article_id, title, source_id, channel, category, tags, url, discovered_at, timeline_at, sort_at,
    selected, eligible, visibility, visible_after)
    VALUES (${id(suffix)}, ${id(suffix)}, ${source}, 'news', ${category}, '{}', ${`https://example.test/${id(suffix)}`},
      ${at}, ${at}, ${at}, false, true, 'public', ${at})`;
  return id(suffix);
}

test("AI and security rank ahead of current affairs inside the same Beijing day", async () => {
  await add("affairs", "current-affairs", 2);
  await add("general", "general-news", 1);
  await add("neutral", "industry", 3);
  await add("ai", "ai-models", 5);
  await add("vuln", "vulnerability", 4);

  const pool = await loadPool({ channel: "all", category: null, tag: null, now });
  assert.deepEqual(
    mine(pool.items.map((item) => item.id)),
    ["vuln", "ai", "neutral", "general", "affairs"].map(id),
    "the weighted day puts AI and security first, then neutral categories, then current affairs — each group newest first",
  );
});

test("a partner-fed board keeps out of the general list and keeps its own category page", async () => {
  const board = BOARD_SOURCE_IDS[0]!;
  const boardId = await add("board", "threat-intel", 0.5, board);

  const general = await loadPool({ channel: "all", category: null, tag: null, now });
  assert.ok(!mine(general.items.map((item) => item.id)).includes(boardId), "the board's batch stays out of 「全部」");

  const category = await loadPool({ channel: "all", category: "threat-intel", tag: null, now });
  assert.deepEqual(mine(category.items.map((item) => item.id)), [boardId], "its own category page lists it");
});
