import type { Metadata } from "next";

import { ArticleBody, PageShell } from "@/components/ui/page-shell";
import { getStaticPageViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getStaticPageViewModel(locale, "contact");
  return createLocalizedMetadata({
    locale,
    seo: intro.seo,
    alternatePaths: intro.alternatePaths,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const locale = localeFromParam((await params).locale);
  const { intro, body } = await getStaticPageViewModel(locale, "contact");
  const path = intro.alternatePaths[locale] ?? `/${locale}/contact`;

  return (
    <PageShell
      intro={intro}
      structuredData={createWebPageStructuredData(locale, intro.seo, path)}
    >
      <ArticleBody blocks={body} />
    </PageShell>
  );
}
