import type { Locale } from "@/domain/content/types";

export type ReadingSide = "start" | "end";

export function getDirectionalOffset(
  locale: Locale,
  side: ReadingSide,
  distance = 20,
): number {
  const startMultiplier = locale === "ar" ? 1 : -1;
  return side === "start" ? startMultiplier * distance : startMultiplier * -distance;
}

export function getDirectionAwareReveal(locale: Locale, side: ReadingSide) {
  return {
    hidden: { opacity: 0, x: getDirectionalOffset(locale, side) },
    visible: { opacity: 1, x: 0 },
  } as const;
}
