# Portfolio Platform — Codex Project Instructions

## Product

Build a premium personal developer platform, not a generic portfolio template.

The owner specializes in:
- MERN stack development
- Advanced WordPress development
- Business automation
- API integrations

The public website must prove those capabilities through real product-quality UX, case studies, interactive demonstrations, and strong technical execution.

## Delivery phases

### Phase 1 — Public frontend
Build:
- Design system
- Responsive public website
- Homepage
- Projects archive
- Project case-study pages
- Blog archive
- Blog article pages
- About page
- Contact page
- Frontend SEO foundation
- Motion and scroll system
- Mock content/data layer that mirrors the future API

### Phase 2 — Backend + CMS
Planned stack:
- Node.js
- Express
- MongoDB
- REST API
- Authentication
- Admin dashboard
- Homepage section management
- Projects CMS
- Blog CMS
- Categories
- Media management
- SEO controls
- Leads management
- Site settings

### Phase 3 — Analytics + intelligence
Planned:
- GA4 integration
- Realtime analytics
- Traffic acquisition
- Top pages
- Countries/devices
- Conversion events
- Lead analytics
- SEO health
- Audit log

Do not implement Phase 2 or Phase 3 unless explicitly requested, but keep Phase 1 architecture compatible with them.

## Core architectural rule

NO public-facing content should be tightly hardcoded inside presentation components.

Components must receive typed data through props.

During Phase 1, content should come from a mock repository/data layer using contracts designed to be replaceable later by the Express REST API.

Preferred dependency direction:

UI Component
    ↓
Feature/View Model
    ↓
Content Repository Interface
    ↓
Mock Repository (Phase 1)

Later:

UI Component
    ↓
Feature/View Model
    ↓
Content Repository Interface
    ↓
Express API Client (Phase 2)

Do not couple components directly to mock JSON files.

## Technology direction

Preferred Phase 1 stack:
- Next.js
- TypeScript
- React
- Motion for React for the default motion system
- Lenis only when smooth scrolling materially improves the experience
- GSAP/ScrollTrigger only for complex pinned/timeline scroll scenes that are difficult to express cleanly with Motion
- CSS variables/design tokens
- Accessible semantic HTML

Do not add a dependency only to demonstrate that technology.

## Internationalization — Arabic + English

The public website is fully bilingual:
- Arabic (`ar`)
- English (`en`)

Arabic is RTL.
English is LTR.

### URL strategy

All indexable public pages must have a locale-prefixed URL.

Examples:

- `/ar`
- `/en`
- `/ar/work`
- `/en/work`
- `/ar/work/[slug]`
- `/en/work/[slug]`
- `/ar/blog`
- `/en/blog`
- `/ar/blog/[slug]`
- `/en/blog/[slug]`
- `/ar/blog/category/[slug]`
- `/en/blog/category/[slug]`
- `/ar/about`
- `/en/about`
- `/ar/contact`
- `/en/contact`

The root `/` is a locale-detection entry point and should redirect to the best locale rather than becoming a duplicate indexable homepage.

### Locale detection

On a visitor's first visit:
1. If a valid explicit locale-preference cookie exists, use it.
2. Otherwise inspect the browser `Accept-Language` header.
3. If Arabic is preferred, redirect to `/ar`.
4. Otherwise redirect to `/en`.
5. Unsupported languages fall back to English.

Do not infer language from geolocation.

When the user manually changes language, save the explicit preference and keep honoring it on later visits.

Use the current Next.js request interception convention for the installed Next.js version. In modern Next.js versions where `middleware` has been renamed/deprecated in favor of `proxy`, use `proxy.ts` rather than introducing deprecated conventions.

### Language switcher

The header must include a clear language switcher.

Switching language should:
- preserve the equivalent content/page whenever a translation exists
- fall back to the locale homepage or relevant archive when no equivalent exists
- persist the user's choice
- never rely only on a flag icon
- use accessible text/labels such as `العربية` and `English`

### HTML semantics

Every localized document must set:

Arabic:
- `lang="ar"`
- `dir="rtl"`

English:
- `lang="en"`
- `dir="ltr"`

Do not fake RTL by merely right-aligning text.

### RTL-safe CSS

Prefer CSS logical properties:

- `margin-inline-start/end`
- `padding-inline-start/end`
- `inset-inline-start/end`
- `border-inline-start/end`
- `text-align: start/end`

Avoid hardcoded `left` and `right` for layout unless the visual meaning is truly physical rather than directional.

Icons with directional meaning must mirror appropriately in RTL.
Non-directional icons must not be mirrored.

### Motion in RTL/LTR

Directional animation must respect writing direction.

Concepts like:
- enter from start
- leave toward end
- arrow progression
- horizontal workflow

must resolve differently in RTL and LTR.

Do not hardcode the same x-direction for both locales.

### Content architecture

Do not mix Arabic and English text inside one presentation component.

Content contracts must support locale-specific values from Phase 1.

Future CMS content must support independent Arabic and English:
- title
- excerpt
- body/content
- CTA labels
- project case-study fields
- blog content
- category content
- navigation labels
- image alt text
- SEO title
- meta description
- Open Graph text
- slug when localized slugs are enabled

A translation may be unavailable. Model that state explicitly rather than silently showing the wrong language.

### SEO internationalization

Every translated page must support:
- locale-specific canonical URL
- `hreflang` alternates for Arabic and English
- `x-default` fallback strategy
- locale-specific title and meta description
- locale-specific Open Graph metadata
- locale-specific structured-data text
- locale-aware sitemap entries

Never canonicalize the Arabic page to the English page or vice versa.

The Arabic and English versions are equivalent language alternatives, not duplicates to collapse.

### Typography

Primary bilingual font direction:

Arabic:
- IBM Plex Sans Arabic
- weights: 400, 500, 600, 700

English:
- Manrope
- use a restrained useful weight range, ideally 400–700

Use `next/font` for optimized self-hosted delivery.

Typography goals:
- Arabic must remain highly readable at body sizes.
- Arabic headings should feel modern/technical without becoming condensed.
- English and Arabic should have visually compatible weight and density.
- Do not force exactly identical font sizes between scripts when optical balance needs a small locale-specific adjustment.

Font tokens should expose separate Arabic and Latin families, for example:
- `--font-ar`
- `--font-en`

Use the correct family based on document locale/direction.

A monospace font is optional for actual code/technical snippets only. Do not add another font family merely for decoration.

## Visual direction

The site is LIGHT MODE.

Brand palette:
- Background: #F8FAFC
- Surface: #FFFFFF
- Surface Soft: #F1F5F9
- Text Primary: #0F172A
- Text Secondary: #64748B
- Text Muted: #94A3B8
- Primary: #0CB7B5
- Primary Dark: #079A98
- Secondary Accent: #2563EB
- Border: #E2E8F0

Visual personality:
- premium
- modern
- technical
- editorial
- clean
- restrained
- confident

Avoid:
- cyberpunk
- gaming aesthetics
- neon-heavy effects
- excessive glassmorphism
- excessive gradients
- purple/blue AI-template visual clichés
- repeated 3-card grids
- every section centered
- meaningless floating blobs
- huge border radii everywhere

## Layout

Default max content width: 1320px.

Suggested page paddings:
- desktop: 32px
- tablet: 24px
- mobile: 18px

Suggested vertical section rhythm:
- desktop: 112px–148px
- mobile: 72px–92px

Do not mechanically apply the same spacing to every section. Preserve visual rhythm.

## Content positioning

Core positioning:
BUILD → CONNECT → AUTOMATE

Use the product story:
- BUILD: websites and web applications
- CONNECT: APIs and integrations
- AUTOMATE: business workflows

The website should position the owner as a developer who builds complete digital systems, not merely visual websites.

## Public pages

At minimum plan for locale-prefixed public routes:

/[locale]
/[locale]/work
/[locale]/work/[slug]
/[locale]/blog
/[locale]/blog/[slug]
/[locale]/blog/category/[slug]
/[locale]/about
/[locale]/contact

The bare `/` route is for locale detection/redirect only.

Keep routing SEO-friendly, human-readable, and translation-aware.

## Homepage conceptual order

1. Header / navigation
2. Hero
3. Credibility / selected stats
4. What I Build
5. Featured Projects
6. Build / Connect / Automate positioning
7. Automation interactive experience
8. Development process
9. Lab / mini tools
10. Technology capabilities
11. Client results / proof
12. Testimonials
13. About preview
14. Latest articles
15. Contact CTA
16. Footer

This is a conceptual structure. Improve composition when needed rather than blindly generating identical sections.

## Motion philosophy

Motion must communicate hierarchy, state, cause, or progress.

Default:
- subtle
- fast
- physically believable
- transform/opacity based where practical

Never animate something merely because animation is possible.

Desktop may have richer interaction.
Mobile must simplify motion when complexity harms usability or performance.

Respect prefers-reduced-motion.

## Responsive philosophy

Mobile is not a scaled desktop.

Recompose layouts where necessary.
Convert complex horizontal/diagram experiences into clear vertical experiences on small screens.
Avoid overflow and tiny interactive targets.

## SEO foundation

Phase 1 must support:
- unique metadata per page and locale
- locale-specific canonical URLs
- `hreflang` alternates (`ar`, `en`, and an intentional `x-default`)
- Open Graph/Twitter metadata per locale
- structured data hooks
- semantic heading hierarchy
- clean slugs
- crawlable links
- robots handling
- sitemap architecture
- article metadata
- project metadata
- category metadata
- image alt text
- future CMS-driven SEO fields

Do not bury meaningful H1/H2 text behind JavaScript-only rendering.

## Code quality

- TypeScript strictness preferred.
- Keep components cohesive.
- Avoid god components.
- Separate content/data contracts from UI.
- Keep animation logic modular.
- Reuse primitives without making every section look identical.
- No unnecessary global state.
- No duplicate design tokens.
- No magic numbers when a token or named constant makes intent clearer.
- Avoid premature abstraction.
- Prefer readable code over clever code.

## Before considering a UI task complete

Check:
- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 390px

Verify:
- no horizontal overflow
- readable line lengths
- coherent spacing
- button and target sizes
- image behavior
- heading wrapping
- navigation
- sticky elements
- motion
- reduced motion
- keyboard focus
- color contrast
- loading behavior

## Skill routing

Use the local skills when relevant:

- portfolio-design-system: colors, typography, spacing, surfaces, visual tokens
- premium-ui-composition: page/section composition and rhythm
- anti-generic-ai-design: detect and remove AI-template visual clichés
- motion-animation: component and UI motion
- scroll-experience: viewport and scroll-linked motion
- advanced-scroll-scenes: rare complex pinned/timeline scroll experiences
- responsive-layout: adaptive mobile/tablet/desktop behavior
- frontend-performance: rendering, assets, animation performance, loading
- accessibility-motion: accessibility and reduced-motion behavior
- seo-frontend-architecture: frontend SEO foundations compatible with the future CMS
- content-data-contracts: typed mock content architecture compatible with the future Express API
- internationalization-bilingual: locale routing, browser-language detection, RTL/LTR, localized SEO, translation-aware content, and bilingual typography
- visual-qa: visual and interaction QA before completion

When several apply, use the smallest relevant set rather than loading every skill.

## Working method

For substantial tasks:
1. Inspect existing code first.
2. State a concise implementation plan.
3. Implement in coherent slices.
4. Run available typecheck/lint/tests.
5. Perform visual QA where browser tooling is available.
6. Fix regressions before declaring completion.

Do not replace a deliberate existing design or architecture with a generic template.
