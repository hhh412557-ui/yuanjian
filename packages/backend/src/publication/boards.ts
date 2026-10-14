// Partner-fed boards: a topic bound to a single source (industry/topics.json sourceId) is curated
// outside the site — 「威胁情报」 arrives by hand from the company drive, in batches and without the
// scorer. Such a board lists its own category page and topic page as usual, but stays out of the
// general lists (「全部信息动态」 and 「精选」): a batch would otherwise push a whole day of news off
// the first page. site/site.ts BOARD_SOURCES.listedInAll turns that off.
import type { CategoryKey } from "@yuanjian/contracts/taxonomy";
import { BOARD_SOURCES } from "@yuanjian/site";
import { sql } from "../db.ts";
import { TOPICS } from "./topics.ts";

/** Every source a topic is bound to. */
export const BOARD_SOURCE_IDS: readonly string[] = [...new Set(TOPICS.map((t) => t.sourceId).filter((id): id is string => id !== null))];

/**
 * The condition that keeps the boards out of a general list, given the viewer's filters. A category or
 * tag filter names what the viewer wants and shows the board; without one the boards are left out.
 */
export function boardSourceCondition(f: { category?: CategoryKey | null; tag?: string | null }) {
  if (BOARD_SOURCES.listedInAll || !BOARD_SOURCE_IDS.length) return sql``;
  if (f.category || f.tag) return sql``;
  return sql`AND p.source_id <> ALL(${BOARD_SOURCE_IDS as string[]}::text[])`;
}
