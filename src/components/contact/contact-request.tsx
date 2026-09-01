import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import type { ContactViewModel } from "@/features/site/view-models";

import { ContactForm } from "./contact-form";
import styles from "./contact-request.module.css";

export function ContactRequest({ contact, standalone = false }: { contact: ContactViewModel & { intro?: { id: string; eyebrow?: string; title: string } }; standalone?: boolean }) {
  const headingId = contact.intro ? `${contact.intro.id}-title` : "contact-request-title";
  const Heading = standalone ? "h1" : "h2";
  const titleLines = contact.title.split("\n");
  return (
    <section className={styles.section} data-standalone={standalone} aria-labelledby={headingId}>
      <svg className={styles.artwork} viewBox="0 0 800 800" aria-hidden="true" focusable="false">
        <path d="M-40 690C150 505 264 786 470 585S760 460 850 548" />
        <path d="M-70 736C140 548 278 825 500 620S785 510 880 600" />
        <path d="M418 132h54M445 105v54" />
        <circle cx="445" cy="132" r="4" />
        <circle cx="650" cy="265" r="3" />
      </svg>
      <Container className={styles.layout}>
        <Reveal className={styles.headerMotion} from="start" locale={contact.locale} distance={28} amount={0.2}>
          <header className={styles.header}>
            {contact.intro?.eyebrow ? <p className={styles.eyebrow}>{contact.intro.eyebrow}</p> : null}
            <Heading id={headingId}>
              {titleLines.map((line, index) => (
                <span key={`${line}-${index}`} data-accent={index === titleLines.length - 1}>
                  {line}
                </span>
              ))}
            </Heading>
            <p className={styles.summary}>{contact.summary}</p>
            <span className={styles.signal} aria-hidden="true"><i /><b>01</b></span>
          </header>
        </Reveal>
        <Reveal className={styles.formMotion} from="end" locale={contact.locale} delay={0.1} distance={28} amount={0.12}>
          <div className={styles.formWrap}><ContactForm copy={contact.form} locale={contact.locale} /></div>
        </Reveal>
      </Container>
    </section>
  );
}
