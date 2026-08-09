import { notFound } from "next/navigation";

import type { Locale } from "@/domain/content/types";
import { isLocale } from "@/lib/i18n/config";

export function localeFromParam(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}
