import type { ReactNode } from "react";
import Script from "next/script";

import { fontVariables } from "@/app/fonts";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { MotionFoundation } from "@/components/motion/motion-foundation";
import { SiteScrollProgress } from "@/components/motion/route-transition";
import { ContactDock } from "@/components/layout/contact-dock";
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

const THEME_INITIALIZER = `try{const key="ah-portfolio-theme:v1";const saved=localStorage.getItem(key);document.documentElement.dataset.theme=saved==="light"?"light":"dark"}catch{document.documentElement.dataset.theme="dark"}`;

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
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${fontVariables} notranslate`}
      data-scroll-behavior="smooth"
      translate="no"
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INITIALIZER }}
        />
        <MotionFoundation>
          <SiteScrollProgress />
          <StructuredData data={createWebsiteStructuredData(settings)} />
          <SiteHeader settings={settings} routes={routes} />
          {children}
          <SiteFooter settings={settings} />
          <ContactDock settings={settings} />
          <AnalyticsTracker locale={locale} />
        </MotionFoundation>
      </body>
    </html>
  );
}
