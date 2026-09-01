import { redirect } from "next/navigation";

import { localeFromParam } from "@/lib/i18n/locale-param";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const locale = localeFromParam((await params).locale);
  redirect(`/${locale}#about`);
}
