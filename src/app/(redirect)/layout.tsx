import type { ReactNode } from "react";

import LocalizedLayout, {
  generateMetadata as generateLocalizedLayoutMetadata,
} from "@/app/(site)/[locale]/layout";

const ARABIC_PARAMS = Promise.resolve({ locale: "ar" });

export function generateMetadata() {
  return generateLocalizedLayoutMetadata({ params: ARABIC_PARAMS });
}

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return <LocalizedLayout params={ARABIC_PARAMS}>{children}</LocalizedLayout>;
}
