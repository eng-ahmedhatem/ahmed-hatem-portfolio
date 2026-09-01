import type {
  LocaleSwitchRoute,
  ResolvedSiteSettings,
} from "@/domain/content/types";

import { SiteHeaderClient } from "./site-header-client";

interface SiteHeaderProps {
  settings: ResolvedSiteSettings;
  routes: readonly LocaleSwitchRoute[];
}

export function SiteHeader({ settings, routes }: SiteHeaderProps) {
  const contactItem = settings.navigation.find((item) => item.key === "contact");

  if (!contactItem) {
    throw new Error("Site navigation requires a contact destination.");
  }

  return (
    <SiteHeaderClient
      locale={settings.locale}
      brandName={settings.brandName}
      logoSrc={settings.identity.logoSrc}
      logoWidth={settings.identity.logoWidth}
      logoHeight={settings.identity.logoHeight}
      navigationLabel={settings.navigationLabel}
      navigation={settings.navigation.filter((item) => item.key !== "contact")}
      skipToContentLabel={settings.skipToContentLabel}
      languageSwitcherLabel={settings.languageSwitcherLabel}
      themeSwitcherLabel={settings.themeSwitcherLabel}
      lightThemeLabel={settings.lightThemeLabel}
      darkThemeLabel={settings.darkThemeLabel}
      mobileMenuOpenLabel={settings.mobileMenuOpenLabel}
      mobileMenuCloseLabel={settings.mobileMenuCloseLabel}
      mobileMenuLabel={settings.mobileMenuLabel}
      mobileMenuTitle={settings.mobileMenuTitle}
      primaryCta={{
        href: contactItem.href,
        label: settings.primaryCtaLabel,
      }}
      routes={routes}
    />
  );
}
