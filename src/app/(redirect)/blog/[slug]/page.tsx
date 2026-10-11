import BlogPostPage, {
  generateMetadata as generatePostMetadata,
} from "@/app/(site)/[locale]/blog/[slug]/page";

interface Props {
  params: Promise<{ slug: string }>;
}

function withArabicLocale(params: Props["params"]) {
  return params.then(({ slug }) => ({ locale: "ar", slug }));
}

export function generateMetadata({ params }: Props) {
  return generatePostMetadata({ params: withArabicLocale(params) });
}

export default function ArabicBlogPost({ params }: Props) {
  return <BlogPostPage params={withArabicLocale(params)} />;
}
