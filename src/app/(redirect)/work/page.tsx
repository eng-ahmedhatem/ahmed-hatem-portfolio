import WorkArchive, {
  generateMetadata as generateWorkMetadata,
} from "@/app/(site)/[locale]/work/page";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

interface Props {
  searchParams: Promise<{
    filter?: string | string[];
    page?: string | string[];
  }>;
}

export function generateMetadata() {
  return generateWorkMetadata({ params: ARABIC_PARAMS, searchParams: Promise.resolve({}) });
}

export default function ArabicWorkArchive({ searchParams }: Props) {
  return <WorkArchive params={ARABIC_PARAMS} searchParams={searchParams} />;
}
