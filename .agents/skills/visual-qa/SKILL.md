---
name: visual-qa
description: Use at the end of frontend UI work to inspect visual quality, responsive behavior, overflow, spacing, typography, animation, accessibility states, and regression risks. A successful build alone is not sufficient.
---

# Purpose

Perform a deliberate visual and interaction review before declaring UI complete.

# Viewports

Review relevant pages/components around:
- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 390px

# Bilingual checks

Run visual QA in BOTH:
- Arabic RTL
- English LTR

Verify:
- `<html lang>` and `dir`
- correct locale font
- Arabic line-height/readability
- mixed-script technology names
- mirrored directional icons only where appropriate
- language switcher
- route preservation on language change
- no accidental English fallback inside Arabic content
- no duplicate canonical across languages

# Layout checks

- horizontal overflow
- unintended full-width content
- container consistency
- section rhythm
- awkward empty areas
- alignment
- card/media height
- sticky boundaries
- footer/nav spacing

# Typography checks

- heading wrap
- readable body measure
- orphaned words
- tiny labels
- inconsistent font weights
- missing hierarchy

# Interaction checks

- hover
- focus-visible
- active states
- touch targets
- mobile menu
- form states
- keyboard navigation

# Motion checks

- reveal timing
- stagger rhythm
- scroll scene start/end
- resize behavior
- no animation conflicts
- reduced-motion fallback

# Visual identity checks

Look specifically for:
- overuse of teal
- repeated identical cards
- generic SaaS patterns
- unnecessary gradients
- too many radii/shadows
- meaningless decoration

Use the anti-generic-ai-design skill for corrections.

# Content checks

- no placeholder lorem ipsum unless explicitly intended
- no fake client metrics presented as real
- project links sensible
- alt text present where needed

# Technical checks

Run available:
- lint
- typecheck
- tests
- production build

Fix actual regressions instead of merely reporting them.
