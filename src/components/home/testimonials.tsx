import Image from "next/image";
import type { Locale, ResolvedTestimonial, TestimonialsCopy } from "@/domain/content/types";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { TestimonialCarousel } from "./testimonial-carousel";
import styles from "./testimonials.module.css";

export type TestimonialsView = TestimonialsCopy & { locale: Locale; enabled: boolean; items: readonly ResolvedTestimonial[] };

export function Testimonials({ view }: { view: TestimonialsView }) {
  if (!view.enabled || !view.items.length) return null;
  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
      <Container className={styles.layout}>
        <Reveal locale={view.locale} from="start" className={styles.intro}>
          <span className={styles.eyebrow}>{view.eyebrow}</span>
          <h2 id="testimonials-title">{view.title}</h2>
          <p>{view.summary}</p>
          <svg className={styles.signature} viewBox="0 0 120 32" fill="none" aria-hidden="true"><path d="M1 17h33l9-12 12 23 12-16 7 5h45" stroke="currentColor" strokeWidth="1.5" /><circle cx="116" cy="17" r="3" fill="currentColor" /></svg>
        </Reveal>
        <TestimonialCarousel locale={view.locale}>
          {view.items.map((item) => (
              <figure key={item.id} className={styles.quote}>
                <span className={styles.mark} aria-hidden="true">“</span>
                <blockquote><p>{item.quote}</p></blockquote>
                <figcaption>
                  {item.avatar?.src ? <Image className={styles.avatar} src={item.avatar.src} width={52} height={52} sizes="52px" alt="" /> : <span className={styles.initial} aria-hidden="true">{Array.from(item.name.trim())[0]}</span>}
                  <div className={styles.author}><strong>{item.name}</strong>{item.role || item.company ? <span>{[item.role, item.company].filter(Boolean).join(" · ")}</span> : null}</div>
                  {item.sourceUrl ? <a className={styles.source} href={item.sourceUrl} target="_blank" rel="noopener noreferrer">{view.sourceLabel}<span aria-hidden="true">↗</span></a> : null}
                </figcaption>
              </figure>
          ))}
        </TestimonialCarousel>
      </Container>
    </section>
  );
}
