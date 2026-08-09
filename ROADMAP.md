# Portfolio Platform Roadmap

## Phase 1 — Public frontend

### Foundation
- Repository architecture
- Arabic/English locale architecture
- browser-language detection + persisted manual preference
- RTL/LTR direction foundation
- IBM Plex Sans Arabic + Manrope typography
- Design tokens
- Locale-aware content contracts
- Mock repositories
- International SEO utilities (`canonical`, `hreflang`, `x-default`)
- Header/footer
- Route shells
- Motion accessibility foundation

### Homepage
- Hero
- credibility stats
- featured work
- Build / Connect / Automate
- automation workflow demo
- process
- lab
- tech capabilities
- results/testimonials
- about preview
- latest blog
- CTA

### Work
- projects archive
- filters/categories if justified
- detailed case-study template
- project media
- architecture diagrams
- project results
- next-project navigation

### Blog
- archive
- categories
- article template
- related content
- share/reading UX where useful

### Other
- about
- contact
- responsive QA
- motion QA
- performance pass
- accessibility pass
- SEO pass

## Phase 2 — Express + MongoDB CMS

- Express app architecture
- MongoDB models/indexes
- auth/session/security
- admin shell
- homepage structured section manager with Arabic/English content tabs
- projects CMS with independent Arabic/English case-study content
- blog CMS with Arabic/English content
- categories with localized names/slugs/SEO
- translation completeness/status
- media library
- SEO manager
- redirects
- leads
- site settings
- audit log
- revisions
- REST API
- frontend ApiContentRepository

## Phase 3 — Analytics

- GA4 Data API
- date comparisons
- realtime users
- traffic sources
- top content
- geo/devices
- conversion events
- lead analytics
- admin dashboards
- caching strategy
