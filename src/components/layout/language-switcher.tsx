"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale, LocalizedRouteEntry } from "@/domain/content/types";
import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/config";

import styles from "./language-switcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
  routes: readonly LocalizedRouteEntry[];
}

const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
};

function normalizePath(path: string): string {
  let decodedPath = path;

  try {
    decodedPath = decodeURI(path);
  } catch {
    // Keep the original path when the URL contains a malformed escape sequence.
  }

  return decodedPath.length > 1 ? decodedPath.replace(/\/$/, "") : decodedPath;
}

function getLocaleHref(
  pathname: string,
  targetLocale: Locale,
  routes: readonly LocalizedRouteEntry[],
): string {
  const normalizedPath = normalizePath(pathname);
  const route = routes.find((entry) =>
    Object.values(entry.paths).some(
      (candidate) => candidate && normalizePath(candidate) === normalizedPath,
    ),
  );

  return route?.paths[targetLocale] ?? route?.fallbackPaths[targetLocale] ?? `/${targetLocale}`;
}

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageSwitcher({
  currentLocale,
  label,
  routes,
}: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.switcher} aria-label={label}>
      {(["ar", "en"] as const).map((locale) => (
        <Link
          key={locale}
          href={getLocaleHref(pathname, locale, routes)}
          hrefLang={locale}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-current={locale === currentLocale ? "page" : undefined}
          onClick={() => persistLocale(locale)}
        >
          {localeLabels[locale]}
        </Link>
      ))}
    </nav>
  );
}
