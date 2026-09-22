"use client";

import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import * as motion from "motion/react-m";
import { useRef, type PointerEvent } from "react";

import { ActionLink } from "@/components/ui/action-link";
import { Container } from "@/components/ui/container";
import type { HeroViewModel } from "@/features/site/view-models";

import { HeroBlueprint } from "./hero-blueprint";
import { HeroAmbient } from "./hero-ambient";
import { HeroTypedLine } from "./hero-typed-line";
import styles from "./hero.module.css";

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ hero }: { hero: HeroViewModel }) {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerSpringX = useSpring(pointerX, {
    stiffness: 90,
    damping: 22,
    mass: 0.55,
  });
  const pointerSpringY = useSpring(pointerY, {
    stiffness: 90,
    damping: 22,
    mass: 0.55,
  });
  const fromStart = hero.locale === "ar" ? 18 : -18;
  const { scrollYProgress } = useScroll({
    target: copyRef,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [0, -34],
  );
  const titleX = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [0, -18 * (hero.locale === "ar" ? -1 : 1)],
  );
  const supportingY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [0, -16],
  );
  const titleOpacity = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    reduce ? [1, 1, 1] : [1, 1, 0.48],
  );
  const supportingOpacity = useTransform(
    scrollYProgress,
    [0, 0.62, 1],
    reduce ? [1, 1, 1] : [1, 0.94, 0.34],
  );
  const railY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [0, -18],
  );
  const railOpacity = useTransform(
    scrollYProgress,
    [0, 0.58, 1],
    reduce ? [1, 1, 1] : [1, 0.9, 0.25],
  );
  const titleLines = hero.title.split("\n");
  const railVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.04,
        staggerChildren: reduce ? 0 : 0.06,
      },
    },
  };
  const titleGroupVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.16,
        staggerChildren: reduce ? 0 : 0.08,
      },
    },
  };
  const supportingGroupVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: reduce ? 0 : 0.5,
        staggerChildren: reduce ? 0 : 0.075,
      },
    },
  };
  const itemVariants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, x: fromStart, y: 10 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: reduce ? 0.01 : 0.58, ease: PREMIUM_EASE },
    },
  };

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
  }

  function resetPointerDepth() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      aria-labelledby="hero-title"
      data-hero-story
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerDepth}
    >
      <HeroAmbient reducedMotion={reduce} />
      <Container className={styles.layout}>
        <HeroBlueprint
          locale={hero.locale}
          blueprint={hero.blueprint}
          profile={hero.profile}
          pointerX={pointerSpringX}
          pointerY={pointerSpringY}
          reducedMotion={reduce}
        />
        <div ref={copyRef} className={styles.copy}>
        <motion.div
          className={styles.identityRail}
          style={{ y: railY, opacity: railOpacity }}
          variants={railVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className={styles.identity} variants={itemVariants}>
            <strong>{hero.name}</strong>
            <small>{hero.role}</small>
          </motion.div>

        </motion.div>

        <motion.div
          className={styles.titleBlock}
          style={{ x: titleX, y: titleY, opacity: titleOpacity }}
          variants={titleGroupVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p className={styles.eyebrow} variants={itemVariants}>
            <i aria-hidden="true" />
            {hero.eyebrow}
          </motion.p>

          <h1 id="hero-title" className={styles.title}>
            {titleLines.map((line, index) => (
              <HeroTypedLine key={line} text={line} locale={hero.locale} index={index} reducedMotion={reduce} />
            ))}
          </h1>
        </motion.div>

        <motion.div
          className={styles.supportingCopy}
          style={{ y: supportingY, opacity: supportingOpacity }}
          variants={supportingGroupVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.p className={styles.summary} variants={itemVariants}>
            {hero.summary}
          </motion.p>

          <motion.div className={styles.actions} variants={itemVariants}>
            <ActionLink href={hero.primaryAction.href}>
              {hero.primaryAction.label}
            </ActionLink>
            <ActionLink href={hero.secondaryAction.href} variant="secondary">
              {hero.secondaryAction.label}
            </ActionLink>
          </motion.div>
          <motion.ul className={styles.benefits} variants={itemVariants} aria-label={hero.capabilityLabel}>
            {hero.capabilities.slice(0, 3).map((benefit) => <li key={benefit}>{benefit}</li>)}
          </motion.ul>
          {hero.employment ? <motion.div className={styles.employment} variants={itemVariants}>
            <span aria-hidden="true" className={styles.employmentDot} />
            <p><span>{hero.employment.role}</span><a href={hero.employment.url} target="_blank" rel="noopener noreferrer">{hero.employment.company}<span aria-hidden="true"> ↗</span></a></p>
          </motion.div> : null}
        </motion.div>
        </div>

      </Container>
    </section>
  );
}
