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
