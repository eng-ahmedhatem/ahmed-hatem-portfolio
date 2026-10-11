import type { AdminContentRecord } from "./admin-api";

export function reconcileSavedRecord(
  current: AdminContentRecord,
  submitted: AdminContentRecord,
  saved: AdminContentRecord,
) {
  if (current.payload === submitted.payload) return saved;
  return { ...current, updatedAt: saved.updatedAt };
}
