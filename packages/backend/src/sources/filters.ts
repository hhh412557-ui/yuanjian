// Source-list admission rules shared by collection and the administrator's preview.
import { FUTURE_TOLERANCE_MS } from "../content/materials.ts";
import type { Candidate, SourceRow } from "./types.ts";
import { allowed } from "./web-list.ts";

/**
 * What a source keeps from its listing: links inside its URL prefix rules (matched as listed), then
 * moved by its URL rewrite, without its denied categories and noise, inside its publication window.
 * Collection and the preview both read listings through it, so a preview shows what a run would store.
 */
export function admitListing<C extends Candidate>(candidates: C[], source: SourceRow, now = Date.now()): C[] {
  const kept = candidates.filter((c) => allowed(c.url, source)).map((c) => rewriteUrl(c, source)).filter((c) => !noiseFiltered(c, source));
  return filterPublicationWindow(kept, source.config.publishedAfter, now);
}

const GENERAL_NEWS_POLITICS_FILTER = {
  dropMarkersTitleOnly: [
    "大选", "选举", "竞选", "民调", "投票", "候选人", "总统", "总理", "首相", "议会", "国会", "参议院", "众议院", "政党", "内阁", "外交", "大使", "会晤", "峰会", "政治", "议员",
    "election", "campaign", "poll", "ballot", "vote", "president", "prime minister", "parliament", "congress", "senate", "lawmaker", "minister", "diplomatic", "ambassador", "cabinet", "political", "governor", "mayor", "legislator",
  ],
  keepIfMatches: [
    "人工智能", "生成式ai", "ai应用", "ai产品", "ai芯片", "大模型", "智能体", "机器学习", "ai model", "ai safety", "ai agent", "ai startup", "ai product", "ai application", "ai chip", "artificial intelligence", "large language model", "openai", "anthropic", "chatgpt", "gemini", "deepseek", "llm",
    "cyber", "cybersecurity", "网络安全", "漏洞", "勒索", "数据泄露", "恶意软件", "网络攻击", "零日漏洞", "半导体", "芯片", "科技", "科学", "科研", "医疗", "临床", "公共卫生",
    "地震", "洪水", "台风", "疫情", "重大灾害", "经济", "金融市场", "融资", "并购", "ransomware", "data breach", "malware", "cyberattack", "zero-day", "zero day", "security breach", "security flaw", "cve-", "semiconductor", "technology", "scientific", "earthquake", "hurricane", "wildfire", "flood", "pandemic", "war", "emergency", "climate change", "funding", "merger", "acquisition", "major disaster",
  ],
} satisfies { dropMarkersTitleOnly: string[]; keepIfMatches: string[] };

const GENERAL_NEWS_SOURCE_IDS = new Set([
  "rss-bbc-chinese",
  "rss-economist-world",
  "rss-guardian-world",
  "rss-npr-news",
]);

export function noiseFiltered(c: Candidate, source: SourceRow): boolean {
  const f = source.config.ingestNoiseFilter;
  const editorialFilter = GENERAL_NEWS_SOURCE_IDS.has(source.id) ? GENERAL_NEWS_POLITICS_FILTER : undefined;
  const cats: string[] = c.categories ?? [];
  if (source.config.denyCategories?.some((d: string) => cats.includes(d))) return true;
  if (source.config.allowCategories?.length && !source.config.allowCategories.some((a: string) => cats.includes(a))) return true;
  if (!f && !editorialFilter) return false;
  // Case-insensitive: the exemption "agent" keeps "Agent" (words in the lists are lower case).
  const has = (text: string, words: string[] | undefined) => (words ?? []).some((k) => text.includes(k.toLowerCase()));
  const title = c.title.toLowerCase();
  const hay = `${title}\n${(c.excerpt ?? "").toLowerCase()}`;
  if (has(hay, [...(editorialFilter?.keepIfMatches ?? []), ...(f?.keepIfMatches ?? [])])) return false;
  return has(title, [...(editorialFilter?.dropMarkersTitleOnly ?? []), ...(f?.dropMarkersTitleOnly ?? [])]) || has(hay, f?.dropMarkers);
}

function rewriteUrl<C extends Candidate>(c: C, source: SourceRow): C {
  const rw = source.config.itemUrlPrefixRewrite;
  if (rw?.from && rw?.to && c.url.startsWith(rw.from)) return { ...c, url: rw.to + c.url.slice(rw.from.length) };
  return c;
}

/** A fixed publication boundary excludes history and dates that cannot prove an item is in range. */
function filterPublicationWindow<C extends Candidate>(candidates: C[], publishedAfter: string | undefined, now: number): C[] {
  if (!publishedAfter) return candidates;
  const after = Date.parse(publishedAfter);
  const latest = now + FUTURE_TOLERANCE_MS;
  return candidates.filter(c => !!c.publishedAt && c.publishedAt.getTime() > after && c.publishedAt.getTime() <= latest);
}
