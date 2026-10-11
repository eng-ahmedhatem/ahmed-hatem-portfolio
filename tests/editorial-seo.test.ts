import assert from "node:assert/strict";
import { test } from "node:test";

import { withEditorialSeoFallback } from "../src/domain/content/editorial-seo";
import type { SeoMetadata } from "../src/domain/content/types";

const placeholder: SeoMetadata = {
  title: "New project",
  description: "Add a clear description before publishing.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "New project",
    description: "Add a clear description before publishing.",
    image: { url: "/cover.webp", width: 1200, height: 630, alt: "" },
  },
};

test("published project metadata replaces untouched seed copy with localized editorial copy", () => {
  const result = withEditorialSeoFallback(placeholder, "project", "en", "Terra Pulse", "A corporate website for Terra Pulse.");
  assert.equal(result.title, "Terra Pulse");
  assert.equal(result.description, "A corporate website for Terra Pulse.");
  assert.equal(result.openGraph.title, "Terra Pulse");
  assert.equal(result.openGraph.description, "A corporate website for Terra Pulse.");
  assert.equal(result.openGraph.image?.alt, "Terra Pulse");
});

test("custom SEO copy is preserved, including a custom social title", () => {
  const custom: SeoMetadata = {
    ...placeholder,
    title: "Expert web development",
    openGraph: { ...placeholder.openGraph, title: "A custom social title" },
  };
  const result = withEditorialSeoFallback(custom, "project", "en", "Terra Pulse", "A corporate website.");
  assert.equal(result.title, "Expert web development");
  assert.equal(result.openGraph.title, "A custom social title");
});

test("Arabic placeholder metadata never falls back to English", () => {
  const arabic: SeoMetadata = {
    ...placeholder,
    title: "مشروع جديد",
    description: "أضف وصفًا واضحًا قبل النشر.",
    openGraph: { title: "مشروع جديد", description: "أضف وصفًا واضحًا قبل النشر." },
  };
  const result = withEditorialSeoFallback(arabic, "project", "ar", "تيرا بالس", "موقع تعريفي لشركة تيرا بالس.");
  assert.equal(result.title, "تيرا بالس");
  assert.equal(result.openGraph.description, "موقع تعريفي لشركة تيرا بالس.");
});

test("legacy published summaries are replaced in both locales", () => {
  for (const [locale, stale, fresh] of [
    ["ar", "أضف وصفًا مختصرًا قبل النشر.", "موقع تعريفي لشركة تيرا بالس."],
    ["en", "Add a short summary before publishing.", "A corporate website for Terra Pulse."],
  ] as const) {
    const result = withEditorialSeoFallback({
      ...placeholder,
      description: stale,
      openGraph: { ...placeholder.openGraph, description: stale },
    }, "project", locale, "Terra Pulse", fresh);
    assert.equal(result.description, fresh);
    assert.equal(result.openGraph.description, fresh);
  }
});
