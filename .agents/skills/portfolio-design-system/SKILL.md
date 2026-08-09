---
name: portfolio-design-system
description: Use when creating or reviewing colors, typography, spacing, surfaces, borders, shadows, radii, buttons, UI primitives, or visual tokens for the light-mode developer portfolio. Do not use for backend architecture.
---

# Purpose

Maintain one coherent premium light-mode design language across the public portfolio.

# Required palette

Use these as the source of truth unless the user explicitly changes them:

- `--background: #F8FAFC`
- `--surface: #FFFFFF`
- `--surface-soft: #F1F5F9`
- `--text-primary: #0F172A`
- `--text-secondary: #64748B`
- `--text-muted: #94A3B8`
- `--primary: #0CB7B5`
- `--primary-dark: #079A98`
- `--accent: #2563EB`
- `--border: #E2E8F0`

Use teal as a deliberate signal, not a paint bucket.

Good uses:
- primary actions
- active states
- selected words
- technical connection lines
- small icons
- focused controls

Limit blue to a secondary accent.

# Surfaces

Default page background is light.
Cards are predominantly white with subtle border separation.
Use shadows sparingly and softly.
Prefer hierarchy from spacing, type scale, border and composition before shadow.

# Radius

Do not make everything pill-shaped.
Use a restrained radius scale, for example:
- small controls: 8–10px
- standard cards: 14–18px
- large media panels: 20–24px

Only use larger radii when the composition benefits from it.

# Typography

Typography must feel editorial and technical in BOTH Arabic and English.

Primary pairing:
- Arabic: `IBM Plex Sans Arabic`
- English: `Manrope`

Recommended Arabic weights:
- 400 body
- 500 UI
- 600 subheadings
- 700 headings/display

Recommended English working range:
- 400–700

Expose separate font tokens such as:
- `--font-ar`
- `--font-en`

Apply by active locale/document language.

Arabic is RTL and may need slightly more body line-height and slightly different optical sizing than English. Tune per locale instead of forcing identical metrics.

Requirements:
- strong large display type without oversized SaaS-template proportions
- readable body measure in both scripts
- clear hierarchy
- consistent heading rhythm
- avoid uppercase body copy
- avoid tiny low-contrast labels
- preserve mixed-script readability for terms like `Next.js`, `Node.js`, `MongoDB`, `n8n`, `WordPress`

Use responsive type with `clamp()` when useful.
Use `next/font` for optimized delivery.

# Layout tokens

Default container maximum: 1320px.

Suggested horizontal paddings:
- desktop 32px
- tablet 24px
- mobile 18px

Suggested section spacing:
- desktop 112–148px
- mobile 72–92px

These are ranges, not mandatory repeated values.

# Buttons

Primary:
- teal background
- high contrast label
- refined hover and focus
- compact professional sizing

Secondary:
- light/white surface
- visible border
- dark text

Do not use huge CTA buttons unless the layout specifically calls for one.

# Icons

Use a consistent icon system.
Prefer line icons.
Do not use emojis as product/service icons.

# Final visual check

Ask:
- Is teal overused?
- Does the page still work in grayscale hierarchy?
- Are borders/shadows subtle?
- Is there sufficient visual breathing room?
- Does this look like a custom portfolio rather than a component library demo?
