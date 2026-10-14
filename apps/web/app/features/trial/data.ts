import {
  TRIAL_THEMES as TRIAL_THEME_DEFS,
  TRIAL_SURVEY_CADENCES,
  TRIAL_SURVEY_DEPTHS,
  TRIAL_SURVEY_FOCUS,
  TRIAL_SURVEY_GOALS,
  type TrialSurveyAnswers,
  type TrialSurveyFocusId,
  type TrialThemeGroup,
} from "@yuanjian/contracts/trial-profile";

export {
  EMPTY_TRIAL_SURVEY_ANSWERS,
  TRIAL_SURVEY_CADENCES,
  TRIAL_SURVEY_DEPTHS,
  TRIAL_SURVEY_FOCUS,
  TRIAL_SURVEY_GOALS,
  type TrialDemoItem,
  type TrialSurveyAnswers,
  type TrialSurveyCadenceId,
  type TrialSurveyDepthId,
  type TrialSurveyFocusId,
  type TrialSurveyGoalId,
  type TrialThemeGroup,
} from "@yuanjian/contracts/trial-profile";

export interface TrialTheme {
  id: string;
  group: TrialThemeGroup;
  name: string;
  description: string;
}

const GROUP_COPY: Record<TrialThemeGroup, { name: string; description: string }> = {
  ai: { name: "AI 领域", description: "从模型、智能体到产业基础设施，先看影响方向，再决定深入追踪什么。" },
  security: { name: "网络安全", description: "关注漏洞、威胁、勒索与安全研究，帮助你持续掌握风险变化。" },
};

/**
 * 主题按组摆好给界面用。主题定义本身（名字、说明、取数映射）在 contracts/trial-profile.ts，
 * 这里只负责分组与顺序，避免两处各写一份漂移。
 */
export const TRIAL_THEMES: Array<{ id: TrialThemeGroup; name: string; description: string; themes: TrialTheme[] }> =
  (["ai", "security"] as const).map((group) => ({
    id: group,
    name: GROUP_COPY[group].name,
    description: GROUP_COPY[group].description,
    themes: TRIAL_THEME_DEFS.filter((theme) => theme.group === group).map((theme) => ({ id: theme.id, group: theme.group, name: theme.name, description: theme.description })),
  }));

export function trialTopicsForFocus(focus: TrialSurveyFocusId[]): string[] {
  const focusSet = new Set(focus);
  const topicIds = new Set(TRIAL_SURVEY_FOCUS.filter((item) => focusSet.has(item.id)).flatMap((item) => item.themes));
  return TRIAL_THEMES.flatMap((group) => group.themes).filter((theme) => topicIds.has(theme.id)).map((theme) => theme.id);
}

export function trialSurveySummary(answers: TrialSurveyAnswers): string {
  const goal = TRIAL_SURVEY_GOALS.find((item) => item.id === answers.goal)?.name ?? "自定义关注";
  const depth = TRIAL_SURVEY_DEPTHS.find((item) => item.id === answers.depth)?.name ?? "标准简报";
  const cadence = TRIAL_SURVEY_CADENCES.find((item) => item.id === answers.cadence)?.name ?? "每日精选";
  return `${goal} · ${depth} · ${cadence}`;
}

export const ALL_TRIAL_THEME_IDS = TRIAL_THEMES.flatMap((group) => group.themes.map((theme) => theme.id));
