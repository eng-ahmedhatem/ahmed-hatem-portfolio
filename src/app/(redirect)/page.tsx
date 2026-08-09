import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config";
import { resolveRequestLocale } from "@/lib/i18n/request-locale";

export default async function LocaleDetectionPage() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = resolveRequestLocale(
    cookieStore.get(LOCALE_COOKIE_NAME)?.value,
    headerStore.get("accept-language"),
  );

  redirect(`/${locale}`);
}
