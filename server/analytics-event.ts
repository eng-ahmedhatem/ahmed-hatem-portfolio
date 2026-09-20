import type { Locale } from "../src/domain/content/types";

/** Store only public route paths and referrer origins, never query strings or fragments. */
export function analyticsLocation(path: string, locale: Locale, referrer?: string) {
  if (!path.startsWith(`/${locale}`) || path.startsWith("//") || path.includes("\\")) return null;
  const url = new URL(path, "https://portfolio.invalid");
  if (url.origin !== "https://portfolio.invalid" || !new RegExp(`^/${locale}(?:/(?:work|blog|about|contact)(?:/[^/]+){0,3})?/?$`).test(url.pathname)) return null;
  let referral: string | null = null;
  if (referrer) {
    try { const source = new URL(referrer); if (["https:", "http:"].includes(source.protocol)) referral = source.origin; } catch { /* Invalid referrers are optional. */ }
  }
  return { path: url.pathname, referrer: referral };
}
