import type { SeoMetadata } from "@/domain/content/types";

export function createMockSeo(
  title: string,
  description: string,
  type: NonNullable<SeoMetadata["structuredData"]>["type"] = "WebPage",
  image?: SeoMetadata["openGraph"]["image"],
): SeoMetadata {
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      image,
    },
    structuredData: { type },
  };
}
