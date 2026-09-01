import type { Metadata } from "next";

import { ContactRequest } from "@/components/contact/contact-request";
import { AboutPreview } from "@/components/home/about-preview";
import { Hero } from "@/components/home/hero";
import { LatestProjects } from "@/components/home/latest-projects";
import { StructuredData } from "@/components/ui/structured-data";
import { getHomepageViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createHomepageStructuredData } from "@/lib/seo/structured-data";

interface HomepageProps { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: HomepageProps): Promise<Metadata> {
  const locale = localeFromParam((await params).locale);
  const { intro } = await getHomepageViewModel(locale);
  return createLocalizedMetadata({ locale, seo: intro.seo, alternatePaths: intro.alternatePaths });
}

export default async function Homepage({ params }: HomepageProps) {
  const locale = localeFromParam((await params).locale);
  const { about, contact, hero, intro, projects } = await getHomepageViewModel(locale);
  const path = intro.alternatePaths[locale] ?? `/${locale}`;
  return (
    <main id="main-content">
      <StructuredData data={createHomepageStructuredData(locale, intro.seo, path)} />
      <Hero hero={hero} />
      <LatestProjects projects={projects} />
      <AboutPreview about={about} />
      <ContactRequest contact={contact} />
    </main>
  );
}
