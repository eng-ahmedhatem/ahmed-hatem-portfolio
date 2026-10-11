import ContactPage, {
  generateMetadata as generateContactMetadata,
} from "@/app/(site)/[locale]/contact/page";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

export function generateMetadata() {
  return generateContactMetadata({ params: ARABIC_PARAMS });
}

export default function ArabicContactPage() {
  return <ContactPage params={ARABIC_PARAMS} />;
}
