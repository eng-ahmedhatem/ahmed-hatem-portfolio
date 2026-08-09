---
name: frontend-performance
description: Use when reviewing Next.js/React rendering performance, images, fonts, bundle size, animation cost, third-party scripts, lazy loading, or Core Web Vitals risks for the public portfolio.
---

# Objective

The portfolio should feel premium because it is fast, not despite being animated.

# Rendering

- keep client components limited to where interactivity requires them
- avoid turning entire pages into client components for one animation
- keep static content server-renderable where possible
- avoid unnecessary state and effects

# Assets

- optimize responsive images
- size media correctly
- lazy-load below-the-fold heavy media
- avoid shipping giant video backgrounds
- prefer modern formats where practical

# Fonts

- minimize font families and weights
- preload only what matters
- avoid layout shift

# Motion

Prefer transform and opacity.
Do not continuously animate:
- large blur filters
- shadows
- layout properties
- giant gradients

Pause or avoid expensive off-screen activity.

# Dependencies

Before adding a dependency:
- check if platform/framework features already solve it
- verify it materially improves the implementation
- avoid multiple libraries for the same ordinary task

# JavaScript

Keep the public homepage from becoming a demo bundle.
Interactive sections should be isolated and lazy-loaded when appropriate.

# Third-party scripts

Treat analytics/chat/embed scripts as performance costs.
Load intentionally.

# Completion

When tooling exists, run:
- production build
- typecheck
- lint
- performance audit

Do not accept a successful build as proof of good runtime performance.
