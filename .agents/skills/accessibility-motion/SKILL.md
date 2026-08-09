---
name: accessibility-motion
description: Use when implementing or reviewing animations, scroll effects, focus states, semantic interaction, reduced-motion behavior, or keyboard accessibility in animated portfolio experiences.
---

# Core rule

Visual sophistication must not reduce accessibility.

# Reduced motion

Respect `prefers-reduced-motion`.

When reduced motion is requested:
- remove parallax
- remove large translations/scales
- disable smooth-scroll enhancement
- simplify scrubbed/pinned scenes
- avoid auto-moving decorative elements
- use instant or subtle opacity transitions where useful

Content must remain fully available.

# Keyboard

All interactive elements must be reachable and operable with keyboard.
Do not attach click behavior to non-interactive elements without appropriate semantics.

# Focus

Provide visible focus states consistent with the design system.

Never remove outlines without a real replacement.

# Semantics

Use:
- real buttons for actions
- real links for navigation
- correct heading order
- landmarks
- labels for forms

# Motion interactions

Hover-only affordances need non-hover equivalents.
Cursor-following visuals must never contain essential information.

# Sticky / scroll scenes

Ensure users can:
- navigate past them naturally
- use keyboard without traps
- understand content without animation

# Color

Do not depend on teal/blue color alone to communicate state.
Ensure readable contrast.
