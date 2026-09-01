"use client";

import { useTransform } from "motion/react";
import * as motion from "motion/react-m";
import type { MotionValue } from "motion/react";
import Image from "next/image";

import type { HeroBlueprintTranslation, Locale } from "@/domain/content/types";

import styles from "./hero.module.css";

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function HeroBlueprint({
  locale,
  blueprint,
  profile,
  pointerX,
  pointerY,
  progress,
  reducedMotion,
  isActive,
}: {
  locale: Locale;
  blueprint: HeroBlueprintTranslation;
  profile?: { src: string; width: number; height: number; alt: string };
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  progress: MotionValue<number>;
  reducedMotion: boolean;
  isActive: boolean;
}) {
  const direction = locale === "ar" ? -1 : 1;
  const artworkX = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [-18 * direction, 52 * direction],
  );
  const artworkY = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [8, -54],
  );
  const artworkRotate = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [0.8 * direction, -1.8 * direction],
  );
  const artworkScale = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.985, 1.035],
  );
  const orbitLength = useTransform(progress, [0, 0.86], [0.16, 1]);
  const artworkOpacity = useTransform(
    progress,
    [0, 0.7, 1],
    reducedMotion ? [1, 1, 1] : [1, 0.86, 0.24],
  );
  const portraitX = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [10 * direction, -28 * direction],
  );
  const portraitY = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [0, 0] : [12, -44],
  );
  const portraitScale = useTransform(
    progress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.985, 1.035],
  );
  const portraitOpacity = useTransform(
    progress,
    [0, 0.76, 1],
    reducedMotion ? [1, 1, 1] : [1, 1, 0.46],
  );
  const markPointerX = useTransform(
    pointerX,
    [-1, 1],
    reducedMotion ? [0, 0] : [-10, 10],
  );
  const markPointerY = useTransform(
    pointerY,
    [-1, 1],
    reducedMotion ? [0, 0] : [-7, 7],
  );
  const portraitPointerX = useTransform(
    pointerX,
    [-1, 1],
    reducedMotion ? [0, 0] : [7, -7],
  );
  const portraitPointerY = useTransform(
    pointerY,
    [-1, 1],
    reducedMotion ? [0, 0] : [5, -5],
  );

  return (
    <aside
      className={`${styles.blueprint} notranslate`}
      aria-label={blueprint.ariaLabel}
      data-locale={locale}
      translate="no"
    >
      <motion.div
        className={styles.markStage}
        style={{
          x: artworkX,
          y: artworkY,
          rotate: artworkRotate,
          scale: artworkScale,
        }}
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: reducedMotion ? 0 : 0.2,
          duration: reducedMotion ? 0.01 : 0.72,
          ease: PREMIUM_EASE,
        }}
        aria-hidden="true"
      >
        <motion.div
          className={styles.markPointer}
          style={{ x: markPointerX, y: markPointerY, opacity: artworkOpacity }}
        >
          <svg
            className={styles.brandCanvas}
            viewBox="0 0 900 620"
            focusable="false"
          >
          <motion.path
            className={styles.orbitPath}
            d="M28 450 C154 606 328 552 430 406 C548 236 618 58 866 102"
            style={{ pathLength: reducedMotion ? 1 : orbitLength }}
          />
          <motion.path
            className={styles.echoPath}
            d="M92 536 L330 80 L528 536 M188 354 H455"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: reducedMotion ? 0 : 0.28,
              duration: reducedMotion ? 0.01 : 0.82,
              ease: PREMIUM_EASE,
            }}
          />
          <motion.path
            className={styles.markA}
            d="M120 512 L334 102 L510 512 M215 354 H458"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: reducedMotion ? 0 : 0.34,
              duration: reducedMotion ? 0.01 : 0.88,
              ease: PREMIUM_EASE,
            }}
          />
          <motion.path
            className={styles.markH}
            d="M482 126 V514 M482 318 H748 M748 126 V514"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: reducedMotion ? 0 : 0.4,
              duration: reducedMotion ? 0.01 : 0.84,
              ease: PREMIUM_EASE,
            }}
          />
          <motion.path
            className={styles.signalSlash}
            d="M510 318 H635"
            initial={reducedMotion ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              delay: reducedMotion ? 0 : 0.64,
              duration: reducedMotion ? 0.01 : 0.38,
              ease: PREMIUM_EASE,
            }}
          />
          <circle className={styles.fixedNode} cx="120" cy="512" r="6" />
          <motion.circle
            className={styles.liveNode}
            cx="866"
            cy="102"
            r="7"
            animate={
              reducedMotion || !isActive
                ? { opacity: 1 }
                : { opacity: [0.38, 1, 0.38], scale: [0.82, 1.18, 0.82] }
            }
            transition={
              reducedMotion || !isActive
                ? { duration: 0.01 }
                : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }
          />
          </svg>
        </motion.div>
      </motion.div>

      {profile ? (
        <motion.div
          className={styles.portraitMask}
          initial={
            reducedMotion
              ? false
              : {
                  opacity: 0,
                  clipPath: "polygon(0 100%, 100% 88%, 100% 100%, 0 100%)",
                }
          }
          animate={{
            opacity: 1,
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
          }}
          transition={{
            delay: reducedMotion ? 0 : 0.44,
            duration: reducedMotion ? 0.01 : 0.78,
            ease: PREMIUM_EASE,
          }}
        >
          <motion.div
            className={styles.portraitPointer}
            style={{ x: portraitPointerX, y: portraitPointerY }}
          >
            <motion.div
              className={styles.portraitDepth}
              style={{
                x: portraitX,
                y: portraitY,
                scale: portraitScale,
                opacity: portraitOpacity,
              }}
            >
              <Image
                className={styles.portrait}
                src={profile.src}
                width={profile.width}
                height={profile.height}
                alt={profile.alt}
                loading="eager"
                sizes="(max-width: 38rem) 74vw, (max-width: 56rem) 48vw, 32vw"
              />
            </motion.div>
            <motion.i
              className={styles.portraitThread}
              aria-hidden="true"
              initial={reducedMotion ? false : { opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                delay: reducedMotion ? 0 : 0.86,
                duration: reducedMotion ? 0.01 : 0.4,
                ease: PREMIUM_EASE,
              }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </aside>
  );
}
