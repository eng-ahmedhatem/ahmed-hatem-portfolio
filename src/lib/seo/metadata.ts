import type { Metadata } from "next";

import type {
  Locale,
  SeoMetadata,
  TranslationState,
} from "@/domain/content/types";
import { getOpenGraphLocale } from "@/lib/i18n/config";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site";

interface LocalizedMetadataInput {
  locale: Locale;
  seo: SeoMetadata;
  alternatePaths: TranslationState<string>;
}

export function createLocalizedMetadata({
  locale,
  seo,
  alternatePaths,
}: LocalizedMetadataInput): Metadata {
  const activePath = alternatePaths[locale] ?? `/${locale}`;
  const canonical = seo.canonicalUrl
    ? absoluteUrl(seo.canonicalUrl)
    : absoluteUrl(activePath);
  const languageAlternates: Record<string, string> = {};

  if (alternatePaths.ar) {
    languageAlternates.ar = absoluteUrl(alternatePaths.ar);
  }

  if (alternatePaths.en) {
    languageAlternates.en = absoluteUrl(alternatePaths.en);
  }

  languageAlternates["x-default"] = absoluteUrl(
    alternatePaths.en ?? alternatePaths.ar ?? activePath,
  );

  const fallbackImage = {
    url: "/assets/logo/logo.png",
    width: 1738,
    height: 721,
    alt: locale === "ar" ? "شعار أحمد حاتم" : "Ahmed Hatem logo",
  };
  const socialImage = seo.openGraph.image ?? fallbackImage;
  const images = [
    {
      ...socialImage,
      url: absoluteUrl(socialImage.url),
    },
  ];

  return {
    metadataBase: getSiteUrl(),
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    robots: {
      index: seo.robots.index,
      follow: seo.robots.follow,
    },
    openGraph: {
      type: seo.structuredData?.type === "BlogPosting" ? "article" : "website",
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      url: canonical,
      siteName: locale === "ar" ? "أحمد حاتم" : "Ahmed Hatem",
      locale: getOpenGraphLocale(locale),
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_AR"],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      images: images?.map((image) => image.url),
    },
  };
}
