import type { MetadataRoute } from "next";

import { contentRepository } from "@/data/content-repository";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await contentRepository.getRouteManifest();

  return routes.flatMap((route) => {
    const languages: Record<string, string> = {};

    if (route.paths.ar) {
      languages.ar = absoluteUrl(route.paths.ar);
    }

    if (route.paths.en) {
      languages.en = absoluteUrl(route.paths.en);
    }

    languages["x-default"] = absoluteUrl(
      route.paths.en ?? route.paths.ar ?? "/en",
    );

    return Object.values(route.paths).flatMap((path) => {
      if (!path) {
        return [];
      }

      return [
        {
          url: absoluteUrl(path),
          lastModified: route.lastModified,
          changeFrequency: route.kind === "home" ? "weekly" : "monthly",
          priority: route.kind === "home" ? 1 : 0.7,
          alternates: { languages },
        },
      ];
    });
  });
}

export const dynamic = "force-static";
