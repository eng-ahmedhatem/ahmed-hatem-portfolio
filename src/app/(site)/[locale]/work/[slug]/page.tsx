import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StructuredData } from "@/components/ui/structured-data";
import { ProjectDetail } from "@/components/work/project-detail";
import { contentRepository } from "@/data/content-repository";
import { SUPPORTED_LOCALES } from "@/domain/content/types";
import { getProjectViewModel } from "@/features/site/view-models";
import { localeFromParam } from "@/lib/i18n/locale-param";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { createProjectStructuredData } from "@/lib/seo/structured-data";

interface Props { params: Promise<{ locale: string; slug: string }> }
export async function generateStaticParams() { const groups = await Promise.all(SUPPORTED_LOCALES.map(async (locale) => ({ locale, projects: await contentRepository.getProjects(locale) }))); return groups.flatMap(({ locale, projects }) => projects.map((project) => ({ locale, slug: project.slug }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const value = await params; const locale = localeFromParam(value.locale); const view = await getProjectViewModel(locale, value.slug); if (!view) notFound(); return createLocalizedMetadata({ locale, seo: view.intro.seo, alternatePaths: view.intro.alternatePaths }); }
export default async function Page({ params }: Props) { const value = await params; const locale = localeFromParam(value.locale); const view = await getProjectViewModel(locale, value.slug); if (!view) notFound(); const path = view.intro.alternatePaths[locale] ?? `/${locale}/work/${value.slug}`; return <><StructuredData data={createProjectStructuredData(locale, view.intro.seo, path, view.project.cover.src)} /><ProjectDetail view={view} /></>; }
