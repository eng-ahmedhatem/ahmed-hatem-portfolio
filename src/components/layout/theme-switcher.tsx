"use client";

import { useEffect, useState } from "react";

import styles from "./theme-switcher.module.css";

type Theme = "dark" | "light";

const STORAGE_KEY = "ah-portfolio-theme:v1";
const THEME_EVENT = "portfolio-theme-change";

function currentDocumentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function ThemeSwitcher({
  label,
  lightLabel,
  darkLabel,
}: {
  label: string;
  lightLabel: string;
  darkLabel: string;
}) {
  const [theme, setTheme] = useState<Theme>(currentDocumentTheme);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const nextTheme = event.newValue === "light" ? "light" : "dark";
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    }

    function handleThemeChange(event: Event) {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === "dark" || nextTheme === "light") setTheme(nextTheme);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_EVENT, handleThemeChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(THEME_EVENT, handleThemeChange);
    };
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies for the current page when storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: nextTheme }));
  }

  const nextThemeLabel = theme === "dark" ? lightLabel : darkLabel;

  return (
    <button
      className={styles.button}
      type="button"
      aria-label={`${label}: ${nextThemeLabel}`}
      aria-pressed={theme === "light"}
      data-theme={theme}
      onClick={toggleTheme}
      suppressHydrationWarning
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
        <svg className={styles.sun} viewBox="0 0 18 18" focusable="false">
          <circle cx="9" cy="9" r="2.5" />
          <path d="M9 1.8v1.5M9 14.7v1.5M1.8 9h1.5M14.7 9h1.5M3.9 3.9 5 5M13 13l1.1 1.1M14.1 3.9 13 5M5 13l-1.1 1.1" />
        </svg>
        <svg className={styles.moon} viewBox="0 0 18 18" focusable="false">
          <path d="M14.7 11.7A6.1 6.1 0 0 1 6.3 3.3a6.2 6.2 0 1 0 8.4 8.4Z" />
        </svg>
      </span>
    </button>
  );
}
