import type { Locale } from "@/domain/content/types";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

interface LocalePreference {
  locale: Locale;
  quality: number;
  order: number;
}

function supportedLocaleFromLanguageTag(tag: string): Locale | null {
  const primaryLanguage = tag.trim().toLowerCase().split("-")[0];
  return isLocale(primaryLanguage) ? primaryLanguage : null;
}

export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const preferences = header
    .split(",")
    .map<LocalePreference | null>((entry, order) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const locale = supportedLocaleFromLanguageTag(tag);

      if (!locale) {
        return null;
      }

      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const parsedQuality = qualityParameter
        ? Number.parseFloat(qualityParameter.trim().slice(2))
        : 1;

      return {
        locale,
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        order,
      };
    })
    .filter((preference): preference is LocalePreference => preference !== null)
    .sort(
      (first, second) =>
        second.quality - first.quality || first.order - second.order,
    );

  return preferences[0]?.locale ?? DEFAULT_LOCALE;
}

export function resolveRequestLocale(
  savedPreference: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(savedPreference)) {
    return savedPreference;
  }

  return localeFromAcceptLanguage(acceptLanguage);
}
