import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import { MotionFoundation } from "@/components/motion/motion-foundation";
import { localeFromParam } from "@/lib/i18n/locale-param";
import "../../../globals.css";

export const metadata: Metadata = { title: "معاينة خاصة | Private preview", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };
export default async function PreviewLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const locale = localeFromParam((await params).locale);
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fontVariables} data-theme="dark"><body><MotionFoundation>{children}</MotionFoundation></body></html>;
}
