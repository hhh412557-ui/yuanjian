import assert from "node:assert/strict";
import { test } from "node:test";
import { isAiDailyCandidate } from "../packages/backend/src/reports/daily-scope.ts";

const item = (category: string | null, title: string, tags: string[] = [], summary: string | null = null) => ({ category, title, tags, summary });

test("AI model and product categories are included without keyword-dependent classification", () => {
  assert.equal(isAiDailyCandidate(item("ai-models", "新模型发布")), true);
  assert.equal(isAiDailyCandidate(item("ai-products", "产品功能更新")), true);
});

test("non-AI current affairs and general political news are excluded", () => {
  assert.equal(isAiDailyCandidate(item("current-affairs", "巴基斯坦宣布省政府进入紧急状态")), false);
  assert.equal(isAiDailyCandidate(item("general-news", "议会通过新的预算案")), false);
});

test("AI industry events and explicit AI policy remain eligible", () => {
  assert.equal(isAiDailyCandidate(item("industry", "OpenAI 完成新一轮融资")), true);
  assert.equal(isAiDailyCandidate(item("current-affairs", "监管机构发布生成式 AI 治理办法")), true);
  assert.equal(isAiDailyCandidate(item("industry", "公司更新产品", ["OpenAI"])), true);
});

test("shared security categories require an explicit AI connection", () => {
  assert.equal(isAiDailyCandidate(item("vulnerability", "常规 VPN 漏洞修复")), false);
  assert.equal(isAiDailyCandidate(item("research", "面向大模型的提示注入安全评估")), true);
});

test("AI-specific topic tags can identify concise headlines", () => {
  assert.equal(isAiDailyCandidate(item("paper", "新方法发布", ["多模态"])), true);
  assert.equal(isAiDailyCandidate(item("industry", "市场交易动态", ["综合新闻"])), false);
});
