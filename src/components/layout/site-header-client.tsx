"use client";

import { AnimatePresence, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import * as motion from "motion/react-m";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { Container } from "@/components/ui/container";
import type {
  Locale,
  LocaleSwitchRoute,
  NavigationItem,
} from "@/domain/content/types";

import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import styles from "./site-header.module.css";

interface SiteHeaderClientProps {
  locale: Locale;
  brandName: string;
  logoSrc?: string;
  logoWidth?: number;
  logoHeight?: number;
  navigationLabel: string;
  navigation: readonly NavigationItem[];
  skipToContentLabel: string;
  languageSwitcherLabel: string;
  themeSwitcherLabel: string;
  lightThemeLabel: string;
  darkThemeLabel: string;
  mobileMenuOpenLabel: string;
  mobileMenuCloseLabel: string;
  mobileMenuLabel: string;
  mobileMenuTitle: string;
  primaryCta: {
    href: string;
    label: string;
  };
  routes: readonly LocaleSwitchRoute[];
}

const PREMIUM_EASE = [0.4, 0, 0.2, 1] as const;
const EXIT_EASE = [0.3, 0, 1, 1] as const;

function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function getAriaCurrent(
  pathname: string,
  href: string,
  locale: Locale,
): "page" | "location" | undefined {
  const currentPath = normalizePath(pathname);
  const destination = normalizePath(href);

  if (currentPath === destination) {
    return "page";
  }

  if (destination !== `/${locale}` && currentPath.startsWith(`${destination}/`)) {
    return "location";
  }

  return undefined;
}

function DirectionalArrow() {
  return (
    <svg
      className={styles.directionalArrow}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.75 9h10.5M10.25 5l4 4-4 4" />
    </svg>
  );
}

export function SiteHeaderClient({
  locale,
  brandName,
  logoSrc,
  logoWidth,
  logoHeight,
  navigationLabel,
  navigation,
  skipToContentLabel,
  languageSwitcherLabel,
  themeSwitcherLabel,
  lightThemeLabel,
  darkThemeLabel,
  mobileMenuOpenLabel,
  mobileMenuCloseLabel,
  mobileMenuLabel,
  mobileMenuTitle,
  primaryCta,
  routes,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  useMotionValueEvent(scrollY, "change", (latestScrollPosition) => {
    const nextScrolledState = latestScrollPosition > 16;
    setIsScrolled((currentState) =>
      currentState === nextScrolledState ? currentState : nextScrolledState,
    );
  });

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      mobilePanelRef.current
        ?.querySelector<HTMLElement>("[data-menu-initial-focus]")
        ?.focus();
    });

    body.style.overflow = "hidden";

    function restoreMenuButtonFocus() {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsMenuOpen(false);
        restoreMenuButtonFocus();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = mobilePanelRef.current;
      const menuButton = menuButtonRef.current;

      if (!panel || !menuButton) {
        return;
      }

      const focusableElements = [
        menuButton,
        ...Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ),
      ].filter((element) => element.getClientRects().length > 0);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }

    function handleDesktopBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMenuOpen(false);
        restoreMenuButtonFocus();
      }
    }

    const desktopBreakpoint = window.matchMedia("(min-width: 64rem)");
    document.addEventListener("keydown", handleKeyDown);
    desktopBreakpoint.addEventListener("change", handleDesktopBreakpoint);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopBreakpoint.removeEventListener("change", handleDesktopBreakpoint);
    };
  }, [isMenuOpen]);

  const panelMotion = shouldReduceMotion
    ? {
        initial: { opacity: 0, y: 0 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.01 } },
        exit: { opacity: 0, y: 0, transition: { duration: 0.01 } },
      }
    : {
        initial: { opacity: 0, y: -12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.36, ease: PREMIUM_EASE },
        },
        exit: {
          opacity: 0,
          y: -8,
          transition: { duration: 0.24, ease: EXIT_EASE },
        },
      };

  function closeMenuForNavigation() {
    setIsMenuOpen(false);
  }

  function navigateItem(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    closeMenuForNavigation();
    const destination = new URL(href, window.location.origin);
    if (destination.pathname !== pathname || !destination.hash) return;
    const target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    // Let the mobile panel release its scroll lock before moving to the section.
    window.requestAnimationFrame(() => {
      if (window.location.hash !== destination.hash) window.history.pushState(null, "", `${destination.pathname}${destination.hash}`);
      target.scrollIntoView({ behavior: shouldReduceMotion ? "instant" : "smooth", block: "start" });
      target.focus({ preventScroll: true });
    });
  }

  const ctaAriaCurrent = getAriaCurrent(pathname, primaryCta.href, locale);

  return (
    <>
      <a className={styles.skipLink} href="#main-content">
        {skipToContentLabel}
      </a>
      <header
        className={styles.header}
        data-scrolled={isScrolled}
        data-menu-open={isMenuOpen}
      >
        <span className={styles.stickyLine} aria-hidden="true" />
        <Container className={styles.inner}>
          <Link className={styles.brand} href={`/${locale}`}>
            {logoSrc && logoWidth && logoHeight ? (
              <Image
                className={styles.brandLogo}
                loading="eager"
                src={logoSrc}
                width={logoWidth}
                height={logoHeight}
                sizes="(max-width: 1023px) 192px, 180px"
                alt={brandName}
              />
            ) : (
              <span className={styles.brandSignal} aria-hidden="true"><i /><i /></span>
            )}
          </Link>

          <nav className={styles.desktopNavigation} aria-label={navigationLabel}>
            <ul className={styles.desktopNavigationList}>
              {navigation.map((item) => {
                const ariaCurrent = getAriaCurrent(pathname, item.href, locale);
                return (
                  <li key={item.key}>
                    <Link
                      className={styles.desktopNavLink}
                      href={item.href}
                      onClick={(event) => navigateItem(event, item.href)}
                      aria-current={ariaCurrent}
                      data-active={Boolean(ariaCurrent)}
                    >
                      <span className={styles.desktopNavLabel}>{item.label}</span>
                      {ariaCurrent ? (
                        <motion.span
                          className={styles.activeIndicator}
                          layoutId="site-navigation-active-indicator"
                          transition={{
                            duration: shouldReduceMotion ? 0.01 : 0.28,
                            ease: PREMIUM_EASE,
                          }}
                          aria-hidden="true"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.desktopActions}>
            <ThemeSwitcher
              label={themeSwitcherLabel}
              lightLabel={lightThemeLabel}
              darkLabel={darkThemeLabel}
            />
            <LanguageSwitcher
              currentLocale={locale}
              label={languageSwitcherLabel}
              pathname={pathname}
              routes={routes}
            />
            <Link
              className={styles.primaryCta}
              href={primaryCta.href}
              aria-current={ctaAriaCurrent}
              data-active={Boolean(ctaAriaCurrent)}
            >
              <span>{primaryCta.label}</span>
              <DirectionalArrow />
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            className={styles.menuButton}
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation-panel"
            aria-label={isMenuOpen ? mobileMenuCloseLabel : mobileMenuOpenLabel}
            data-open={isMenuOpen}
            onClick={() => setIsMenuOpen((currentState) => !currentState)}
          >
            <span className={styles.menuButtonLabel} aria-hidden="true">
              {mobileMenuLabel}
            </span>
            <span className={styles.menuGlyph} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </Container>

        <AnimatePresence initial={false}>
          {isMenuOpen ? (
            <motion.div
              ref={mobilePanelRef}
              id="mobile-navigation-panel"
              className={styles.mobilePanel}
              role="dialog"
              aria-modal="true"
              aria-label={navigationLabel}
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
            >
              <Container className={styles.mobilePanelInner}>
                <div className={styles.mobilePanelLead}>
                  <p>{mobileMenuTitle}</p>
                </div>

                <nav aria-label={navigationLabel}>
                  <ol className={styles.mobileNavigationList}>
                    {navigation.map((item, index) => {
                      const ariaCurrent = getAriaCurrent(
                        pathname,
                        item.href,
                        locale,
                      );
                      return (
                        <motion.li
                          key={item.key}
                          initial={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 10 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: shouldReduceMotion
                              ? 0
                              : 0.08 + index * 0.045,
                            duration: shouldReduceMotion ? 0.01 : 0.32,
                            ease: PREMIUM_EASE,
                          }}
                        >
                          <Link
                            className={styles.mobileNavLink}
                            href={item.href}
                            aria-current={ariaCurrent}
                            data-active={Boolean(ariaCurrent)}
                            data-menu-initial-focus={index === 0 ? "true" : undefined}
                            onClick={(event) => navigateItem(event, item.href)}
                          >
                            <span className={styles.mobileNavLabel}>
                              {item.label}
                            </span>
                            <DirectionalArrow />
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ol>
                </nav>

                <div className={styles.mobileUtilities}>
                  <ThemeSwitcher
                    label={themeSwitcherLabel}
                    lightLabel={lightThemeLabel}
                    darkLabel={darkThemeLabel}
                  />
                  <LanguageSwitcher
                    currentLocale={locale}
                    label={languageSwitcherLabel}
                    pathname={pathname}
                    routes={routes}
                    variant="panel"
                    onNavigate={closeMenuForNavigation}
                  />
                  <Link
                    className={styles.mobileCta}
                    href={primaryCta.href}
                    aria-current={ctaAriaCurrent}
                    onClick={closeMenuForNavigation}
                  >
                    <span>{primaryCta.label}</span>
                    <DirectionalArrow />
                  </Link>
                </div>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </>
  );
}
