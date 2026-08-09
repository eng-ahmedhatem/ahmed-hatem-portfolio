import type { Metadata } from "next";

import { ContentRows, PageShell } from "@/components/ui/page-shell";
import { getBlogArchiveViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface BlogArchiveProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogArchiveProps): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getBlogArchiveViewModel(locale);
  return createLocalizedMetadata({
    locale,
    seo: intro.seo,
    alternatePaths: intro.alternatePaths,
  });
}

export default async function BlogArchive({ params }: BlogArchiveProps) {
  const locale = localeFromParam((await params).locale);
  const { intro, rows } = await getBlogArchiveViewModel(locale);
  const path = intro.alternatePaths[locale] ?? `/${locale}/blog`;

  return (
    <PageShell
      intro={intro}
      structuredData={createWebPageStructuredData(locale, intro.seo, path)}
    >
      <ContentRows rows={rows} />
    </PageShell>
  );
}
