import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { TRIAL_SURVEY_CADENCES, TRIAL_SURVEY_DEPTHS, TRIAL_SURVEY_FOCUS, TRIAL_SURVEY_GOALS, type TrialSurveyAnswers, type TrialSurveyCadenceId, type TrialSurveyDepthId, type TrialSurveyGoalId } from "@yuanjian/contracts/trial-profile";
import { TRIAL_THEME_IDS, TRIAL_THEME_TO_CATEGORY, type TrialThemeId } from "@yuanjian/contracts/trial-themes";
import { PUBLIC_API_CATEGORY_KEYS, type PublicApiCategoryKey } from "@yuanjian/contracts/taxonomy";
import type { McpTokenConfig } from "./config.ts";
import { credential } from "./config.ts";
import { sql } from "./db.ts";

const THEME_SET = new Set<string>(TRIAL_THEME_IDS);
const TOKEN_PATTERN = /^yuanjian_[A-Za-z0-9_-]{32,160}$/;
const FOCUS_SET = new Set<string>(TRIAL_SURVEY_FOCUS.map((entry) => entry.id));
const GOAL_SET = new Set<string>(TRIAL_SURVEY_GOALS.map((entry) => entry.id));
const DEPTH_SET = new Set<string>(TRIAL_SURVEY_DEPTHS.map((entry) => entry.id));
const CADENCE_SET = new Set<string>(TRIAL_SURVEY_CADENCES.map((entry) => entry.id));

export type McpProfileSource = "web" | "mcp";

export type McpSurvey = TrialSurveyAnswers;

export interface McpProfile {
  id: string;
  label: string;
  themes: TrialThemeId[];
  categories: PublicApiCategoryKey[];
  survey: McpSurvey;
  source: McpProfileSource;
  createdAt: string;
  updatedAt: string;
}

export class McpProfileRejected extends Error {
  readonly status: 400 | 401 | 429;
  readonly code: "invalid_request" | "unauthorized" | "rate_limited";
  readonly retryAfter?: number;

  constructor(status: 400 | 401 | 429, code: McpProfileRejected["code"], message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

interface ProfileRow {
  id: string;
  label: string;
  themes: string[];
  survey: unknown;
  source: McpProfileSource;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertMcpProfileInput {
  token?: unknown;
  themes?: unknown;
  survey?: unknown;
  label?: unknown;
  source: McpProfileSource;
  rotate?: unknown;
}

export interface UpsertMcpProfileResult {
  token: string;
  issued: boolean;
  profile: McpProfile;
}

export interface CallerProfile {
  label: string;
  themes: string[];
  categories: PublicApiCategoryKey[];
  cadence: TrialSurveyCadenceId | null;
  depth: TrialSurveyDepthId | null;
  goal: TrialSurveyGoalId | null;
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeToken(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new McpProfileRejected(400, "invalid_request", "token 必须是字符串。");
  const token = value.trim();
  if (!TOKEN_PATTERN.test(token)) throw new McpProfileRejected(401, "unauthorized", "Token 无效或已过期。");
  return token;
}

export function normalizeThemes(value: unknown, required = true): TrialThemeId[] {
  if (value === undefined || value === null) {
    if (required) throw new McpProfileRejected(400, "invalid_request", "至少选择一个主题。");
    return [];
  }
  if (!Array.isArray(value) || value.length > TRIAL_THEME_IDS.length) {
    throw new McpProfileRejected(400, "invalid_request", `themes 必须是 1 到 ${TRIAL_THEME_IDS.length} 个主题 ID。`);
  }
  const themes = [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()))];
  if (themes.length !== value.length || themes.some((theme) => !THEME_SET.has(theme))) {
    throw new McpProfileRejected(400, "invalid_request", `themes 只能使用元见主题 ID：${TRIAL_THEME_IDS.join(", ")}。`);
  }
  if (required && themes.length === 0) throw new McpProfileRejected(400, "invalid_request", "至少选择一个主题。");
  return themes as TrialThemeId[];
}

function normalizeLabel(value: unknown, source: McpProfileSource): string {
  if (value === undefined || value === null || value === "") return source === "mcp" ? "MCP 用户" : "网页用户";
  if (typeof value !== "string") throw new McpProfileRejected(400, "invalid_request", "label 必须是字符串。");
  const label = value.trim().replace(/[\r\n\t]+/g, " ").slice(0, 60);
  if (!label) return source === "mcp" ? "MCP 用户" : "网页用户";
  return label;
}

export function normalizeSurvey(value: unknown): McpSurvey {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new McpProfileRejected(400, "invalid_request", "请完成主题问卷后再生成 Token。");
  const row = value as Record<string, unknown>;
  const focus = Array.isArray(row.focus) ? [...new Set(row.focus.filter((item): item is string => typeof item === "string"))] : [];
  if (!focus.length || focus.some((id) => !FOCUS_SET.has(id))) throw new McpProfileRejected(400, "invalid_request", "focus 需要包含至少一个有效关注方向。");
  if (typeof row.goal !== "string" || !GOAL_SET.has(row.goal)) throw new McpProfileRejected(400, "invalid_request", "goal 不是有效的阅读目标。");
  if (typeof row.depth !== "string" || !DEPTH_SET.has(row.depth)) throw new McpProfileRejected(400, "invalid_request", "depth 不是有效的信息深度。");
  if (typeof row.cadence !== "string" || !CADENCE_SET.has(row.cadence)) throw new McpProfileRejected(400, "invalid_request", "cadence 不是有效的阅读频率。");
  return { focus: focus as TrialSurveyAnswers["focus"], goal: row.goal as TrialSurveyAnswers["goal"], depth: row.depth as TrialSurveyAnswers["depth"], cadence: row.cadence as TrialSurveyAnswers["cadence"] };
}

export function categoriesForThemes(themes: readonly string[]): PublicApiCategoryKey[] {
  const publicCategories = new Set<string>(PUBLIC_API_CATEGORY_KEYS);
  return [...new Set(themes.flatMap((theme) => THEME_SET.has(theme)
    ? [TRIAL_THEME_TO_CATEGORY[theme as TrialThemeId]]
    : publicCategories.has(theme) ? [theme as PublicApiCategoryKey] : []))];
}

export function callerProfileFromToken(caller: McpTokenConfig): CallerProfile {
  return {
    label: caller.label,
    themes: [...caller.themes],
    categories: categoriesForThemes(caller.themes),
    cadence: null,
    depth: null,
    goal: null,
  };
}

export function callerProfileFromDb(profile: McpProfile): CallerProfile {
  return {
    label: profile.label,
    themes: [...profile.themes],
    categories: [...profile.categories],
    cadence: profile.survey.cadence,
    depth: profile.survey.depth,
    goal: profile.survey.goal,
  };
}

function profileFromRow(row: ProfileRow): McpProfile {
  const themes = normalizeThemes(row.themes);
  return {
    id: row.id,
    label: row.label,
    themes,
    categories: categoriesForThemes(themes),
    survey: normalizeSurvey(row.survey),
    source: row.source,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const surveyJson = (survey: McpSurvey) => ({ focus: [...survey.focus], goal: survey.goal, depth: survey.depth, cadence: survey.cadence });

export async function findMcpProfileByToken(token: string): Promise<McpProfile | null> {
  const [row] = await sql<ProfileRow[]>`
    SELECT id, label, themes, survey, source, created_at, updated_at
    FROM mcp_profiles
    WHERE token_hash = ${tokenHash(token)}
    LIMIT 1`;
  if (!row) return null;
  void sql`UPDATE mcp_profiles SET last_used_at = now() WHERE id = ${row.id}`.catch(() => {});
  return profileFromRow(row);
}

async function updateProfile(id: string, themes: TrialThemeId[], survey: McpSurvey, label?: string): Promise<McpProfile> {
  const [row] = await sql<ProfileRow[]>`
    UPDATE mcp_profiles
    SET themes = ${themes}, survey = ${sql.json(surveyJson(survey))}, label = coalesce(${label ?? null}, label), updated_at = now()
    WHERE id = ${id}
    RETURNING id, label, themes, survey, source, created_at, updated_at`;
  if (!row) throw new Error("MCP profile disappeared while updating");
  return profileFromRow(row);
}

export async function upsertMcpProfile(input: UpsertMcpProfileInput): Promise<UpsertMcpProfileResult> {
  const token = normalizeToken(input.token);
  const themes = normalizeThemes(input.themes, !token);
  const survey = input.survey === undefined && token ? null : normalizeSurvey(input.survey);
  const label = input.label === undefined ? undefined : normalizeLabel(input.label, input.source);

  if (token) {
    const existing = await findMcpProfileByToken(token);
    if (!existing) throw new McpProfileRejected(401, "unauthorized", "Token 无效或已过期。");
    const profile = themes.length && survey ? await updateProfile(existing.id, themes, survey, label) : existing;
    if (input.rotate === true) {
      const rotated = `yuanjian_${randomBytes(48).toString("base64url")}`;
      const [row] = await sql<ProfileRow[]>`
        UPDATE mcp_profiles SET token_hash = ${tokenHash(rotated)}, token_prefix = ${rotated.slice(0, 16)}, updated_at = now()
        WHERE id = ${profile.id}
        RETURNING id, label, themes, survey, source, created_at, updated_at`;
      if (!row) throw new Error("MCP profile disappeared while rotating its token");
      return { token: rotated, issued: true, profile: profileFromRow(row) };
    }
    return { token, issued: false, profile };
  }

  if (!survey) throw new McpProfileRejected(400, "invalid_request", "请完成主题问卷后再生成 Token。");
  const finalLabel = label ?? normalizeLabel(undefined, input.source);

  for (let attempt = 0; attempt < 5; attempt++) {
    const issuedToken = `yuanjian_${randomBytes(48).toString("base64url")}`;
    try {
      const [row] = await sql<ProfileRow[]>`
        INSERT INTO mcp_profiles (id, token_hash, token_prefix, label, themes, survey, source)
        VALUES (${randomUUID()}, ${tokenHash(issuedToken)}, ${issuedToken.slice(0, 16)}, ${finalLabel}, ${themes}, ${sql.json(surveyJson(survey))}, ${input.source})
        RETURNING id, label, themes, survey, source, created_at, updated_at`;
      if (!row) throw new Error("MCP profile was not created");
      return { token: issuedToken, issued: true, profile: profileFromRow(row) };
    } catch (error) {
      if ((error as { code?: string }).code !== "23505") throw error;
    }
  }
  throw new Error("Unable to issue a unique MCP token");
}

const rateWindows = new Map<string, number[]>();

/** Five new profiles per hour per privacy-preserving IP/agent fingerprint. */
export function allowMcpProfileIssue(ip: string, userAgent: string): boolean {
  const secret = credential("auth", "SESSION_SECRET") ?? "yuanjian-profile-rate-dev-only";
  const uaFamily = (userAgent.match(/(Chrome|Safari|Firefox|Edg|MicroMessenger|Mobile|Android|iPhone|iPad|Mac OS X|Windows)/g) ?? []).slice(0, 4).join("/");
  const fingerprint = createHmac("sha256", secret).update(`${ip}|${uaFamily}`).digest("hex");
  const now = Date.now();
  const recent = (rateWindows.get(fingerprint) ?? []).filter((at) => now - at < 60 * 60_000);
  if (recent.length >= 5) {
    rateWindows.set(fingerprint, recent);
    return false;
  }
  recent.push(now);
  rateWindows.set(fingerprint, recent);
  if (rateWindows.size > 5000) for (const [id, entries] of rateWindows) if (entries.every((at) => now - at >= 60 * 60_000)) rateWindows.delete(id);
  return true;
}
