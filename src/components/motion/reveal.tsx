"use client";

import { useReducedMotion } from "motion/react";
import * as motion from "motion/react-m";
import type { ReactNode } from "react";

const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  amount?: number;
  once?: boolean;
  from?: "up" | "down" | "start" | "end";
  locale?: "ar" | "en";
}

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 22,
  amount = 0.18,
  once = true,
  from = "up",
  locale = "en",
}: RevealProps) {
  const reduce = Boolean(useReducedMotion());
  const startDirection = locale === "ar" ? 1 : -1;
  const x = from === "start"
    ? distance * startDirection
    : from === "end"
      ? distance * -startDirection
      : 0;
  const y = from === "up" ? distance : from === "down" ? -distance : 0;

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x, y, scale: 0.992 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{
        delay: reduce ? 0 : delay,
        duration: reduce ? 0.01 : 0.58,
        ease: PREMIUM_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}
