"use client";

import { useEffect, useState } from "react";

import type { Locale, LocaleSwitchRoute } from "@/domain/content/types";
import {
  getLocaleHomepagePath,
  getLocaleSitemapPath,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
} from "@/lib/i18n/config";

import styles from "./language-switcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
  pathname: string;
  routes: readonly LocaleSwitchRoute[];
  variant?: "compact" | "panel";
  onNavigate?: () => void;
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
  routes: readonly LocaleSwitchRoute[],
): string {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === "/sitemap" || /^\/(ar|en)\/sitemap$/.test(normalizedPath)) {
    return getLocaleSitemapPath(targetLocale);
  }
  const route = routes.find((entry) =>
    Object.values(entry.paths).some(
      (candidate) => candidate && normalizePath(candidate) === normalizedPath,
    ),
  );

  return route?.paths[targetLocale]
    ?? route?.fallbackPaths[targetLocale]
    ?? getLocaleHomepagePath(targetLocale);
}

function preserveLocation(
  href: string,
  pathname: string,
  currentLocale: Locale,
  targetLocale: Locale,
  search: string,
  hash: string,
): string {
  if (
    pathname === getLocaleHomepagePath(currentLocale)
    && href === getLocaleHomepagePath(targetLocale)
  ) return `${href}${hash}`;
  if (
    ["work", "blog"].some((section) =>
      pathname === `/${currentLocale}/${section}` && href === `/${targetLocale}/${section}`,
    )
  ) return `${href}${search}`;
  return href;
}

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageSwitcher({
  currentLocale,
  label,
  pathname,
  routes,
  variant = "compact",
  onNavigate,
}: LanguageSwitcherProps) {
  const [location, setLocation] = useState({ search: "", hash: "" });

  useEffect(() => {
    const syncLocation = () => setLocation({ search: window.location.search, hash: window.location.hash });
    syncLocation();
    window.addEventListener("hashchange", syncLocation);
    window.addEventListener("popstate", syncLocation);
    return () => {
      window.removeEventListener("hashchange", syncLocation);
      window.removeEventListener("popstate", syncLocation);
    };
  }, []);

  return (
    <nav className={styles.switcher} aria-label={label} data-variant={variant}>
      {(["ar", "en"] as const).map((locale) => {
        const href = getLocaleHref(pathname, locale, routes);
        return <a
          key={locale}
          href={preserveLocation(href, pathname, currentLocale, locale, location.search, location.hash)}
          hrefLang={locale}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-current={locale === currentLocale ? "page" : undefined}
          onClick={(event) => {
            persistLocale(locale);
            onNavigate?.();
            if (locale === currentLocale) {
              event.preventDefault();
              return;
            }
            event.currentTarget.href = preserveLocation(href, pathname, currentLocale, locale, window.location.search, window.location.hash);
          }}
        >
          <span>{localeLabels[locale]}</span>
        </a>;
      })}
    </nav>
  );
}
