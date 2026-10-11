import {
  EMPTY_TRIAL_SURVEY_ANSWERS,
  TRIAL_SURVEY_CADENCES,
  TRIAL_SURVEY_DEPTHS,
  TRIAL_SURVEY_FOCUS,
  TRIAL_SURVEY_GOALS,
  type TrialSurveyAnswers,
  type TrialSurveyCadenceId,
  type TrialSurveyDepthId,
  type TrialSurveyFocusId,
  type TrialSurveyGoalId,
} from "@yuanjian/contracts/trial-profile";

export {
  EMPTY_TRIAL_SURVEY_ANSWERS,
  TRIAL_SURVEY_CADENCES,
  TRIAL_SURVEY_DEPTHS,
  TRIAL_SURVEY_FOCUS,
  TRIAL_SURVEY_GOALS,
  type TrialSurveyAnswers,
  type TrialSurveyCadenceId,
  type TrialSurveyDepthId,
  type TrialSurveyFocusId,
  type TrialSurveyGoalId,
} from "@yuanjian/contracts/trial-profile";

export type TrialThemeGroup = "ai" | "security";

export interface TrialTheme {
  id: string;
  group: TrialThemeGroup;
  name: string;
  description: string;
}

export interface TrialDemoItem {
  id: string;
  group: TrialThemeGroup;
  themeId: string;
  themeName: string;
  title: string;
  source: string;
  sourceType: string;
  publishedAt: string;
  summary: string;
  whyItMatters: string;
  url: string;
  priority: number;
}

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

export const TRIAL_THEMES: Array<{ id: TrialThemeGroup; name: string; description: string; themes: TrialTheme[] }> = [
  {
    id: "ai",
    name: "AI 领域",
    description: "从模型、智能体到产业基础设施，先看影响方向，再决定深入追踪什么。",
    themes: [
      { id: "ai-models", group: "ai", name: "大模型动态", description: "模型发布、版本变化、能力评测与安全边界。" },
      { id: "ai-agents", group: "ai", name: "AI Agent / 智能体", description: "智能体、工具调用、工作流和任务执行。" },
      { id: "ai-products", group: "ai", name: "AI 应用与产品", description: "AI 产品、功能更新和行业落地案例。" },
      { id: "ai-infra", group: "ai", name: "算力、芯片与基础设施", description: "GPU、芯片、云服务、推理和数据中心。" },
      { id: "ai-open", group: "ai", name: "开源模型与开发者生态", description: "开源模型、数据集、框架、SDK 和社区项目。" },
      { id: "ai-industry", group: "ai", name: "AI 产业、投融资与政策", description: "融资、合作、并购、产业趋势和政策治理。" },
    ],
  },
  {
    id: "security",
    name: "网络安全",
    description: "只整理公开资讯和公开信源，不采集暗网、泄露数据或敏感权限内容。",
    themes: [
      { id: "sec-vuln", group: "security", name: "漏洞与补丁", description: "CVE、漏洞公告、补丁、影响范围和利用风险。" },
      { id: "sec-threat", group: "security", name: "威胁情报与攻击事件", description: "攻击组织、恶意软件、钓鱼和供应链事件。" },
      { id: "sec-ransomware", group: "security", name: "勒索软件与数据泄露", description: "公开事件、监管通报和厂商月报，不读取泄露数据本身。" },
      { id: "sec-vendors", group: "security", name: "安全厂商、产品与技术动态", description: "安全厂商产品、检测能力和研究成果。" },
      { id: "sec-policy", group: "security", name: "政策法规与合规", description: "监管通报、政策法规、行业标准和合规要求。" },
      { id: "sec-research", group: "security", name: "安全研究、报告与工具", description: "安全研究、白皮书、开源工具和可复现分析。" },
    ],
  },
];

// Direction-validation material only: hand-curated examples, not a live feed.
export const TRIAL_DEMO_ITEMS: TrialDemoItem[] = [
  {
    id: "demo-ai-models", group: "ai", themeId: "ai-models", themeName: "大模型动态",
    title: "模型更新不只看参数量：能力、价格与安全边界需要一起判断",
    source: "OpenAI News", sourceType: "官方新闻 / RSS 候选", publishedAt: "2026-10-09",
    summary: "本条演示大模型动态的整理方式：把版本变化拆成能力变化、调用成本、适用场景和安全限制，而不是只记录一次发布公告。",
    whyItMatters: "用户可以快速判断变化是否会影响产品选型、开发流程或模型成本。",
    url: "https://openai.com/news/", priority: 1,
  },
  {
    id: "demo-ai-agents", group: "ai", themeId: "ai-agents", themeName: "AI Agent / 智能体",
    title: "Agent 关注点从‘能调用工具’转向‘能否完成任务闭环’",
    source: "Google DeepMind Blog", sourceType: "官方研究博客", publishedAt: "2026-10-08",
    summary: "本条演示智能体资讯的筛选方式：重点记录规划、工具调用、状态记忆、人工确认和失败恢复。",
    whyItMatters: "它对应企业是否能够把智能体放进真实工作流，而不是停留在演示层。",
    url: "https://deepmind.google/blog/", priority: 2,
  },
  {
    id: "demo-ai-products", group: "ai", themeId: "ai-products", themeName: "AI 应用与产品",
    title: "AI 产品价值验证：从功能上新转向可复用的工作流收益",
    source: "TechCrunch AI", sourceType: "科技媒体", publishedAt: "2026-10-08",
    summary: "本条演示产品动态的关注重点：产品解决什么问题、谁可以使用、是否降低操作成本，以及功能是否进入可持续使用阶段。",
    whyItMatters: "能把产品发布新闻变成对用户有决策价值的试用线索。",
    url: "https://techcrunch.com/category/artificial-intelligence/", priority: 3,
  },
  {
    id: "demo-ai-open", group: "ai", themeId: "ai-open", themeName: "开源模型与开发者生态",
    title: "开源生态的有效信号：模型、数据集、工具和社区是否形成组合",
    source: "Hugging Face Blog", sourceType: "开源社区博客", publishedAt: "2026-10-07",
    summary: "本条观察权重、许可证、数据集、推理工具和社区采用情况是否形成可用组合，而不是只记录一个仓库名称。",
    whyItMatters: "开发者可以据此判断项目是短期热点，还是值得纳入技术路线。",
    url: "https://huggingface.co/blog", priority: 4,
  },
  {
    id: "demo-ai-infra", group: "ai", themeId: "ai-infra", themeName: "算力、芯片与基础设施",
    title: "推理成本和部署效率，正在成为 AI 产品竞争的基础指标",
    source: "NVIDIA AI Blog", sourceType: "厂商技术博客", publishedAt: "2026-10-07",
    summary: "本条演示基础设施资讯的整理方式：同时关注硬件能力、云端供给、推理效率、部署方式和实际成本。",
    whyItMatters: "基础设施变化会影响模型选型、产品定价和企业落地周期。",
    url: "https://blogs.nvidia.com/blog/category/ai/", priority: 5,
  },
  {
    id: "demo-ai-industry", group: "ai", themeId: "ai-industry", themeName: "AI 产业、投融资与政策",
    title: "AI 产业信息需要同时看商业化进展、治理要求和落地条件",
    source: "MIT Technology Review AI", sourceType: "科技媒体 / 产业观察", publishedAt: "2026-10-06",
    summary: "本条演示产业与政策信息的筛选方式：保留已发生的融资、合作、监管和产品落地事实，压低只有观点没有事实增量的内容。",
    whyItMatters: "这类信息帮助用户建立行业判断，而不是只追逐单个模型发布。",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/", priority: 6,
  },
  {
    id: "demo-sec-vuln", group: "security", themeId: "sec-vuln", themeName: "漏洞与补丁",
    title: "漏洞情报要把 CVE、受影响资产、补丁状态和利用风险放在一起",
    source: "NVD / CVE", sourceType: "官方 JSON API", publishedAt: "2026-10-09",
    summary: "本条演示漏洞信息的交付格式：不只给编号，还要说明影响范围、官方修复建议、公开利用证据和下一步动作。",
    whyItMatters: "安全人员可以直接把情报转成排查、修复和验证任务。",
    url: "https://nvd.nist.gov/vuln/search", priority: 1,
  },
  {
    id: "demo-sec-threat", group: "security", themeId: "sec-threat", themeName: "威胁情报与攻击事件",
    title: "攻击事件摘要应同时记录攻击者、手法、目标和证据来源",
    source: "CISA Cybersecurity Advisories", sourceType: "官方通报 / RSS 候选", publishedAt: "2026-10-08",
    summary: "本条演示威胁情报的整理方式：区分已确认事实、厂商分析和待验证判断，不把媒体标题直接当作事件结论。",
    whyItMatters: "结构化记录便于后续和企业资产、检测规则以及应急流程关联。",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories", priority: 2,
  },
  {
    id: "demo-sec-ransomware", group: "security", themeId: "sec-ransomware", themeName: "勒索软件与数据泄露",
    title: "勒索情报先做公开事件跟踪，不采集泄露站点和泄露数据",
    source: "BleepingComputer", sourceType: "公开安全媒体", publishedAt: "2026-10-08",
    summary: "本条用于验证勒索主题的边界：只整理公开报道、监管通报和厂商报告中的事实，不直接访问暗网或传播泄露数据。",
    whyItMatters: "既保留勒索情报的业务价值，也控制敏感数据和未授权采集风险。",
    url: "https://www.bleepingcomputer.com/", priority: 3,
  },
  {
    id: "demo-sec-vendors", group: "security", themeId: "sec-vendors", themeName: "安全厂商、产品与技术动态",
    title: "安全厂商动态的价值在于检测方法、处置建议和可验证技术细节",
    source: "Palo Alto Networks Unit 42", sourceType: "厂商研究博客", publishedAt: "2026-10-07",
    summary: "本条演示安全厂商内容的筛选方式：关注技术事实和处置方法，降低纯宣传稿在情报流中的权重。",
    whyItMatters: "能够帮助读者发现可验证的防御方法，而不是只看到产品营销信息。",
    url: "https://unit42.paloaltonetworks.com/", priority: 4,
  },
  {
    id: "demo-sec-policy", group: "security", themeId: "sec-policy", themeName: "政策法规与合规",
    title: "监管通报需要拆出适用对象、时间节点和具体行动要求",
    source: "CNCERT", sourceType: "官方监管网站", publishedAt: "2026-10-06",
    summary: "本条演示合规信息的整理方式：从通报原文提取适用范围、责任主体、时间要求和是否需要持续跟踪。",
    whyItMatters: "政策信息只有转成明确行动项，才真正能服务企业判断。",
    url: "https://www.cert.org.cn/", priority: 5,
  },
  {
    id: "demo-sec-research", group: "security", themeId: "sec-research", themeName: "安全研究、报告与工具",
    title: "安全研究的交付价值取决于证据、方法和能否复用",
    source: "Cisco Talos", sourceType: "厂商研究博客", publishedAt: "2026-10-07",
    summary: "本条演示研究报告的筛选方式：说明研究对象、分析方法、关键证据和对检测或响应工作的可迁移价值。",
    whyItMatters: "让报告和工具从值得阅读进一步变成可以用于工作的内容。",
    url: "https://blog.talosintelligence.com/", priority: 4,
  },
];

export const ALL_TRIAL_THEME_IDS = TRIAL_THEMES.flatMap((group) => group.themes.map((theme) => theme.id));

export function selectTrialDemoItems(selected: string[], limit = 8): TrialDemoItem[] {
  const selectedSet = new Set(selected);
  const matches = TRIAL_DEMO_ITEMS.filter((item) => selectedSet.has(item.themeId)).sort((a, b) => a.priority - b.priority);
  const selectedThemeMatches = selected.flatMap((themeId) => matches.filter((item) => item.themeId === themeId).slice(0, 1));
  const rest = matches.filter((item) => !selectedThemeMatches.some((chosen) => chosen.id === item.id));
  return [...selectedThemeMatches, ...rest].slice(0, limit);
}
