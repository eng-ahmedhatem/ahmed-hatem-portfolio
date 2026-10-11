import type { Locale } from "@/domain/content/types";

type FilterableProject = { filterKey: string; filterLabel: string };

export type ProjectFilter = { key: string; label: string; keys: readonly string[] };

function isMachineLabel(label: string) {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/i.test(label);
}

export function buildProjectFilters(items: readonly FilterableProject[], locale: Locale): ProjectFilter[] {
  const labelsByKey = new Map<string, string>();
  for (const item of items) {
    const label = item.filterLabel.trim() || item.filterKey;
    const previous = labelsByKey.get(item.filterKey);
    if (!previous || (isMachineLabel(previous) && !isMachineLabel(label))) {
      labelsByKey.set(item.filterKey, label);
    }
  }

  const filtersByLabel = new Map<string, { key: string; label: string; keys: string[] }>();
  for (const [key, label] of labelsByKey) {
    const labelKey = label.toLocaleLowerCase(locale);
    const existing = filtersByLabel.get(labelKey);
    if (existing) existing.keys.push(key);
    else filtersByLabel.set(labelKey, { key, label, keys: [key] });
  }
  return Array.from(filtersByLabel.values());
}
