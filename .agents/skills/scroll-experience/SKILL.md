---
name: scroll-experience
description: Use for scroll progress, viewport reveals, scroll-linked transforms, parallax, sticky narrative behavior, and section progress effects that can be implemented cleanly with Motion and native sticky positioning.
---

# Goal

Use scrolling as a narrative input without hijacking the user's scroll behavior.

# Good candidates

- top progress indicator
- subtle hero progression
- project media parallax
- section progress
- workflow progression
- sticky text paired with changing visual content
- restrained text/word reveals

# Default implementation

Prefer:
- Motion `whileInView`
- Motion `useInView`
- Motion `useScroll`
- Motion value transforms
- CSS `position: sticky`

before reaching for GSAP.

# Smooth scrolling

Lenis may be used when it materially improves the experience.

Rules:
- never make wheel/trackpad feel delayed or heavy
- do not create unnatural scroll acceleration
- disable/simplify where reduced motion or device constraints require it
- do not introduce Lenis merely because it is fashionable

# Parallax

Keep depth differences modest.
Text readability always wins.

# Sticky sections

Sticky storytelling must have:
- a clear narrative reason
- a bounded start/end
- a usable small-screen fallback
- no trapped scrolling

# Mobile

Convert complex sticky or horizontal experiences into simpler vertical flows when appropriate.

# Avoid

- scroll-jacking
- huge scroll distances for small content
- forced snap sections across the entire site
- animation that blocks navigation
- parallax on every image
