import type { Metadata } from "next";

import { ContactRequest } from "@/components/contact/contact-request";
import { StructuredData } from "@/components/ui/structured-data";
import { getContactPageViewModel } from "@/features/site/view-models";
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
  const { intro } = await getContactPageViewModel(locale);
  return createLocalizedMetadata({
    locale,
    seo: intro.seo,
    alternatePaths: intro.alternatePaths,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const locale = localeFromParam((await params).locale);
  const { intro, contact } = await getContactPageViewModel(locale);
  const path = intro.alternatePaths[locale] ?? `/${locale}/contact`;

  return (
    <main id="main-content">
      <StructuredData data={createWebPageStructuredData(locale, intro.seo, path)} />
      <ContactRequest contact={contact} standalone />
    </main>
  );
}
