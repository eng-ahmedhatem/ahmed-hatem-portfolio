import type { BlogCategory, BlogPost, Project, Testimonial } from "./types";

export function createContentRecord(kind: "project" | "post" | "category" | "testimonial", id: string, now = new Date().toISOString()) {
  if (kind === "testimonial") {
    const payload: Testimonial = { id, status: "draft", featured: true, featuredOrder: 1, consentConfirmed: false, sourceUrl: "", avatar: { id: `${id}-avatar`, src: "", width: 200, height: 200, translations: { ar: { alt: "" }, en: { alt: "" } } }, translations: { ar: { name: "", role: "", company: "", quote: "" }, en: { name: "", role: "", company: "", quote: "" } }, updatedAt: now };
    return { kind, entityId: id, payload: payload as unknown as Record<string, unknown> };
  }
  const media = { id: `${id}-cover`, src: "", width: 1600, height: 1000, translations: { ar: { alt: "", caption: "" }, en: { alt: "", caption: "" } } };
  const translations = Object.fromEntries((["ar", "en"] as const).map((locale) => {
    const title = locale === "ar" ? { project: "مشروع جديد", post: "مقال جديد", category: "تصنيف جديد" }[kind] : { project: "New project", post: "New article", category: "New category" }[kind];
    const summary = locale === "ar" ? "أضف وصفًا واضحًا قبل النشر." : "Add a clear description before publishing.";
    const shared = { slug: `${id}-${locale}`, seo: { title, description: summary, robots: { index: true, follow: true }, openGraph: { title, description: summary } } };
    return [locale, kind === "category" ? { ...shared, name: title, description: summary } : kind === "post" ? { ...shared, title, excerpt: summary, content: [] } : { ...shared, title, excerpt: summary, role: "", overview: "", challenge: "", solution: "", projectType: locale === "ar" ? "موقع ويب" : "Website", filterLabel: locale === "ar" ? "مواقع ويب" : "Websites" }];
  }));
  const shared = { id, translations, updatedAt: now };
  const payload: Project | BlogPost | BlogCategory = kind === "project"
    ? { ...shared, status: "draft", filterKey: "websites", featured: false, technologies: [], links: [], media: [media], coverMediaId: media.id }
    : kind === "post" ? { ...shared, authorId: "ahmed-hatem", status: "draft", categoryIds: [], tags: [], featured: false, featuredImage: media }
      : shared;
  return { kind, entityId: id, payload: payload as unknown as Record<string, unknown> };
}
