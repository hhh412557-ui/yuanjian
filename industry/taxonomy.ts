// 永信至诚智能服务中心的网络安全行业词表。
// AIHOT 的采集、分析、归组和发布引擎继续复用；本文件只替换行业知识层。

export const CATEGORIES = [
  { key: "security-advisory", label: "监管通报", feedLabel: "监管通报", section: "监管与治理", guide: "CNCERT、CNVD、工信部、网信办等机构发布的通报、政策、处置要求与合规动态。仅有观点或媒体转载时，不归入监管通报。" },
  { key: "vulnerability", label: "漏洞与风险", feedLabel: "漏洞与风险", section: "漏洞与风险", guide: "CVE、NVD、CNVD 以及厂商漏洞公告、补丁、风险评级和影响范围。漏洞利用研究可同时带安全研究标签，但分类按当前材料的核心动作判断。" },
  { key: "threat-intel", label: "威胁情报", feedLabel: "威胁情报", section: "威胁情报", guide: "勒索、数据泄露、攻击组织、恶意软件、钓鱼、供应链和入侵活动的事实性情报。只说趋势的评论归分析与观点。" },
  { key: "industry", label: "行业动态", feedLabel: "行业动态", section: "行业动态", guide: "安全厂商、研究机构和企业发生的合作、产品、服务、投资、重大事故与公开回应。不要因为内容来自企业就自动当作一手事实。" },
  { key: "research", label: "安全研究", feedLabel: "安全研究", section: "研究与实践", guide: "漏洞复现、攻击技术、恶意样本、检测方法、威胁报告和可验证的安全研究。纯营销白皮书或没有方法与证据的宣传稿不属于研究。" },
  { key: "practice", label: "实战与工具", feedLabel: "实战与工具", section: "研究与实践", guide: "可复用的防御工具、应急响应、检测规则、配置建议和工程实践。与单次漏洞公告相比，重点在如何操作。", commentary: true },
  { key: "opinion", label: "分析与观点", feedLabel: "分析与观点", section: "分析与观点", guide: "安全行业判断、趋势分析、访谈和复盘。没有新增事实或可复用方法时，不能升级为监管通报、漏洞或威胁情报。", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

export const RELEASE: { category: string; tag: string; unit: string } | null = null;

export const PLAIN_TERMS: readonly string[] = ["cve", "nvd", "cnvd", "cncert", "ransomware", "phishing", "malware", "apt", "ioc", "soc", "csirt"];

export const ITEM_TYPES = [
  "security_advisory", "vulnerability_disclosure", "threat_report", "incident_report",
  "research_report", "policy_update", "opinion_analysis", "tutorial_explainer",
] as const;

export const CATEGORY_TAGS = [
  "监管通报", "漏洞披露", "威胁情报", "安全事件", "安全研究", "实战/工具", "分析/观点", "其他",
] as const;

export const TOPIC_TAGS = [
  "网络安全", "勒索情报", "暗网情报", "CVE", "NVD", "CNVD", "数据泄露", "恶意软件", "钓鱼攻击",
  "供应链", "云安全", "身份与访问", "终端安全", "工业控制", "安全运营", "漏洞利用", "安全媒体",
  "海外媒体", "厂商研究", "监管合规", "公开源", "待验证",
] as const;

export const ENTITY_TAGS = [
  "CNCERT", "CNVD", "工信部", "网信办", "CISA", "NVD", "FreeBuf", "安全牛", "嘶吼", "看雪", "永信至诚",
  "Microsoft", "Google", "Cisco", "Palo Alto Networks", "Sophos", "Mandiant", "BleepingComputer", "The Hacker News",
] as const;

export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  监管: "监管通报", 通报: "监管通报", 政策: "监管通报", 合规: "监管通报",
  漏洞: "漏洞披露", CVE: "CVE", cve: "CVE", 漏洞库: "漏洞披露", 补丁: "漏洞披露",
  勒索: "勒索情报", 勒索软件: "勒索情报", 勒索病毒: "勒索情报", 暗网: "暗网情报",
  数据泄露: "数据泄露", 泄露: "数据泄露", 恶意代码: "恶意软件", 木马: "恶意软件", 钓鱼: "钓鱼攻击",
  攻击: "威胁情报", 入侵: "威胁情报", APT: "威胁情报", 威胁报告: "威胁情报",
  研究: "安全研究", 报告: "安全研究", 复现: "安全研究", 工具: "实战/工具", 实战: "实战/工具",
  分析: "分析/观点", 观点: "分析/观点", 媒体: "安全媒体", 海外: "海外媒体", 厂商: "厂商研究",
  供应链攻击: "供应链", 云: "云安全", 云上安全: "云安全", 身份: "身份与访问", 终端: "终端安全",
  ICS: "工业控制", 工控: "工业控制", SOC: "安全运营", 合规监管: "监管合规", 公开来源: "公开源",
};

export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; otherNames?: string[] }> = {
  cncert: { name: "CNCERT", displayTag: "CNCERT", aliases: ["CNCERT", "国家互联网应急中心", "中国国家计算机网络应急技术处理协调中心"] },
  cnvd: { name: "CNVD", displayTag: "CNVD", aliases: ["CNVD", "国家信息安全漏洞共享平台"] },
  miit: { name: "工信部", displayTag: "工信部", aliases: ["工信部", "工业和信息化部"] },
  cac: { name: "网信办", displayTag: "网信办", aliases: ["网信办", "国家互联网信息办公室"] },
  cisa: { name: "CISA", displayTag: "CISA", aliases: ["CISA", "Cybersecurity and Infrastructure Security Agency"] },
  nvd: { name: "NVD", displayTag: "NVD", aliases: ["NVD", "National Vulnerability Database"] },
  freebuf: { name: "FreeBuf", displayTag: "FreeBuf", aliases: ["FreeBuf", "FreeBuf.COM"] },
  "anquan-niu": { name: "安全牛", displayTag: "安全牛", aliases: ["安全牛", "安全牛课堂"] },
  xishou: { name: "嘶吼", displayTag: "嘶吼", aliases: ["嘶吼", "4hou"] },
  kanxue: { name: "看雪", displayTag: "看雪", aliases: ["看雪", "看雪学院"] },
  "yongxin-zhicheng": { name: "永信至诚", displayTag: "永信至诚", aliases: ["永信至诚", "永信至诚科技"], otherNames: ["Yongxin Zhicheng"] },
  microsoft: { name: "Microsoft", displayTag: "Microsoft", aliases: ["Microsoft", "微软", "MSRC"] },
  google: { name: "Google", displayTag: "Google", aliases: ["Google", "谷歌", "Mandiant", "Google Cloud"] },
  cisco: { name: "Cisco", displayTag: "Cisco", aliases: ["Cisco", "思科", "Talos"] },
  "palo-alto": { name: "Palo Alto Networks", displayTag: "Palo Alto Networks", aliases: ["Palo Alto Networks", "Unit 42", "Unit42"] },
  sophos: { name: "Sophos", displayTag: "Sophos", aliases: ["Sophos"] },
  mandiant: { name: "Mandiant", displayTag: "Mandiant", aliases: ["Mandiant"] },
  bleepingcomputer: { name: "BleepingComputer", displayTag: "BleepingComputer", aliases: ["BleepingComputer"] },
  "the-hacker-news": { name: "The Hacker News", displayTag: "The Hacker News", aliases: ["The Hacker News", "THN"] },
};

export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "cncert", name: "CNCERT", patterns: [/cncert|国家互联网应急中心/i] },
  { id: "cnvd", name: "CNVD", patterns: [/cnvd|漏洞共享平台/i] },
  { id: "miit", name: "工信部", patterns: [/工信部|工业和信息化部/i] },
  { id: "cac", name: "网信办", patterns: [/网信办|国家互联网信息办公室/i] },
  { id: "cisa", name: "CISA", patterns: [/(?:\bcisa\b|cybersecurity and infrastructure security agency)/i] },
  { id: "nvd", name: "NVD", patterns: [/\bnvd\b|national vulnerability database/i] },
  { id: "freebuf", name: "FreeBuf", patterns: [/freebuf/i] },
  { id: "anquan-niu", name: "安全牛", patterns: [/安全牛/i] },
  { id: "xishou", name: "嘶吼", patterns: [/嘶吼|\b4hou\b/i] },
  { id: "kanxue", name: "看雪", patterns: [/看雪/i] },
  { id: "yongxin-zhicheng", name: "永信至诚", patterns: [/永信至诚|yongxin\s*zhicheng/i] },
  { id: "microsoft", name: "Microsoft", patterns: [/microsoft|微软|\bmsrc\b/i] },
  { id: "google", name: "Google", patterns: [/google|谷歌|mandiant/i] },
  { id: "cisco", name: "Cisco", patterns: [/cisco|思科|talos/i] },
  { id: "palo-alto", name: "Palo Alto Networks", patterns: [/palo alto|unit\s*42/i] },
  { id: "sophos", name: "Sophos", patterns: [/sophos/i] },
  { id: "mandiant", name: "Mandiant", patterns: [/mandiant/i] },
  { id: "bleepingcomputer", name: "BleepingComputer", patterns: [/bleepingcomputer/i] },
  { id: "the-hacker-news", name: "The Hacker News", patterns: [/the hacker news/i] },
];

export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "cncert", domains: ["cert.org.cn"] },
  { entityId: "cnvd", domains: ["cnvd.org.cn"] },
  { entityId: "miit", domains: ["miit.gov.cn"] },
  { entityId: "cac", domains: ["cac.gov.cn"] },
  { entityId: "cisa", domains: ["cisa.gov"] },
  { entityId: "nvd", domains: ["nvd.nist.gov"] },
  { entityId: "freebuf", domains: ["freebuf.com"] },
  { entityId: "anquan-niu", domains: ["aqniu.com"] },
  { entityId: "xishou", domains: ["4hou.com"] },
  { entityId: "kanxue", domains: ["kanxue.com"] },
  { entityId: "microsoft", domains: ["microsoft.com", "msrc.microsoft.com"] },
  { entityId: "google", domains: ["cloud.google.com", "mandiant.com"] },
  { entityId: "cisco", domains: ["talosintelligence.com", "cisco.com"] },
  { entityId: "palo-alto", domains: ["unit42.paloaltonetworks.com", "paloaltonetworks.com"] },
  { entityId: "sophos", domains: ["sophos.com"] },
  { entityId: "bleepingcomputer", domains: ["bleepingcomputer.com"] },
  { entityId: "the-hacker-news", domains: ["thehackernews.com"] },
];

export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [
  { entityId: "cisco", pattern: /Talos\b/i },
  { entityId: "palo-alto", pattern: /Unit\s*42/i },
  { entityId: "microsoft", pattern: /MSRC\b/i },
];
