import assert from "node:assert/strict";
import { test } from "node:test";

import { buildProjectFilters } from "../src/features/site/project-filters";

test("one category key has one button even when legacy records disagree on its label", () => {
  const filters = buildProjectFilters([
    { filterKey: "ecommerce", filterLabel: "madar-print" },
    { filterKey: "ecommerce", filterLabel: "E-commerce Websites" },
  ], "en");

  assert.deepEqual(filters, [{ key: "ecommerce", label: "E-commerce Websites", keys: ["ecommerce"] }]);
});

test("matching localized labels combine distinct legacy keys without losing either category", () => {
  const filters = buildProjectFilters([
    { filterKey: "test", filterLabel: "مواقع الشركات" },
    { filterKey: "company-website", filterLabel: "مواقع الشركات" },
    { filterKey: "ecommerce", filterLabel: "المتاجر الإلكترونية" },
  ], "ar");

  assert.deepEqual(filters, [
    { key: "test", label: "مواقع الشركات", keys: ["test", "company-website"] },
    { key: "ecommerce", label: "المتاجر الإلكترونية", keys: ["ecommerce"] },
  ]);
});
