import assert from "node:assert/strict";
import { test } from "node:test";
import { v1ItemsCacheKey } from "@yuanjian/backend/publication/v1";
import { mergeProfileItems, resolveScope } from "@yuanjian/backend/mcp-personalization";
import type { CallerProfile } from "@yuanjian/backend/mcp-profile";

const profile: CallerProfile = {
  label: "演示用户",
  themes: ["ai-products"],
  categories: ["ai-products"],
  cadence: "daily",
  depth: "quick",
  goal: "overview",
};

test("scope resolution gives explicit category and all-scope priority over the profile", () => {
  assert.deepEqual(resolveScope({}, profile), { categories: ["ai-products"], scope: "profile", applied: true });
  assert.deepEqual(resolveScope({ scope: "all" }, profile), { categories: null, scope: "all", applied: false });
  assert.deepEqual(resolveScope({ category: "vulnerability", scope: "profile" }, profile), { categories: ["vulnerability"], scope: "all", applied: false });
  assert.deepEqual(resolveScope({}, null), { categories: null, scope: "all", applied: false });
});

test("profile results stay first and supplement all-public results when sparse", () => {
  const merged = mergeProfileItems(
    [{ id: "profile-1" }, { id: "profile-2" }],
    [{ id: "profile-2" }, { id: "public-1" }, { id: "public-2" }],
    4,
  );
  assert.deepEqual(merged.items.map((item) => item.id), ["profile-1", "profile-2", "public-1", "public-2"]);
  assert.deepEqual(merged, {
    items: [{ id: "profile-1" }, { id: "profile-2" }, { id: "public-1" }, { id: "public-2" }],
    matched: 2,
    relaxed: true,
    supplemented: 2,
  });
});

test("v1 cache keys isolate category sets but normalize their order", () => {
  const base = { mode: "selected" as const, window: "24h" as const, by: "timeline" as const, q: null, limit: 10, cursor: null };
  const aiThenSecurity = v1ItemsCacheKey({ ...base, categories: ["ai-products", "vulnerability"] });
  const securityThenAi = v1ItemsCacheKey({ ...base, categories: ["vulnerability", "ai-products"] });
  const aiOnly = v1ItemsCacheKey({ ...base, categories: ["ai-products"] });
  assert.equal(aiThenSecurity, securityThenAi);
  assert.notEqual(aiThenSecurity, aiOnly);
});
