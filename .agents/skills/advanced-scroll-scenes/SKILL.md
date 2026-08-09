---
name: advanced-scroll-scenes
description: Use only for complex scroll-driven storytelling requiring pinned timelines, synchronized sequences, scrubbed animation, or advanced ScrollTrigger behavior that is impractical to implement clearly with Motion. Do not use for ordinary reveals or simple parallax.
---

# Default stance

Do NOT use this skill unless the interaction genuinely needs advanced scroll choreography.

Motion is the default.
GSAP + ScrollTrigger is the escalation path.

# Appropriate cases

- pinned narrative with multiple visual state changes
- complex scrubbed timeline
- horizontal project showcase controlled by vertical scrolling
- synchronized multi-layer scene
- carefully designed section-level snap behavior

# Requirements before implementation

Document:
1. Why Motion/native sticky is insufficient.
2. Start/end behavior.
3. Desktop behavior.
4. Mobile fallback.
5. Reduced-motion fallback.
6. Cleanup/unmount strategy.

# Implementation constraints

- scope timelines to the component
- clean up ScrollTrigger instances
- avoid conflicting control of the same transform by Motion and GSAP
- keep scene boundaries explicit
- do not pin the entire site
- preserve keyboard navigation
- test browser resizing

# Performance

Avoid:
- animating layout-heavy properties
- excessive filters
- dozens of simultaneous ScrollTriggers
- continuously active off-screen scenes

# Small screens

Complex pinned scenes should usually become:
- normal vertical sequence
- simple reveal
- static diagram

rather than trying to preserve desktop choreography at all costs.
