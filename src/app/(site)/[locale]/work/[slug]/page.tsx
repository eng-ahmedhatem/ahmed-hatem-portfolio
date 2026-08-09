import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleBody, PageShell } from "@/components/ui/page-shell";
import { contentRepository } from "@/data/content-repository";
import { SUPPORTED_LOCALES } from "@/domain/content/types";
import { getProjectViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createWebPageStructuredData } from "@/lib/seo/structured-data";

interface ProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const localizedProjects = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => ({
      locale,
      projects: await contentRepository.getProjects(locale),
    })),
  );

  return localizedProjects.flatMap(({ locale, projects }) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const routeParams = await params;
  const locale = localeFromParam(routeParams.locale);
  const project = await getProjectViewModel(locale, routeParams.slug);

  if (!project) {
    notFound();
  }

  return createLocalizedMetadata({
    locale,
    seo: project.intro.seo,
    alternatePaths: project.intro.alternatePaths,
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const routeParams = await params;
  const locale = localeFromParam(routeParams.locale);
  const project = await getProjectViewModel(locale, routeParams.slug);

  if (!project) {
    notFound();
  }

  const path =
    project.intro.alternatePaths[locale] ??
    `/${locale}/work/${routeParams.slug}`;

  return (
    <PageShell
      intro={project.intro}
      structuredData={createWebPageStructuredData(
        locale,
        project.intro.seo,
        path,
      )}
    >
      <ArticleBody blocks={project.body} />
    </PageShell>
  );
}
