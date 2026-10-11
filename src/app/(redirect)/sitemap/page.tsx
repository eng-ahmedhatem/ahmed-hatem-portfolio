import SitemapPage, {
  generateMetadata as generateSitemapMetadata,
} from "@/app/(site)/[locale]/sitemap/page";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

export function generateMetadata() {
  return generateSitemapMetadata({ params: ARABIC_PARAMS });
}

export default function ArabicSitemapPage() {
  return <SitemapPage params={ARABIC_PARAMS} />;
}
