import type { Metadata } from "next";

import { BlogIndex } from "@/components/blog/blog-index";
import { PageShell } from "@/components/ui/page-shell";
import { getBlogArchiveViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface BlogArchiveProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
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

export default async function BlogArchive({ params, searchParams }: BlogArchiveProps) {
  const locale = localeFromParam((await params).locale);
  const query = await searchParams;
  const archive = await getBlogArchiveViewModel(locale);
  const { intro } = archive;
  const path = intro.alternatePaths[locale] ?? `/${locale}/blog`;

  return (
    <PageShell
      intro={intro}
      structuredData={createWebPageStructuredData(locale, intro.seo, path)}
    >
      <BlogIndex
        archive={archive}
        initialQuery={typeof query.q === "string" ? query.q : ""}
        initialCategory={
          typeof query.category === "string" ? query.category : "all"
        }
        initialPage={
          typeof query.page === "string" ? Number.parseInt(query.page, 10) || 1 : 1
        }
      />
    </PageShell>
  );
}
