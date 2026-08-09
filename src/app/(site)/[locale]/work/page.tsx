import type { Metadata } from "next";

import { ContentRows, PageShell } from "@/components/ui/page-shell";
import { getWorkArchiveViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface WorkArchiveProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: WorkArchiveProps): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getWorkArchiveViewModel(locale);
  return createLocalizedMetadata({
    locale,
    seo: intro.seo,
    alternatePaths: intro.alternatePaths,
  });
}

export default async function WorkArchive({ params }: WorkArchiveProps) {
  const locale = localeFromParam((await params).locale);
  const { intro, rows } = await getWorkArchiveViewModel(locale);
  const path = intro.alternatePaths[locale] ?? `/${locale}/work`;

  return (
    <PageShell
      intro={intro}
      structuredData={createWebPageStructuredData(locale, intro.seo, path)}
    >
      <ContentRows rows={rows} />
    </PageShell>
  );
}
