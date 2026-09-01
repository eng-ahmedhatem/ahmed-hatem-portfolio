"use client";

import { useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";

import type { ResolvedSiteSettings } from "@/domain/content/types";

import styles from "./contact-dock.module.css";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.94L2.05 22l5.2-1.52A9.93 9.93 0 1 0 12.04 2Zm0 17.88a8 8 0 0 1-4.08-1.12l-.3-.18-3.08.9.93-3-.2-.31a7.92 7.92 0 1 1 6.73 3.71Zm4.36-5.94c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.42-.71-2.35-1.27-3.3-2.88-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M13.7 22v-8.9h3l.45-3.48H13.7V7.4c0-1 .28-1.7 1.73-1.7h1.85V2.6a24.7 24.7 0 0 0-2.7-.14c-2.67 0-4.5 1.63-4.5 4.63v2.53H7.05v3.48h3.03V22h3.62Z" />
    </svg>
  );
}

export function ContactDock({ settings }: { settings: ResolvedSiteSettings }) {
  const reduce = Boolean(useReducedMotion());
  const whatsapp = settings.identity.socialLinks.find((item) => item.id === "whatsapp");
  const facebook = settings.identity.socialLinks.find((item) => item.id === "facebook");
  const items = [
    whatsapp ? { ...whatsapp, label: settings.whatsappLabel, icon: <WhatsAppIcon /> } : null,
    facebook ? { ...facebook, label: settings.facebookLabel, icon: <FacebookIcon /> } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) return null;

  return (
    <motion.nav
      className={styles.dock}
      aria-label={settings.contactDockLabel}
      initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: reduce ? 0 : 0.9, duration: reduce ? 0.01 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {items.map((item) => (
        <motion.a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          data-network={item.id}
          whileHover={reduce ? undefined : { y: -3, scale: 1.04 }}
          whileTap={reduce ? undefined : { scale: 0.97 }}
        >
          {item.icon}
          <span role="tooltip">{item.label}</span>
        </motion.a>
      ))}
    </motion.nav>
  );
}
