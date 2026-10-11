import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config";
import { resolveRequestLocale } from "@/lib/i18n/request-locale";

function requestCountry(request: NextRequest): string | null {
  return request.headers.get("cf-ipcountry")
    ?? request.headers.get("x-vercel-ip-country")
    ?? request.headers.get("cloudfront-viewer-country")
    ?? request.headers.get("x-country-code");
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/sitemap") {
    return NextResponse.next();
  }

  const locale = resolveRequestLocale(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    request.headers.get("accept-language"),
    requestCountry(request),
  );

  const response = locale === "ar"
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/en", request.url));
  response.headers.set("Vary", "Cookie, Accept-Language, CF-IPCountry, X-Vercel-IP-Country, CloudFront-Viewer-Country, X-Country-Code");
  return response;
}

export const config = {
  matcher: ["/", "/sitemap"],
};
