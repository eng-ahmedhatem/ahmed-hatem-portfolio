# Task 01 — Phase 1 Foundation

Inspect the existing Next.js scaffold first. Do not reinitialize it.

Implement only the missing Phase 1 foundation required by `AGENTS.md`.

Deliver:
1. locale routing for `ar`/`en`, root browser-language redirect, persisted manual language preference
2. real RTL/LTR document behavior
3. IBM Plex Sans Arabic + Manrope through `next/font`
4. global design tokens and responsive container primitives
5. typed locale-aware domain/content contracts
6. repository interface + mock repository boundary
7. localized route shells for home/work/project/blog/post/category/about/contact
8. localized metadata helpers with self-canonical + ar/en hreflang + x-default
9. sitemap/robots foundation
10. simple content-driven Header/Footer shells with accessible language switcher
11. reduced-motion + direction-aware Motion foundation only if needed

Use only relevant skills, especially:
- internationalization-bilingual
- content-data-contracts
- seo-frontend-architecture
- portfolio-design-system
- responsive-layout
- accessibility-motion
- vercel-react-best-practices

Do not use GSAP or Lenis.
Do not build the final Header, Hero, homepage sections, CMS, backend, or analytics.

Done when:
- lint passes
- TypeScript check passes if configured
- production build passes
- `/` redirects by preference/browser language
- `/ar` is RTL and `/en` is LTR
- route shells work

Keep the final report under 15 lines. Stop after this task.
