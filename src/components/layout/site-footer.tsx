import type { ResolvedSiteSettings } from "@/domain/content/types";

import { Container } from "../ui/container";
import styles from "./site-footer.module.css";

export function SiteFooter({ settings }: { settings: ResolvedSiteSettings }) {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <span className={styles.rule} aria-hidden="true" />
        <p>
          <span>© {new Date().getFullYear()} {settings.brandName}</span>
          <span className={styles.separator} aria-hidden="true">/</span>
          <span translate="no">{settings.footerRole}</span>
        </p>
        <span className={styles.rule} aria-hidden="true" />
      </Container>
    </footer>
  );
}
