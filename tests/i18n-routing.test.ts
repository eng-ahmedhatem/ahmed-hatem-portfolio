import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_LOCALE, getLocaleHomepagePath, getLocalizedPath } from "../src/lib/i18n/config";

test("Arabic is the public default and owns the root homepage", () => {
  assert.equal(DEFAULT_LOCALE, "ar");
  assert.equal(getLocaleHomepagePath("ar"), "/");
  assert.equal(getLocaleHomepagePath("en"), "/en");
});

test("Arabic owns clean public paths and English keeps an explicit prefix", () => {
  assert.equal(getLocalizedPath("ar", "/work/example"), "/work/example");
  assert.equal(getLocalizedPath("en", "/work/example"), "/en/work/example");
});
