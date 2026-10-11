import assert from "node:assert/strict";
import { test } from "node:test";
import { PUBLIC_API_CATEGORY_KEYS } from "@yuanjian/contracts/taxonomy";
import { TRIAL_THEME_IDS, TRIAL_THEME_TO_CATEGORY } from "@yuanjian/contracts/trial-themes";

test("trial theme mapping covers all twelve themes with public API categories", () => {
  assert.equal(TRIAL_THEME_IDS.length, 12);
  assert.equal(new Set(TRIAL_THEME_IDS).size, 12);
  assert.deepEqual(Object.keys(TRIAL_THEME_TO_CATEGORY).sort(), [...TRIAL_THEME_IDS].sort());

  for (const themeId of TRIAL_THEME_IDS) {
    assert.ok(
      (PUBLIC_API_CATEGORY_KEYS as readonly string[]).includes(TRIAL_THEME_TO_CATEGORY[themeId]),
      `${themeId} must map to a public API category`,
    );
  }
});
