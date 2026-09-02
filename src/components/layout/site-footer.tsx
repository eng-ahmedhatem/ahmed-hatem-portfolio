import type { ResolvedSiteSettings } from "@/domain/content/types";

import { Container } from "../ui/container";
import styles from "./site-footer.module.css";

export function SiteFooter({ settings }: { settings: ResolvedSiteSettings }) {
  const footerText = settings.footerText?.trim()
    || `© ${new Date().getFullYear()} ${settings.brandName} — ${settings.copyrightLabel}`;

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p>{footerText}</p>
      </Container>
    </footer>
  );
}
