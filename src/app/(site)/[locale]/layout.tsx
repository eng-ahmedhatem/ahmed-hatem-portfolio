import type { ReactNode } from "react";

import { fontVariables } from "@/app/fonts";
import { MotionFoundation } from "@/components/motion/motion-foundation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StructuredData } from "@/components/ui/structured-data";
import { SUPPORTED_LOCALES } from "@/domain/content/types";
import { getSiteChromeViewModel } from "@/features/site/view-models";
import { getDirection } from "@/lib/i18n/config";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createWebsiteStructuredData } from "@/lib/seo/structured-data";

import "../../globals.css";

interface LocalizedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocalizedLayout({
  children,
  params,
}: LocalizedLayoutProps) {
  const locale = localeFromParam((await params).locale);
  const { settings, routes } = await getSiteChromeViewModel(locale);

  return (
    <html lang={locale} dir={getDirection(locale)} className={fontVariables}>
      <body>
        <MotionFoundation>
          <StructuredData data={createWebsiteStructuredData(settings)} />
          <SiteHeader settings={settings} routes={routes} />
          {children}
          <SiteFooter settings={settings} />
        </MotionFoundation>
      </body>
    </html>
  );
}
