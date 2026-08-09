import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config";
import { resolveRequestLocale } from "@/lib/i18n/request-locale";

export function proxy(request: NextRequest) {
  const locale = resolveRequestLocale(
    request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    request.headers.get("accept-language"),
  );

  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: ["/"],
};
