"use client";

import { useReducedMotion, useScroll, useSpring } from "motion/react";
import * as motion from "motion/react-m";
import type { ReactNode } from "react";

import styles from "./route-transition.module.css";

export function RouteTransition({ children }: { children: ReactNode }) {
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.div
      className={styles.route}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduce ? 0.01 : 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function SiteScrollProgress() {
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: reduce ? 1000 : 130,
    damping: reduce ? 100 : 28,
    mass: reduce ? 0.01 : 0.25,
  });

  return (
    <motion.div
      className={styles.scrollProgress}
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
