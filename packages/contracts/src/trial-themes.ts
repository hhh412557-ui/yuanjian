import type { PublicApiCategoryKey } from "./taxonomy.ts";

/** The twelve trial themes used by the first topic-initialization flow. */
export const TRIAL_THEME_IDS = [
  "ai-models",
  "ai-agents",
  "ai-products",
  "ai-infra",
  "ai-open",
  "ai-industry",
  "sec-vuln",
  "sec-threat",
  "sec-ransomware",
  "sec-vendors",
  "sec-policy",
  "sec-research",
] as const;

export type TrialThemeId = (typeof TRIAL_THEME_IDS)[number];

/**
 * Maps each trial theme to the public API category used by feeds, API and MCP.
 * Several trial themes intentionally share a category because the public taxonomy
 * is coarser than the user-facing trial choices.
 */
export const TRIAL_THEME_TO_CATEGORY = {
  "ai-models": "ai-models",
  "ai-agents": "ai-products",
  "ai-products": "ai-products",
  "ai-infra": "industry",
  "ai-open": "ai-products",
  "ai-industry": "industry",
  "sec-vuln": "vulnerability",
  "sec-threat": "threat-intel",
  "sec-ransomware": "threat-intel",
  "sec-vendors": "research",
  "sec-policy": "security-advisory",
  "sec-research": "research",
} as const satisfies Record<TrialThemeId, PublicApiCategoryKey>;
