import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_LOCALE, getLocaleHomepagePath } from "../src/lib/i18n/config";
import {
  localeFromCountry,
  resolveRequestLocale,
} from "../src/lib/i18n/request-locale";

test("Arabic is the public default and owns the root homepage", () => {
  assert.equal(DEFAULT_LOCALE, "ar");
  assert.equal(getLocaleHomepagePath("ar"), "/");
  assert.equal(getLocaleHomepagePath("en"), "/en");
  assert.equal(resolveRequestLocale(undefined, null), "ar");
});

test("country detection serves Arabic countries in Arabic and other countries in English", () => {
  assert.equal(localeFromCountry("EG"), "ar");
  assert.equal(localeFromCountry("sa"), "ar");
  assert.equal(localeFromCountry("US"), "en");
  assert.equal(localeFromCountry("FR"), "en");
  assert.equal(localeFromCountry("unknown"), null);
});

test("saved language choice wins over country and browser language", () => {
  assert.equal(resolveRequestLocale("en", "ar-EG", "EG"), "en");
  assert.equal(resolveRequestLocale("ar", "en-US", "US"), "ar");
});

test("country wins when known, otherwise Accept-Language is the fallback", () => {
  assert.equal(resolveRequestLocale(undefined, "en-US", "EG"), "ar");
  assert.equal(resolveRequestLocale(undefined, "ar-EG", "US"), "en");
  assert.equal(resolveRequestLocale(undefined, "en-US,en;q=0.9", null), "en");
  assert.equal(resolveRequestLocale(undefined, "ar-EG,ar;q=0.9", null), "ar");
});
