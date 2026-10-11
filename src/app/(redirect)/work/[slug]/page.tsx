import ProjectPage, {
  generateMetadata as generateProjectMetadata,
} from "@/app/(site)/[locale]/work/[slug]/page";

interface Props {
  params: Promise<{ slug: string }>;
}

function withArabicLocale(params: Props["params"]) {
  return params.then(({ slug }) => ({ locale: "ar", slug }));
}

export function generateMetadata({ params }: Props) {
  return generateProjectMetadata({ params: withArabicLocale(params) });
}

export default function ArabicProjectPage({ params }: Props) {
  return <ProjectPage params={withArabicLocale(params)} />;
}
