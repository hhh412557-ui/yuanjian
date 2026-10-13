import type { PublicApiCategoryKey } from "@yuanjian/contracts/taxonomy";
import { feedCategoryLabel } from "@yuanjian/contracts/taxonomy";
import type { CallerProfile } from "./mcp-profile.ts";

export interface ResolvedScope {
  categories: PublicApiCategoryKey[] | null;
  scope: "profile" | "all";
  applied: boolean;
}

export interface ProfileAnswerContext {
  applied: boolean;
  scope: "profile" | "all";
  themes: string[];
  categories: PublicApiCategoryKey[];
  relaxed: boolean;
  matched: number;
  supplemented: number;
}

export function resolveScope(
  args: { category?: PublicApiCategoryKey | null; scope?: "profile" | "all" },
  profile: CallerProfile | null,
): ResolvedScope {
  if (args.category) return { categories: [args.category], scope: "all", applied: false };
  if (args.scope === "all") return { categories: null, scope: "all", applied: false };
  if (profile?.categories.length) return { categories: [...profile.categories], scope: "profile", applied: true };
  return { categories: null, scope: "all", applied: false };
}

export function profileAnswerLine(context: ProfileAnswerContext): string[] {
  if (!context.applied) return [];
  const labels = context.categories.map(feedCategoryLabel);
  return [
    `> 已按你的关注方向（${labels.join("、")}）定制；命中 ${context.matched} 条。`,
    ...(context.relaxed ? [`> 你的关注方向今天只有 ${context.matched} 条，已附带其他重要动态 ${context.supplemented} 条。`] : []),
  ];
}

export function mergeProfileItems<T extends { id: string }>(profileItems: T[], allItems: T[], limit: number) {
  const seen = new Set<string>();
  const items: T[] = [];
  for (const item of [...profileItems, ...allItems]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    items.push(item);
    if (items.length >= limit) break;
  }
  const matched = Math.min(profileItems.length, limit);
  const relaxed = profileItems.length < 3;
  return { items, matched, relaxed, supplemented: Math.max(0, items.length - matched) };
}
