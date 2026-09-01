"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

interface MotionFoundationProps {
  children: ReactNode;
}

const loadMotionFeatures = () =>
  import("./motion-features").then((module) => module.default);

export function MotionFoundation({ children }: MotionFoundationProps) {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
