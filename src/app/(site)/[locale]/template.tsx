import type { ReactNode } from "react";

import { RouteTransition } from "@/components/motion/route-transition";

export default function LocalizedTemplate({ children }: { children: ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
