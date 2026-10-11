import Homepage, {
  generateMetadata as generateHomepageMetadata,
} from "@/app/(site)/[locale]/page";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

export function generateMetadata() {
  return generateHomepageMetadata({ params: ARABIC_PARAMS });
}

export default function ArabicHomepage() {
  return <Homepage params={ARABIC_PARAMS} />;
}
