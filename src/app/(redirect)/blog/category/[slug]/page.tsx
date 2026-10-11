import CategoryPage, {
  generateMetadata as generateCategoryMetadata,
} from "@/app/(site)/[locale]/blog/category/[slug]/page";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    page?: string | string[];
  }>;
}

function withArabicLocale(params: Props["params"]) {
  return params.then(({ slug }) => ({ locale: "ar", slug }));
}

export function generateMetadata({ params, searchParams }: Props) {
  return generateCategoryMetadata({ params: withArabicLocale(params), searchParams });
}

export default function ArabicCategoryPage({ params, searchParams }: Props) {
  return <CategoryPage params={withArabicLocale(params)} searchParams={searchParams} />;
}
