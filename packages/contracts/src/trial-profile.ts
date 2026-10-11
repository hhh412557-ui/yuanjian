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
