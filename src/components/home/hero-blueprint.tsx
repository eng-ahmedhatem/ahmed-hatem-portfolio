"use client";

import { useAnimationControls, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { HeroBlueprintTranslation, Locale } from "@/domain/content/types";
import styles from "./hero.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

function DriftingDetail({ className, reducedMotion, children }: {
  className: string;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const controls = useAnimationControls();

  useEffect(() => {
    if (reducedMotion || !visible) {
      controls.set({ x: 0, y: 0, rotate: 0 });
      return;
    }
    let generation = 0;
    // Randomness is client-only and bounded to safe space beside the portrait.
    async function drift(run: number) {
      while (run === generation && !document.hidden) {
        await controls.start({
          x: (Math.random() - 0.5) * 24,
          y: (Math.random() - 0.5) * 30,
          rotate: (Math.random() - 0.5) * 16,
          transition: { duration: 3.2 + Math.random() * 2, ease: "easeInOut" },
        });
      }
    }
    function syncVisibility() {
      generation += 1;
      controls.stop();
      if (!document.hidden) void drift(generation);
    }
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => {
      generation += 1;
      controls.stop();
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, [controls, reducedMotion, visible]);

  return <motion.div ref={ref} className={className} animate={controls}>{children}</motion.div>;
}

export function HeroBlueprint({ locale, blueprint, profile, pointerX, pointerY, reducedMotion }: {
  locale: Locale;
  blueprint: HeroBlueprintTranslation;
  profile?: { src: string; width: number; height: number; alt: string };
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const artworkRef = useRef<HTMLDivElement>(null);
  // Track the artwork independently of the copy in either responsive order.
  const { scrollYProgress: progress } = useScroll({
    target: artworkRef,
    offset: ["start end", "end start"],
  });
  const direction = locale === "ar" ? -1 : 1;
  const portraitY = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [16, -24]);
  const artworkY = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [-12, 20]);
  const artworkRotate = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [-1.2 * direction, 1.2 * direction]);
  const orbitLength = useTransform(progress, [0, 0.85], [0.18, 1]);
  const x = useTransform(pointerX, [-1, 1], reducedMotion ? [0, 0] : [6, -6]);
  const y = useTransform(pointerY, [-1, 1], reducedMotion ? [0, 0] : [4, -4]);
  const markX = useTransform(pointerX, [-1, 1], reducedMotion ? [0, 0] : [-5, 5]);
  const markY = useTransform(pointerY, [-1, 1], reducedMotion ? [0, 0] : [-3, 3]);
  // The signal follows the same quadratic curve as the foreground connection.
  const signalX = useTransform(progress, (value) => {
    const t = reducedMotion ? 0.85 : Math.min(1, value / 0.85);
    return (1 - t) ** 2 * 34 + 2 * (1 - t) * t * 290 + t ** 2 * 558;
  });
  const signalY = useTransform(progress, (value) => {
    const t = reducedMotion ? 0.85 : Math.min(1, value / 0.85);
    return (1 - t) ** 2 * 458 + 2 * (1 - t) * t * 660 + t ** 2 * 365;
  });
  const draw = {
    hidden: { pathLength: reducedMotion ? 1 : 0 },
    visible: { pathLength: 1, transition: { duration: reducedMotion ? 0 : 0.85, ease: EASE } },
  };

  return <motion.div ref={artworkRef} className={styles.blueprint} data-hero-portrait
    initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }}>
    <motion.div className={styles.markStage} style={{ y: artworkY, rotate: artworkRotate }} aria-hidden="true">
      <motion.div className={styles.markPointer} style={{ x: markX, y: markY }}>
        <svg className={styles.brandCanvas} viewBox="0 0 600 640" focusable="false">
          <path className={styles.echoPath} d="M18 533 L194 90 L388 533 M355 108 V540 M570 108 V540" />
          <motion.path className={styles.markA} d="M40 520 L195 126 L365 520 M109 351 H292" variants={draw} />
          <motion.path className={styles.markH} d="M355 148 V520 M355 330 H550 M550 148 V520" variants={draw} />
          <path className={styles.echoPath} d="M28 399 C-26 209 146 31 366 70 C530 99 611 283 560 455" />
          <motion.path className={styles.orbitPath} d="M28 399 C-26 209 146 31 366 70 C530 99 611 283 560 455" style={{ pathLength: reducedMotion ? 1 : orbitLength }} />
          <path className={styles.signalSlash} d="M390 330 H467" />
          <circle className={styles.liveNode} cx="366" cy="70" r="4" />
          <path className={styles.orbitPath} d="M30 180 H48 M39 171 V189" />
        </svg>
      </motion.div>
    </motion.div>
    {profile ? <motion.div className={styles.portraitMask}
      variants={{
        hidden: reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 16, y: 24, scale: 0.97 },
        visible: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: reducedMotion ? 0 : 0.75, delay: reducedMotion ? 0 : 0.16, ease: EASE } },
      }}>
      <motion.div className={styles.portraitDepth} style={{ x, y }}>
        <motion.div className={styles.portraitDepth} style={{ y: portraitY }}>
          <Image className={styles.portrait} src={profile.src} width={profile.width} height={profile.height} alt={profile.alt} loading="eager" fetchPriority="high" sizes="(max-width: 480px) 94vw, (max-width: 895px) 510px, 44vw" />
        </motion.div>
      </motion.div>
    </motion.div> : null}
    <motion.div className={styles.signalStage} aria-hidden="true"
      variants={{ hidden: { opacity: reducedMotion ? 1 : 0 }, visible: { opacity: 1, transition: { duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.4 } } }}>
      <svg className={styles.brandCanvas} viewBox="0 0 600 640" focusable="false">
        <path className={styles.echoPath} d="M34 458 Q290 660 558 365" />
        <motion.path className={styles.orbitPath} d="M34 458 Q290 660 558 365" style={{ pathLength: reducedMotion ? 1 : orbitLength }} />
        <motion.circle className={styles.signalHalo} style={{ cx: signalX, cy: signalY }} r="10" />
        <motion.circle className={styles.liveNode} style={{ cx: signalX, cy: signalY }} r="3.5" />
      </svg>
    </motion.div>
    <motion.div className={styles.floatingDetails} style={{ y: artworkY }} aria-hidden="true">
      <DriftingDetail className={`${styles.floatingSymbol} ${styles.orbitFragment}`} reducedMotion={reducedMotion}>
        <svg viewBox="0 0 64 64" fill="none" focusable="false"><path d="M14 47a23 23 0 1 1 37-27" /><path className={styles.detailEcho} d="M22 44a16 16 0 0 0 25-19" /><circle cx="51" cy="20" r="3" className={styles.detailNode} /></svg>
      </DriftingDetail>
      <DriftingDetail className={`${styles.floatingSymbol} ${styles.brandFragment}`} reducedMotion={reducedMotion}>
        <svg viewBox="0 0 56 64" fill="none" focusable="false"><path d="m12 48 16-34 16 34M20 34h16" /><path className={styles.detailEcho} d="M8 55h40" /><circle cx="44" cy="48" r="2.5" className={styles.detailNode} /></svg>
      </DriftingDetail>
    </motion.div>
    <div className={styles.portraitCaption}><span><i aria-hidden="true" />{blueprint.liveLabel}</span></div>
  </motion.div>;
}
