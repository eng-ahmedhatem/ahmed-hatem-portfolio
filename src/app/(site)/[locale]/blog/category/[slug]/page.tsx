import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogIndex } from "@/components/blog/blog-index";
import { PageShell } from "@/components/ui/page-shell";
import { contentRepository } from "@/data/content-repository";
import { SUPPORTED_LOCALES } from "@/domain/content/types";
import { getCategoryViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const localizedCategories = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => ({
      locale,
      categories: await contentRepository.getCategories(locale),
    })),
  );

  return localizedCategories.flatMap(({ locale, categories }) =>
    categories.map((category) => ({ locale, slug: category.slug })),
  );
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const routeParams = await params;
  const locale = localeFromParam(routeParams.locale);
  const category = await getCategoryViewModel(locale, routeParams.slug);

  if (!category) {
    notFound();
  }

  return createLocalizedMetadata({
    locale,
    seo: category.intro.seo,
    alternatePaths: category.intro.alternatePaths,
  });
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const routeParams = await params;
  const query = await searchParams;
  const locale = localeFromParam(routeParams.locale);
  const category = await getCategoryViewModel(locale, routeParams.slug);

  if (!category) {
    notFound();
  }

  const path =
    category.intro.alternatePaths[locale] ??
    `/${locale}/blog/category/${routeParams.slug}`;

  return (
    <PageShell
      intro={category.intro}
      structuredData={createWebPageStructuredData(
        locale,
        category.intro.seo,
        path,
      )}
    >
      <BlogIndex
        archive={category}
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
