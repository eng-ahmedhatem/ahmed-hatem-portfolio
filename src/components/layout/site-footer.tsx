import Link from "next/link";

import type { ResolvedSiteSettings } from "@/domain/content/types";

import { Container } from "../ui/container";
import styles from "./site-footer.module.css";

export function SiteFooter({ settings }: { settings: ResolvedSiteSettings }) {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.statement}>
          <strong>{settings.brandName}</strong>
          <p>{settings.footerSummary}</p>
        </div>
        <nav aria-label={settings.footerNavigationLabel} className={styles.navigation}>
          {settings.navigation.map((item) => (
            <Link key={item.key} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className={styles.legal}>
          © {new Date().getFullYear()} {settings.brandName}. {settings.copyrightLabel}
        </p>
      </Container>
    </footer>
  );
}
