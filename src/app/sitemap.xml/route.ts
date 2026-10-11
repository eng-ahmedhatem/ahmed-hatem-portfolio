import { contentRepository } from "@/data/content-repository";
import { absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const routes = await contentRepository.getRouteManifest();
  const entries = routes.flatMap((route) => {
    const alternates = Object.entries(route.paths)
      .filter((entry): entry is ["ar" | "en", string] => Boolean(entry[1]))
      .map(([locale, path]) => ({ locale, url: absoluteUrl(path) }));
    const xDefault = alternates.find(({ locale }) => locale === "ar")?.url
      ?? alternates[0]?.url;

    return alternates.map(({ url }) => {
      const alternateLinks = [
        ...alternates.map(({ locale: alternateLocale, url: alternateUrl }) =>
          `<xhtml:link rel="alternate" hreflang="${alternateLocale}" href="${escapeXml(alternateUrl)}" />`,
        ),
        ...(xDefault
          ? [`<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(xDefault)}" />`]
          : []),
      ].join("\n");
      const lastModified = route.lastModified
        ? `<lastmod>${escapeXml(route.lastModified)}</lastmod>`
        : "";

      return `<url>
<loc>${escapeXml(url)}</loc>
${alternateLinks}
${lastModified}
<changefreq>${route.kind === "home" ? "weekly" : "monthly"}</changefreq>
<priority>${route.kind === "home" ? "1.0" : "0.7"}</priority>
</url>`;
    });
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
