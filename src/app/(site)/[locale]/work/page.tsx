import type { Metadata } from "next";

import { PageShell } from "@/components/ui/page-shell";
import { WorkArchive } from "@/components/work/work-archive";
import { getWorkArchiveViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    filter?: string | string[];
    page?: string | string[];
  }>;
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = localeFromParam((await params).locale); const { intro } = await getWorkArchiveViewModel(locale);
  return createLocalizedMetadata({ locale, seo: intro.seo, alternatePaths: intro.alternatePaths });
}
export default async function Page({ params, searchParams }: Props) {
  const locale = localeFromParam((await params).locale);
  const archive = await getWorkArchiveViewModel(locale);
  const query = await searchParams;
  const requestedPage =
    typeof query.page === "string" ? Number.parseInt(query.page, 10) : 1;
  const path = archive.intro.alternatePaths[locale] ?? `/${locale}/work`;
  return <PageShell intro={archive.intro} structuredData={createWebPageStructuredData(locale, archive.intro.seo, path)}><WorkArchive archive={archive} initialFilter={typeof query.filter === "string" ? query.filter : "all"} initialPage={Number.isFinite(requestedPage) ? requestedPage : 1} /></PageShell>;
}
