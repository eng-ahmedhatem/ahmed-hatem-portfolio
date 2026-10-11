import assert from "node:assert/strict";
import { test } from "node:test";

import { reconcileSavedRecord } from "../src/components/admin/admin-state";
import type { AdminContentRecord } from "../src/components/admin/admin-api";

const submitted: AdminContentRecord = {
  kind: "project",
  entityId: "example",
  updatedAt: "2026-01-01T00:00:00.000Z",
  payload: { title: "First edit" },
};
const saved: AdminContentRecord = {
  ...submitted,
  updatedAt: "2026-01-02T00:00:00.000Z",
};

test("a save response applies normally when no newer edit exists", () => {
  assert.equal(reconcileSavedRecord(submitted, submitted, saved), saved);
});

test("a save response preserves edits made while the request was pending", () => {
  const current = { ...submitted, payload: { title: "Newer edit" } };
  const result = reconcileSavedRecord(current, submitted, saved);
  assert.equal(result.payload.title, "Newer edit");
  assert.equal(result.updatedAt, saved.updatedAt);
});
