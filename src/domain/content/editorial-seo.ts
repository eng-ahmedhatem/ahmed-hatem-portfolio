import type { Locale, SeoMetadata } from "./types";

export type EditorialKind = "project" | "post" | "category";

export const NEW_RECORD_TITLES: Record<Locale, Record<EditorialKind, string>> = {
  ar: { project: "مشروع جديد", post: "مقال جديد", category: "تصنيف جديد" },
  en: { project: "New project", post: "New article", category: "New category" },
};

export const NEW_RECORD_SUMMARIES: Record<Locale, string> = {
  ar: "أضف وصفًا واضحًا قبل النشر.",
  en: "Add a clear description before publishing.",
};

const LEGACY_SEO_SUMMARIES: Record<Locale, readonly string[]> = {
  ar: [NEW_RECORD_SUMMARIES.ar, "أضف وصفًا مختصرًا قبل النشر."],
  en: [NEW_RECORD_SUMMARIES.en, "Add a short summary before publishing."],
};

/** Keep legacy published records useful when their generated SEO copy was never edited. */
export function withEditorialSeoFallback(
  seo: SeoMetadata,
  kind: EditorialKind,
  locale: Locale,
  title: string,
  description: string,
): SeoMetadata {
  const placeholderTitle = NEW_RECORD_TITLES[locale][kind];
  const placeholderDescription = NEW_RECORD_SUMMARIES[locale];
  const resolvedTitle = title.trim() && title !== placeholderTitle ? title : placeholderTitle;
  const resolvedDescription = description.trim() && description !== placeholderDescription ? description : placeholderDescription;
  const titleFallback = (value: string) => value === placeholderTitle ? resolvedTitle : value;
  const descriptionFallback = (value: string) => LEGACY_SEO_SUMMARIES[locale].includes(value) ? resolvedDescription : value;

  return {
    ...seo,
    title: titleFallback(seo.title),
    description: descriptionFallback(seo.description),
    openGraph: {
      ...seo.openGraph,
      title: titleFallback(seo.openGraph.title),
      description: descriptionFallback(seo.openGraph.description),
      image: seo.openGraph.image
        ? { ...seo.openGraph.image, alt: seo.openGraph.image.alt.trim() || resolvedTitle }
        : undefined,
    },
  };
}
