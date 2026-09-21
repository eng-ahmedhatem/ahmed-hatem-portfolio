"use client";

import { animate, useInView, useMotionValue, useTransform } from "motion/react";
import * as motion from "motion/react-m";
import { useEffect, useMemo, useRef } from "react";
import styles from "./hero.module.css";

export function HeroTypedLine({ text, locale, index, reducedMotion }: {
  text: string;
  locale: "ar" | "en";
  index: number;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.8 });
  const characters = useMemo(() => Array.from(
    new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text),
    ({ segment }) => segment,
  ), [text, locale]);
  const count = useMotionValue(0);
  const typed = useTransform(count, (value) => characters.slice(0, Math.floor(value)).join(""));
  const cursorOpacity = useTransform(count, (value) => value > 0 && value < characters.length ? 1 : 0);

  useEffect(() => {
    if (!visible || reducedMotion) return;
    let cancelled = false;
    let playback: ReturnType<typeof animate> | undefined;
    // Start only after the font is ready, so a font swap cannot swallow the writing.
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      count.set(0);
      playback = animate(count, characters.length, {
        duration: 1.8,
        delay: 0.6 + index * 1.95,
        ease: "linear",
      });
    });
    return () => { cancelled = true; playback?.stop(); };
  }, [characters.length, count, index, reducedMotion, visible]);

  return <span ref={ref} className={styles.titleLine}>
    <span className={styles.writingLine}>
      <span className={styles.writingText}>{text}{" "}</span>
      {!reducedMotion ? <span className={styles.typedOverlay} aria-hidden="true">
        <motion.span>{typed}</motion.span><motion.i className={styles.writingCursor} style={{ opacity: cursorOpacity }} />
      </span> : null}
    </span>
  </span>;
}
