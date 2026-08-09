# Internationalization Decisions

## Languages

- Arabic (`ar`) — RTL
- English (`en`) — LTR

## First visit

Resolution order:

1. Valid explicit user-language cookie.
2. Browser `Accept-Language`.
3. English fallback.

Arabic-preferred browser → `/ar`
Otherwise → `/en`

No geolocation-based language guessing.

## Manual switch

The language switcher persists an explicit choice and should try to keep the visitor on the translated equivalent page.

## URL shape

All indexable public content is locale-prefixed.

```text
/ar/...
/en/...
```

The bare root `/` is a detection/redirect entry point.

## Framework implementation note

Use the current Next.js convention supported by the installed version.
For modern Next.js where `middleware` has been renamed/deprecated, use `proxy.ts` for locale interception/redirect logic.

## RTL

Set `lang` and `dir` on the localized document/layout.
Use CSS logical properties.
Mirror only truly directional icons/animations.

## Fonts

### Arabic
IBM Plex Sans Arabic
- 400
- 500
- 600
- 700

### English
Manrope
- 400–700 useful range

Use `next/font`.
Expose locale-specific CSS variables.

## SEO

Each language has an independent:
- URL
- canonical
- title
- description
- Open Graph metadata
- structured-data text

Translated equivalents reference each other using language alternates.
Support `x-default`.

Never canonicalize Arabic to English or English to Arabic.

## CMS Phase 2

Every editorial entity should distinguish:

### Shared fields
Examples:
- internal ID
- technology stack
- dates/year
- media references
- external URLs

### Localized fields
Examples:
- title
- slug
- excerpt
- body
- CTA labels
- case-study narrative
- alt text
- SEO metadata

A translation can be missing and should have an explicit status.

Admin UX should eventually provide:
- Arabic tab
- English tab
- translation completeness indicator
- locale preview
- independent locale SEO fields
