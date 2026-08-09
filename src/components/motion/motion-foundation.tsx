"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

interface MotionFoundationProps {
  children: ReactNode;
}

export function MotionFoundation({ children }: MotionFoundationProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
