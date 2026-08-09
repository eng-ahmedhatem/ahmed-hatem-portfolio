import {
  SUPPORTED_LOCALES,
  type Direction,
  type Locale,
} from "@/domain/content/types";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "portfolio_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | undefined | null): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function getDirection(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getOpenGraphLocale(locale: Locale): "ar_AR" | "en_US" {
  return locale === "ar" ? "ar_AR" : "en_US";
}
