import type { CategoryKey } from "./taxonomy.ts";
import { TRIAL_THEME_TO_CATEGORY, type TrialThemeId } from "./trial-themes.ts";

export type TrialSurveyFocusId = "ai-practice" | "ai-market" | "security-risk" | "security-governance";
export type TrialSurveyGoalId = "overview" | "decision" | "risk" | "briefing";
export type TrialSurveyDepthId = "quick" | "standard" | "deep";
export type TrialSurveyCadenceId = "daily" | "important" | "weekly";

export interface TrialSurveyAnswers {
  focus: TrialSurveyFocusId[];
  goal: TrialSurveyGoalId | null;
  depth: TrialSurveyDepthId;
  cadence: TrialSurveyCadenceId;
}

export const TRIAL_SURVEY_FOCUS: Array<{ id: TrialSurveyFocusId; name: string; description: string; themes: string[] }> = [
  { id: "ai-practice", name: "AI 产品与技术", description: "模型、智能体、应用和开发者生态", themes: ["ai-models", "ai-agents", "ai-products", "ai-open"] },
  { id: "ai-market", name: "AI 产业与基础设施", description: "算力、芯片、投融资和政策变化", themes: ["ai-infra", "ai-industry"] },
  { id: "security-risk", name: "安全风险与攻击事件", description: "漏洞、威胁、勒索和数据泄露", themes: ["sec-vuln", "sec-threat", "sec-ransomware"] },
  { id: "security-governance", name: "安全研究与合规", description: "厂商研究、监管、报告和工具", themes: ["sec-vendors", "sec-policy", "sec-research"] },
];

export const TRIAL_SURVEY_GOALS: Array<{ id: TrialSurveyGoalId; name: string; description: string }> = [
  { id: "overview", name: "快速了解行业变化", description: "每天用几分钟掌握重要变化" },
  { id: "decision", name: "辅助产品与技术决策", description: "关注能影响选型、研发和落地的信息" },
  { id: "risk", name: "识别风险与合规事项", description: "优先看漏洞、攻击、政策和处置要求" },
  { id: "briefing", name: "整理汇报与研究材料", description: "需要来源、摘要和可继续追踪的线索" },
];

export const TRIAL_SURVEY_DEPTHS: Array<{ id: TrialSurveyDepthId; name: string; description: string }> = [
  { id: "quick", name: "一句话快讯", description: "只保留事件和影响" },
  { id: "standard", name: "标准简报", description: "摘要、来源和关注理由" },
  { id: "deep", name: "深度情报", description: "增加背景、证据和后续线索" },
];

export const TRIAL_SURVEY_CADENCES: Array<{ id: TrialSurveyCadenceId; name: string; description: string }> = [
  { id: "daily", name: "每日精选", description: "每天看一份控制数量的精选" },
  { id: "important", name: "重要事件优先", description: "有明显影响时再提醒我" },
  { id: "weekly", name: "每周集中回顾", description: "周末一次看清变化主线" },
];

export const EMPTY_TRIAL_SURVEY_ANSWERS: TrialSurveyAnswers = {
  focus: [],
  goal: null,
  depth: "standard",
  cadence: "daily",
};

// ── 试读主题（情报小样）──────────────────────────────────────────────────────────────────
// 网页端「勾选主题 → 情报试读」用的主题定义：卡片上的名字与说明，加上从元见库里取哪一类真实内容。
// 一个主题的 source：category 是取数的类别（industry/taxonomy.ts 的 CATEGORIES key），tag 是可选叠加的标签。
// 试读取「精选优先，不足补已收录」，tag 拿不到内容时自动退回只按 category 取，所以 tag 只用来做细分、不会取空。

export type TrialThemeGroup = "ai" | "security";

/** 试读主题的文案与取数细化；category 复用 trial-themes.ts 的映射，tag 用于同一类别下的再细分。 */
interface TrialThemeCopy {
  id: TrialThemeId;
  group: TrialThemeGroup;
  name: string;
  description: string;
  tag: string | null;
}

const TRIAL_THEME_COPY: readonly TrialThemeCopy[] = [
  { id: "ai-models", group: "ai", name: "大模型动态", description: "模型发布、版本变化、能力评测与安全边界。", tag: null },
  { id: "ai-agents", group: "ai", name: "AI Agent / 智能体", description: "智能体、工具调用、工作流和任务执行。", tag: "Agent" },
  { id: "ai-products", group: "ai", name: "AI 应用与产品", description: "AI 产品、功能更新和行业落地案例。", tag: null },
  { id: "ai-infra", group: "ai", name: "算力、芯片与基础设施", description: "GPU、芯片、云服务、推理和数据中心。", tag: null },
  { id: "ai-open", group: "ai", name: "开源模型与开发者生态", description: "开源模型、数据集、框架、SDK 和社区项目。", tag: "开源生态" },
  { id: "ai-industry", group: "ai", name: "AI 产业、投融资与政策", description: "融资、合作、并购、产业趋势和政策治理。", tag: null },
  { id: "sec-vuln", group: "security", name: "漏洞与补丁", description: "CVE、漏洞公告、补丁、影响范围和利用风险。", tag: null },
  { id: "sec-threat", group: "security", name: "威胁情报与攻击事件", description: "攻击组织、恶意软件、钓鱼和供应链事件。", tag: null },
  { id: "sec-ransomware", group: "security", name: "勒索软件与数据泄露", description: "公开事件、监管通报和厂商月报，不读取泄露数据本身。", tag: "数据泄露" },
  { id: "sec-vendors", group: "security", name: "安全厂商、产品与技术动态", description: "安全厂商产品、检测能力和研究成果。", tag: null },
  { id: "sec-policy", group: "security", name: "政策法规与合规", description: "监管通报、政策法规、行业标准和合规要求。", tag: null },
  { id: "sec-research", group: "security", name: "安全研究、报告与工具", description: "安全研究、白皮书、开源工具和可复现分析。", tag: null },
];

/** 试读主题：卡片文案 + 从元见库里取哪一类内容。 */
export interface TrialThemeDef {
  id: TrialThemeId;
  group: TrialThemeGroup;
  name: string;
  description: string;
  /** 取数的类别（trial-themes.ts 的映射）；null 表示不限类别。 */
  category: CategoryKey | null;
  /** 可选叠加的标签；库里没有时退回只按 category 取。 */
  tag: string | null;
}

export const TRIAL_THEMES: readonly TrialThemeDef[] = TRIAL_THEME_COPY.map((theme) => ({ ...theme, category: TRIAL_THEME_TO_CATEGORY[theme.id] as CategoryKey }));

export function trialTheme(id: string): TrialThemeDef | null {
  return TRIAL_THEMES.find((theme) => theme.id === id) ?? null;
}

/** 试读页展示的一条真实情报：元见库里已收录/精选的一篇报道。 */
export interface TrialDemoItem {
  /** 元见条目 id，卡片链接到站内 /items/<id>。 */
  id: string;
  themeId: string;
  themeName: string;
  group: TrialThemeGroup;
  title: string;
  /** 信源名称。 */
  source: string;
  /** 内容类别中文标签（卡片角标）。 */
  categoryLabel: string | null;
  /** 发布时间的 ISO 字符串，未知时为 null。 */
  publishedAt: string | null;
  summary: string | null;
  /** AI 推荐理由。 */
  reason: string | null;
  /** 是否 AI 精选（false 为已收录、尚未入选）。 */
  selected: boolean;
}

export interface TrialDemoResponse {
  items: TrialDemoItem[];
  /** 取到内容的主题 id。 */
  covered: string[];
  /** 库里暂时没有内容、被跳过的主题 id。 */
  missing: string[];
}
