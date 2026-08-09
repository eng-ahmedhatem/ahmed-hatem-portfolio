import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { getHomepageViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface HomepageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomepageProps): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getHomepageViewModel(locale);

  return createLocalizedMetadata({
    locale,
    seo: intro.seo,
    alternatePaths: intro.alternatePaths,
  });
}

export default async function Homepage({ params }: HomepageProps) {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getHomepageViewModel(locale);
  const path = intro.alternatePaths[locale] ?? `/${locale}`;

  return (
    <PageShell
      intro={intro}
      structuredData={createWebPageStructuredData(locale, intro.seo, path)}
    />
  );
}
