import type {
  Locale,
  ResolvedSiteSettings,
  SeoMetadata,
} from "@/domain/content/types";
import { absoluteUrl } from "@/lib/seo/site";

export function createWebsiteStructuredData(settings: ResolvedSiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${absoluteUrl(`/${settings.locale}`)}#website`,
    url: absoluteUrl(`/${settings.locale}`),
    name: settings.brandName,
    description: settings.seo.description,
    inLanguage: settings.locale,
  };
}

export function createWebPageStructuredData(
  locale: Locale,
  seo: SeoMetadata,
  path: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": seo.structuredData?.type ?? "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
  };
}

export function createHomepageStructuredData(locale: Locale, seo: SeoMetadata, path: string) {
  const url = absoluteUrl(path);
  return [
    createWebPageStructuredData(locale, seo, path),
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${url}#person`,
      name: locale === "ar" ? "أحمد حاتم" : "Ahmed Hatem",
      url,
      jobTitle: locale === "ar" ? "مطوّر WordPress ومواقع ويب" : "WordPress & Web Developer",
      inLanguage: locale,
    },
  ];
}

export function createProjectStructuredData(locale: Locale, seo: SeoMetadata, path: string, image?: string) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    name: seo.title,
    description: seo.description,
    inLanguage: locale,
    image: image ? absoluteUrl(image) : undefined,
  };
}

export function createBlogPostingStructuredData(
  locale: Locale,
  seo: SeoMetadata,
  path: string,
  publishedAt?: string,
  updatedAt?: string,
  image?: string,
) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: seo.title,
    description: seo.description,
    inLanguage: locale,
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    image: image ? absoluteUrl(image) : undefined,
    author: {
      "@type": "Person",
      name: locale === "ar" ? "أحمد حاتم" : "Ahmed Hatem",
      url: absoluteUrl(`/${locale}`),
    },
  };
}
