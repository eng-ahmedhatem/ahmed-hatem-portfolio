# Developer Portfolio — Codex Instructions

## Product
Build a premium bilingual developer portfolio/platform for:
- MERN development
- Advanced WordPress
- API integrations
- Business automation

Positioning: BUILD → CONNECT → AUTOMATE.

## Phases
Current scope is Phase 1 public frontend only.

Do NOT implement until explicitly requested:
- Express / Node API
- Supabase
- authentication
- admin dashboard / CMS
- analytics

Future backend must connect without rewriting presentation components.

## Phase 1 stack
- Next.js App Router
- TypeScript
- React
- Motion for React when interaction needs it
- CSS design tokens / logical properties
- semantic accessible HTML

GSAP/ScrollTrigger are available but reserved for genuinely complex later scroll scenes.
Do not install/use Lenis until a later task explicitly needs it.

## Architecture
Presentation components must not import raw mock content directly.

Use:
UI → feature/view layer → content repository interface → mock repository

Future:
UI → feature/view layer → content repository interface → API repository → Express → Supabase

Keep shared machine/technical fields separate from translated editorial fields.

## Locales
Supported:
- `ar` — RTL
- `en` — LTR

Indexable routes are locale-prefixed:
`/[locale]`, `/[locale]/work`, `/[locale]/work/[slug]`,
`/[locale]/blog`, `/[locale]/blog/[slug]`,
`/[locale]/blog/category/[slug]`, `/[locale]/about`, `/[locale]/contact`.

`/` is locale-detection redirect only.

Locale resolution:
1. saved valid explicit preference
2. browser `Accept-Language`
3. English fallback

Do not use geolocation.

Set correct document `lang` and `dir`.
Use CSS logical properties.
Language switcher uses `العربية` / `English`, persists choice, and preserves equivalent route where possible.
Never silently show English editorial content inside an Arabic page.

Use current Next.js locale interception convention for installed version (`proxy.ts` when applicable).

## Typography
Use `next/font`.

Arabic:
- IBM Plex Sans Arabic
- 400 / 500 / 600 / 700

English:
- Manrope
- useful 400–700 range

Expose locale-specific font variables.

## Design
Light premium technical editorial style.

Tokens:
- background `#F8FAFC`
- surface `#FFFFFF`
- surface-soft `#F1F5F9`
- text `#0F172A`
- secondary text `#64748B`
- muted `#94A3B8`
- primary teal `#0CB7B5`
- primary dark `#079A98`
- accent `#2563EB`
- border `#E2E8F0`

Avoid generic SaaS/AI aesthetics:
- repeated 3-card sections
- excessive gradients/glass/blobs/pills
- heavy shadows
- decorative tech motifs without meaning

## SEO
Every localized public page supports:
- localized title/description
- self canonical
- `hreflang` ar/en
- intentional `x-default`
- localized OG/Twitter metadata
- structured-data hooks

Never canonicalize Arabic to English or vice versa.
Architecture must support sitemap, robots, clean slugs, localized slugs, and exclusion of drafts/missing translations.

## Motion
Motion communicates hierarchy/state/progress.
Default: Motion for React.
Respect reduced motion.
Use direction-aware semantic motion (`fromStart` / `fromEnd`).
Prefer transform/opacity.
No decorative animation in foundation work.

## Responsive/accessibility
Design for Arabic and English at:
1440, 1280, 1024, 768, 430, 390.

Mobile is intentionally recomposed, not merely shrunk.
Use semantic controls, keyboard access, visible focus, and sufficient contrast.

## Skills
Use only the smallest relevant set.

Project skills contain product-specific detail.
External specialist skills available:
- `vercel-react-best-practices`
- `web-design-guidelines`
- `motion-design`
- `gsap-react`
- `gsap-scrolltrigger`
- `gsap-performance`

Do not load GSAP skills unless the current task actually uses GSAP.

## Working rules
- Inspect existing code before editing.
- Do not recreate existing scaffold or working code.
- Prefer minimal diffs.
- Do not refactor unrelated code.
- Do not add dependencies without need.
- Server Components by default; Client Components only for real interaction.
- For routine scoped work, avoid unnecessary planning/research.
- Run only relevant verification; foundation completion requires lint, typecheck (if configured), and production build.
- Stop when the requested task is complete.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
