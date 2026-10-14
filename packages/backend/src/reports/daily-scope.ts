const AI_CATEGORIES = new Set(["ai-models", "ai-products"]);
const AI_TOPIC_TAGS = new Set(["Agent", "推理", "多模态", "图像生成", "RAG", "数据/训练", "具身智能", "MCP/工具调用"]);
const AI_ENTITY_TAGS = new Set(["OpenAI", "Anthropic", "DeepSeek", "DeepMind", "xAI", "Hugging Face"]);
const AI_TERMS = /\b(?:ai|agi|llm|gpt|chatgpt|openai|anthropic|deepseek|deepmind|gemini|claude|grok|llama|qwen|mistral|copilot|hugging\s?face)\b|人工智能|生成式\s*AI|大模型|大语言模型|基础模型|语言模型|智能体|AI安全|AI治理|AI监管|AI芯片|AI算力|AI基础设施|机器学习|深度学习|神经网络|模型训练|模型推理|模型安全|推理模型|多模态模型|检索增强生成|图像生成|具身智能/iu;

export interface AiDailyCandidate {
  category: string | null;
  tags: readonly string[];
  title: string;
  summary: string | null;
}

/** Dedicated AI categories pass directly; shared categories need explicit AI-topic evidence. */
export function isAiDailyCandidate(item: AiDailyCandidate): boolean {
  if (AI_CATEGORIES.has(item.category ?? "")) return true;
  if (item.tags.some((tag) => AI_TOPIC_TAGS.has(tag) || AI_ENTITY_TAGS.has(tag))) return true;
  return AI_TERMS.test(`${item.title}\n${item.summary ?? ""}`);
}
