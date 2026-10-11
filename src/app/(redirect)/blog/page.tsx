import BlogArchive, {
  generateMetadata as generateBlogMetadata,
} from "@/app/(site)/[locale]/blog/page";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

interface Props {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
}

export function generateMetadata() {
  return generateBlogMetadata({ params: ARABIC_PARAMS, searchParams: Promise.resolve({}) });
}

export default function ArabicBlogArchive({ searchParams }: Props) {
  return <BlogArchive params={ARABIC_PARAMS} searchParams={searchParams} />;
}
