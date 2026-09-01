"use client";

import { useReducedMotion, useScroll, useTransform } from "motion/react";
import * as motion from "motion/react-m";
import type { ReactNode } from "react";
import { useRef } from "react";

export function HeroScrollContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [0, -28],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.8, 1],
    reduce ? [1, 1, 1] : [1, 1, 0.78],
  );

  return (
    <motion.div ref={contentRef} className={className} style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}
