import type { Locale } from "../src/domain/content/types";

/** Store only public route paths and referrer origins, never query strings or fragments. */
export function analyticsLocation(path: string, locale: Locale, referrer?: string) {
  if (path.startsWith("//") || path.includes("\\")) return null;
  const url = new URL(path, "https://portfolio.invalid");
  const publicPathPattern = locale === "ar"
    ? /^\/(?:work|blog|about|contact|sitemap)(?:\/[^/]+){0,3}\/?$|^\/$/
    : /^\/en(?:\/(?:work|blog|about|contact|sitemap)(?:\/[^/]+){0,3})?\/?$/;
  if (url.origin !== "https://portfolio.invalid" || !publicPathPattern.test(url.pathname)) return null;
  let referral: string | null = null;
  if (referrer) {
    try { const source = new URL(referrer); if (["https:", "http:"].includes(source.protocol)) referral = source.origin; } catch { /* Invalid referrers are optional. */ }
  }
  return { path: url.pathname, referrer: referral };
}
