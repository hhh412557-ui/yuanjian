// 试读页（首页问卷第二步、/trial）的情报小样：按主题从公开读层取真实条目。
// 「精选优先，不足补已收录」；带标签拿不到内容时退回只按类别取。只读，不改动任何数据。
import { CATEGORY_LABELS, type CategoryKey } from "@yuanjian/contracts/taxonomy";
import { trialTheme, type TrialDemoItem, type TrialDemoResponse, type TrialThemeDef } from "@yuanjian/contracts/trial-profile";
import { loadPool } from "./pool.ts";
import { loadTimeline } from "./timeline.ts";

/** 每个主题最多取几条。 */
const PER_THEME = 2;
/** 一次试读最多展示几条。 */
const TOTAL_LIMIT = 8;
/** 精选层扫描上限（按 fact 归并，取够即可）。 */
const SCAN_LIMIT = 24;

interface Candidate {
  id: string;
  title: string;
  source: string;
  categoryLabel: string | null;
  publishedAt: string | null;
  summary: string | null;
  reason: string | null;
  selected: boolean;
}

function label(category: CategoryKey | null): string | null {
  return category ? (CATEGORY_LABELS[category] ?? null) : null;
}

/** 精选的那一层（与首页、日报同口径）。 */
async function selectedLayer(theme: TrialThemeDef, useTag: boolean): Promise<Candidate[]> {
  const { cards } = await loadTimeline({ channel: "all", category: theme.category, tag: useTag ? theme.tag : null, cursor: null, limit: SCAN_LIMIT });
  return cards.map((card) => ({
    id: card.item.id,
    title: card.item.title,
    source: card.item.source.name,
    categoryLabel: label(card.item.category),
    publishedAt: card.item.publishedAt,
    summary: card.item.summary,
    reason: card.item.reason,
    selected: true,
  }));
}

/** 已收录的那一层：还没入选、但已公开可读。 */
async function listedLayer(theme: TrialThemeDef, useTag: boolean): Promise<Candidate[]> {
  const { items } = await loadPool({ channel: "all", category: theme.category, tag: useTag ? theme.tag : null, q: null, tab: "time", page: 1 });
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    source: item.source.name,
    categoryLabel: label(item.category),
    publishedAt: item.publishedAt,
    summary: item.summary,
    reason: item.reason,
    selected: item.selected,
  }));
}

/** 一个主题的候选：精选优先，不足再补已收录；带标签拿不到时退回只按类别取。 */
async function candidatesFor(theme: TrialThemeDef): Promise<Candidate[]> {
  const variants = theme.tag ? [true, false] : [false];
  const out: Candidate[] = [];
  const push = (rows: Candidate[]) => {
    for (const row of rows) if (!out.some((seen) => seen.id === row.id)) out.push(row);
  };
  for (const useTag of variants) {
    push(await selectedLayer(theme, useTag));
    if (out.length >= PER_THEME) return out;
  }
  for (const useTag of variants) {
    push(await listedLayer(theme, useTag));
    if (out.length >= PER_THEME) return out;
  }
  return out;
}

/**
 * 勾选的主题 → 真实情报小样。每个主题取「精选优先、不足补已收录」的条目，跨主题按条目 id 去重，
 * 总数封顶 TOTAL_LIMIT，库里没有内容的主题进 missing。
 */
export async function loadTrialDemo(themeIds: readonly string[]): Promise<TrialDemoResponse> {
  const themes = [...new Set(themeIds)].map(trialTheme).filter((theme): theme is TrialThemeDef => theme !== null);
  const seen = new Set<string>();
  const items: TrialDemoItem[] = [];
  const covered: string[] = [];
  const missing: string[] = [];

  for (const theme of themes) {
    if (items.length >= TOTAL_LIMIT) {
      missing.push(theme.id);
      continue;
    }
    const picked = (await candidatesFor(theme)).filter((candidate) => !seen.has(candidate.id)).slice(0, PER_THEME);
    if (!picked.length) {
      missing.push(theme.id);
      continue;
    }
    for (const candidate of picked) {
      seen.add(candidate.id);
      items.push({ ...candidate, themeId: theme.id, themeName: theme.name, group: theme.group });
    }
    covered.push(theme.id);
  }
  return { items, covered, missing };
}
