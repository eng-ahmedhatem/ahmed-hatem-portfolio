"use client";

import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as motion from "motion/react-m";
import { useRef } from "react";

import styles from "./scroll-artwork.module.css";

type ArtworkVariant = "hero" | "projects" | "about";

interface ArtworkDrawing {
  primary: string;
  secondary: string;
  detail: string;
  anchor: readonly [number, number];
  quiet: readonly [number, number];
  orbit: readonly [number, number, number];
}

const DRAWINGS: Record<ArtworkVariant, ArtworkDrawing> = {
  hero: {
    primary: "M42 535 C170 510 174 272 340 248 S572 430 662 266 S810 88 958 130",
    secondary: "M74 116 C192 58 292 75 356 168 S486 330 586 306",
    detail: "M690 528 C762 458 830 456 944 518 M902 482 L944 518 L890 536",
    anchor: [662, 266],
    quiet: [356, 168],
    orbit: [808, 119, 58],
  },
  projects: {
    primary: "M40 104 C218 30 286 194 398 250 S604 198 690 340 S822 562 970 482",
    secondary: "M58 558 C218 486 276 376 420 412 S686 560 806 458",
    detail: "M744 82 L930 82 L930 208 M72 286 L162 286 L162 214",
    anchor: [690, 340],
    quiet: [420, 412],
    orbit: [806, 458, 48],
  },
  about: {
    primary: "M54 92 C176 162 140 388 318 444 S618 382 724 188 S888 106 958 172",
    secondary: "M102 526 C244 580 354 514 438 406 S596 196 688 240",
    detail: "M744 522 L900 522 L900 386 M112 196 L112 88 L236 88",
    anchor: [724, 188],
    quiet: [318, 444],
    orbit: [688, 240, 54],
  },
};

interface ScrollArtworkProps {
  variant: ArtworkVariant;
  locale: "ar" | "en";
  className?: string;
}

export function ScrollArtwork({ variant, locale, className }: ScrollArtworkProps) {
  const artworkRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const drawing = DRAWINGS[variant];
  const direction = locale === "ar" ? -1 : 1;
  const { scrollYProgress } = useScroll({
    target: artworkRef,
    offset: ["start end", "end start"],
  });
  const artworkY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [24, -24],
  );
  const artworkRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-0.7 * direction, 0.7 * direction],
  );
  const primaryLength = useTransform(scrollYProgress, [0.08, 0.72], [0, 1]);
  const secondaryLength = useTransform(scrollYProgress, [0.18, 0.9], [0, 1]);
  const movingX = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [-18 * direction, 22 * direction],
  );
  const movingY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [0, 0, 0] : [12, -8, 10],
  );

  return (
    <motion.div
      ref={artworkRef}
      className={[styles.root, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={{ y: artworkY, rotate: artworkRotate }}
    >
      <svg
        className={styles.canvas}
        viewBox="0 0 1000 640"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
      >
        <motion.path
          className={styles.primaryTrace}
          d={drawing.primary}
          style={{ pathLength: reduce ? 1 : primaryLength }}
        />
        <motion.path
          className={styles.secondaryTrace}
          d={drawing.secondary}
          style={{ pathLength: reduce ? 1 : secondaryLength }}
        />
        <motion.path
          className={styles.detailTrace}
          d={drawing.detail}
          style={{ pathLength: reduce ? 1 : secondaryLength }}
        />
        <circle
          className={styles.orbit}
          cx={drawing.orbit[0]}
          cy={drawing.orbit[1]}
          r={drawing.orbit[2]}
        />
        <circle
          className={styles.node}
          cx={drawing.anchor[0]}
          cy={drawing.anchor[1]}
          r="7"
        />
        <circle
          className={styles.quietNode}
          cx={drawing.quiet[0]}
          cy={drawing.quiet[1]}
          r="5"
        />
        <motion.circle
          className={styles.movingNode}
          cx={drawing.orbit[0]}
          cy={drawing.orbit[1]}
          r="5"
          style={{ x: movingX, y: movingY }}
        />
      </svg>
    </motion.div>
  );
}
