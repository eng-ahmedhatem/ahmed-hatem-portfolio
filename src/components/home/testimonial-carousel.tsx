"use client";

import { useReducedMotion } from "motion/react";
import { Children, useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import type { Locale } from "@/domain/content/types";
import styles from "./testimonials.module.css";

const labels = {
  ar: { carousel: "عارض آراء العملاء", previous: "الرأي السابق", next: "الرأي التالي", review: "الرأي", of: "من", hint: "اسحب لاستكشاف الآراء", slide: "شريحة" },
  en: { carousel: "Client testimonials carousel", previous: "Previous testimonial", next: "Next testimonial", review: "Testimonial", of: "of", hint: "Swipe to explore", slide: "slide" },
};

/** Native scroll-snap keeps quotes readable and touch-scrollable before hydration. */
export function TestimonialCarousel({ locale, children }: { locale: Locale; children: ReactNode }) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const copy = labels[locale];
  const rtl = locale === "ar";
  const multiple = slides.length > 1;

  function syncPosition() {
    const node = track.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    let nearest = 0;
    let distance = Infinity;
    Array.from(node.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const delta = Math.abs(rtl ? rect.right - bounds.right : rect.left - bounds.left);
      if (delta < distance) { nearest = index; distance = delta; }
    });
    setActive(nearest);
  }

  function goTo(index: number) {
    const node = track.current;
    const child = node?.children[Math.max(0, Math.min(slides.length - 1, index))];
    if (!node || !child) return;
    const bounds = node.getBoundingClientRect();
    const rect = child.getBoundingClientRect();
    node.scrollTo({ left: node.scrollLeft + (rtl ? rect.right - bounds.right : rect.left - bounds.left), behavior: reduced ? "instant" : "smooth" });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    const delta = event.key === "ArrowRight" ? (rtl ? -1 : 1) : event.key === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    if (delta || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : active + delta);
    }
  }

  return <div className={styles.carousel} role="region" aria-roledescription={copy.carousel} aria-labelledby="testimonials-title">
    <div ref={track} id={id} className={styles.track} tabIndex={multiple ? 0 : undefined}
      role="group" aria-label={copy.carousel} onScroll={syncPosition} onKeyDown={onKeyDown}>
      {slides.map((slide, index) => <div key={index} className={styles.slide} role="group"
        aria-roledescription={copy.slide} aria-label={`${index + 1} ${copy.of} ${slides.length}`}>{slide}</div>)}
    </div>
    {multiple ? <div className={styles.carouselFooter}>
      <div className={styles.pagination}>
        <span className={styles.count} role="status" aria-atomic="true" dir="ltr"><span className={styles.srOnly}>{copy.review} </span>{String(active + 1).padStart(2, "0")} <span>/ {String(slides.length).padStart(2, "0")}</span></span>
        <div className={styles.dots}>
          {slides.map((_, index) => <button key={index} type="button" aria-label={`${copy.review} ${index + 1}`}
            aria-current={active === index ? "true" : undefined} aria-controls={id} onClick={() => goTo(index)}><span /></button>)}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" aria-label={copy.previous} aria-controls={id} disabled={active === 0} onClick={() => goTo(active - 1)}><Arrow previous /></button>
        <button type="button" aria-label={copy.next} aria-controls={id} disabled={active === slides.length - 1} onClick={() => goTo(active + 1)}><Arrow /></button>
      </div>
    </div> : null}
    {multiple ? <p className={styles.swipeHint}>{copy.hint}</p> : null}
  </div>;
}

function Arrow({ previous = false }: { previous?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" data-previous={previous}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
