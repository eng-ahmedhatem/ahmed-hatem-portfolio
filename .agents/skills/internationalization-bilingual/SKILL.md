---
name: internationalization-bilingual
description: Use when implementing or reviewing Arabic/English locale routing, browser-language detection, locale persistence, RTL/LTR behavior, language switching, localized content contracts, bilingual typography, localized SEO metadata, hreflang, or sitemap behavior.
---

# Product requirement

The public portfolio is bilingual:
- `ar` — Arabic — RTL
- `en` — English — LTR

Both languages are first-class product experiences.

Do not treat Arabic as a translated overlay on an English layout.

# Locale routing

Use locale-prefixed indexable routes.

Examples:

```text
/ar
/en

/ar/work
/en/work

/ar/work/[slug]
/en/work/[slug]

/ar/blog
/en/blog
```

The unprefixed root `/` should act as locale detection/redirect, not as a duplicate indexable homepage.

# Initial locale detection

Use this precedence:

1. Explicit saved user preference, when valid.
2. Browser `Accept-Language`.
3. Fallback locale: English.

If Arabic is preferred by the browser, use `ar`.
Otherwise use `en`.

Do not use IP/geolocation to guess language.

# Next.js interception convention

Use the current convention for the installed Next.js version.

For modern Next.js versions where `middleware` is deprecated/renamed to `proxy`, implement request locale handling using `proxy.ts`.

Do not add deprecated routing conventions without checking the installed framework version.

# Preference persistence

When the visitor chooses a locale manually:
- save an explicit locale preference
- keep it on later visits
- ensure the saved value is limited to supported locales
- do not overwrite that explicit preference merely because `Accept-Language` differs

# Language switcher

Always provide text labels:
- العربية
- English

Flags can be decorative at most; never use flags as the only language indicator.

When switching:
- preserve equivalent route/content if available
- use translated slug mapping if the content model supports localized slugs
- if no translation exists, fall back to the destination locale's relevant archive/home page
- keep the action accessible by keyboard and screen readers

# Document direction

Arabic:

```html
<html lang="ar" dir="rtl">
```

English:

```html
<html lang="en" dir="ltr">
```

Set direction at a high document/layout level so native bidi behavior works consistently.

# Logical CSS

Prefer logical properties.

Use:

```css
margin-inline-start
margin-inline-end
padding-inline-start
padding-inline-end
inset-inline-start
inset-inline-end
border-inline-start
border-inline-end
text-align: start
text-align: end
```

Avoid physical `left/right` rules for ordinary layout.

# Directional components

Review:
- arrows
- breadcrumbs
- timelines
- carousels
- process flows
- nav indicators
- slide animations
- project galleries
- before/after controls

Mirror only elements whose meaning is directional.

Do not mirror:
- play icon
- external-link icon unless its design specifically encodes direction
- logos
- code
- charts that represent fixed numeric axes unless the chart design requires RTL adaptation

# Motion

Create direction-aware helpers.

Conceptually:

```text
start side:
LTR → left
RTL → right

end side:
LTR → right
RTL → left
```

Use semantic motion names such as:
- `fromStart`
- `fromEnd`

rather than hardcoding:
- `fromLeft`
- `fromRight`

when the animation is tied to reading direction.

# Typography

Approved primary pairing:

## Arabic
IBM Plex Sans Arabic

Recommended working weights:
- 400 body
- 500 medium UI
- 600 subheadings
- 700 display/headings

## English
Manrope

Recommended useful range:
- 400 body
- 500 UI
- 600 subheadings
- 700 headings

Use `next/font` so the fonts are optimized and self-hosted by the framework.

Expose separate CSS variables, e.g.:

```text
--font-ar
--font-en
```

Apply the family by active locale.

Arabic body text may require slightly more line-height than English.
Tune optical size/line-height per locale rather than forcing identical numbers.

Do not use Cairo as the default merely because the site is Arabic; this project intentionally uses a more distinctive technical/editorial Arabic voice.

# Content contracts

The frontend domain layer should expose locale-aware data.

A good shape is explicit translations:

```ts
type Locale = "ar" | "en";

type TranslationState<T> = Partial<Record<Locale, T>>;
```

For a project, keep shared machine data separate from translated editorial data.

Conceptually:

```ts
Project {
  id
  technical/shared fields
  translations: {
    ar?: ProjectTranslation
    en?: ProjectTranslation
  }
}
```

Shared fields might include:
- internal ID
- year
- technologies
- external URLs
- media references

Translated fields might include:
- title
- slug
- excerpt
- problem
- solution
- results copy
- image alt text
- SEO

Do not duplicate genuinely shared technical data unnecessarily.

# Missing translation behavior

A translation can be missing.

Model this explicitly.

Never silently render English inside an Arabic page as if translated.

Preferred UX:
- do not expose the missing localized page in locale archives
- language switcher can fall back to the locale archive
- admin Phase 2 should display translation completeness

# Localized slugs

Architecture should allow a different slug per language.

Example concept:

```text
English: /en/work/automation-platform
Arabic:  /ar/work/منصة-الأتمتة
```

Do not require localized slugs in the first skeleton if they slow foundation work, but do not design contracts that make them impossible later.

# SEO

Each localized URL gets its own:
- title
- meta description
- canonical
- OG title/description/image
- structured-data text

Add alternate language references:
- Arabic URL
- English URL
- intentional x-default target

Never:
- canonicalize `/ar/...` to `/en/...`
- canonicalize `/en/...` to `/ar/...`

The locale alternatives should be discoverable in sitemap/metadata.

# Sitemap

When translated content exists, sitemap architecture should support language alternates.

Draft/untranslated content must not appear as a fake translated URL.

# Admin Phase 2 readiness

The future CMS must support:
- Arabic tab
- English tab
- translation completion/status
- independent localized SEO
- localized slug
- localized alt text
- preview per locale

Shared project metadata should remain shared where appropriate.

# QA

Test both locales at:
- 1440
- 1024
- 768
- 430
- 390

Check:
- nav direction
- menu opening direction
- text alignment
- card/order flow
- arrows
- motion direction
- line-height
- mixed Latin technology names inside Arabic paragraphs
- numbers
- code snippets
- URL wrapping
- language switcher persistence
- direct visit to `/`
- direct visit to `/ar/...`
- direct visit to `/en/...`
