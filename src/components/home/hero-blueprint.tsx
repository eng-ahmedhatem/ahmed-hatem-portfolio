"use client";

import { useTransform, type MotionValue } from "motion/react";
import * as motion from "motion/react-m";
import Image from "next/image";
import type { HeroBlueprintTranslation, Locale } from "@/domain/content/types";
import styles from "./hero.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HeroBlueprint({ locale, blueprint, profile, pointerX, pointerY, progress, reducedMotion }: {
  locale: Locale;
  blueprint: HeroBlueprintTranslation;
  profile?: { src: string; width: number; height: number; alt: string };
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const direction = locale === "ar" ? -1 : 1;
  const portraitY = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [0, -22]);
  const artworkY = useTransform(progress, [0, 1], reducedMotion ? [0, 0] : [0, 26]);
  const orbitLength = useTransform(progress, [0, 0.7], [0.55, 1]);
  const x = useTransform(pointerX, [-1, 1], reducedMotion ? [0, 0] : [4, -4]);
  const y = useTransform(pointerY, [-1, 1], reducedMotion ? [0, 0] : [3, -3]);

  return <div className={styles.blueprint} data-hero-portrait>
    <motion.div className={styles.markStage} style={{ y: artworkY }} aria-hidden="true">
      <svg className={styles.brandCanvas} viewBox="0 0 450 560" focusable="false">
        <path className={styles.echoPath} d="M28 437 C-48 213 158 -38 352 66 C470 130 475 358 374 493" />
        <motion.path className={styles.orbitPath} d="M-8 404 C16 531 400 531 444 328 C462 239 409 153 367 119" style={{ pathLength: reducedMotion ? 1 : orbitLength }} />
        <circle className={styles.liveNode} cx="367" cy="119" r="4" />
        <path className={styles.orbitPath} d="M37 136 H59 M48 125 V147" />
      </svg>
    </motion.div>
    {profile ? <motion.div className={styles.portraitMask}
      initial={reducedMotion ? false : { opacity: 0, x: direction * 14, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.18, ease: EASE }}>
      <motion.div className={styles.portraitDepth} style={{ x, y }}>
        <motion.div className={styles.portraitDepth} style={{ y: portraitY }}>
          <Image className={styles.portrait} src={profile.src} width={profile.width} height={profile.height} alt={profile.alt} loading="eager" fetchPriority="high" sizes="(max-width: 480px) 85vw, (max-width: 895px) 460px, 38vw" />
        </motion.div>
      </motion.div>
    </motion.div> : null}
    <div className={styles.portraitCaption}><span>{blueprint.liveLabel}</span></div>
  </div>;
}
