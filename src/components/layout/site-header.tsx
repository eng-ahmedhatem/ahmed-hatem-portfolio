import Link from "next/link";

import type {
  LocalizedRouteEntry,
  ResolvedSiteSettings,
} from "@/domain/content/types";

import { Container } from "../ui/container";
import { LanguageSwitcher } from "./language-switcher";
import styles from "./site-header.module.css";

interface SiteHeaderProps {
  settings: ResolvedSiteSettings;
  routes: readonly LocalizedRouteEntry[];
}

export function SiteHeader({ settings, routes }: SiteHeaderProps) {
  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {settings.skipToContentLabel}
      </a>
      <header className={styles.header}>
        <Container className={styles.inner}>
          <Link className={styles.brand} href={`/${settings.locale}`}>
            <span>{settings.brandName}</span>
            <small>{settings.brandDescriptor}</small>
          </Link>
          <nav className={styles.navigation} aria-label={settings.navigationLabel}>
            {settings.navigation.map((item) => (
              <Link key={item.key} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher
            currentLocale={settings.locale}
            label={settings.languageSwitcherLabel}
            routes={routes}
          />
        </Container>
      </header>
    </>
  );
}
