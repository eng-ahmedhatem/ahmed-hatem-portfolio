# First Codex Task — Phase 1 Foundation

Read `AGENTS.md` and use the relevant local skills before implementation.

We are starting Phase 1 of a premium light-mode developer portfolio platform.

## Goal for this task

Create the frontend foundation only. Do not build the entire homepage yet.

Set up the architecture so future public sections are content-driven, bilingual (`ar`/`en`), RTL/LTR-safe, and Phase 2 can replace mock data with an Express + Supabase API without rewriting presentation components.

## Required deliverables

1. Inspect the existing repository first.
2. If the repository is empty, initialize an appropriate modern Next.js + TypeScript project.
3. Create the global design token foundation from the project instructions.
4. Create the main responsive page container and spacing primitives.
5. Create a typed content/domain layer.
6. Create repository interfaces for public content.
7. Create a mock repository implementation.
8. Add initial locale-aware types for:
   - supported locale (`ar` / `en`)
   - translation maps/states
   - site settings
   - homepage sections
   - projects
   - blog posts
   - blog categories
   - SEO metadata
9. Create the locale-prefixed public route skeleton:
   - `/[locale]`
   - `/[locale]/work`
   - `/[locale]/work/[slug]`
   - `/[locale]/blog`
   - `/[locale]/blog/[slug]`
   - `/[locale]/blog/category/[slug]`
   - `/[locale]/about`
   - `/[locale]/contact`
10. Make `/` a language-detection redirect:
   - explicit saved locale preference first
   - then browser `Accept-Language`
   - Arabic when Arabic is preferred
   - otherwise English
   - persist manual language choice
   - do not use geolocation
   - use the current Next.js request interception convention; if the installed modern version uses `proxy.ts`, do not introduce deprecated `middleware.ts`
11. Set document `lang` and `dir` correctly for every locale.
12. Use CSS logical properties so the UI is structurally RTL/LTR-safe.
13. Configure typography using `next/font`:
   - Arabic: IBM Plex Sans Arabic
   - English: Manrope
   - expose separate font CSS variables
14. Add an accessible `العربية / English` language switcher that preserves equivalent routes when possible.
15. Add shared localized metadata/SEO utilities supporting:
   - self canonical per locale
   - `hreflang` Arabic/English
   - intentional `x-default`
   - localized Open Graph metadata
16. Add an initial responsive header and footer driven by localized mock site settings.
17. Establish the Motion accessibility/reduced-motion foundation and direction-aware animation helpers, but do not over-animate this task.
18. Keep GSAP and Lenis out unless a current implementation actually needs them.
19. Run lint/typecheck/build available in the repository.

## Design direction

Light, premium, technical, editorial.

Primary colors:
- background #F8FAFC
- surface #FFFFFF
- text #0F172A
- secondary text #64748B
- teal #0CB7B5
- accent blue #2563EB
- border #E2E8F0

Do not generate a generic SaaS homepage.
Do not fill every route with fake feature cards.
For unfinished routes, use clean intentional shells.

## Architecture constraint

Do not let presentation components directly import raw mock JSON/data modules.

Use a repository/data access boundary so a future `ApiContentRepository` can replace the mock implementation.

The repository contract must be locale-aware. Components should receive already-resolved active-locale content rather than containing ad-hoc translation logic throughout the UI.

## Completion report

At the end, provide:
- what was created
- key architecture decisions
- files changed
- commands/tests run
- any unresolved issues
- the recommended next task

Do not begin the full Hero or homepage storytelling until this foundation is stable.
