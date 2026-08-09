---
name: motion-animation
description: Use when implementing React UI animation, hover/tap interactions, entrance/reveal motion, layout transitions, staggered sequences, or reusable motion primitives. Motion for React is the default animation tool.
---

# Motion principles

Motion should explain:
- hierarchy
- relationship
- state
- interaction
- progress

Never animate solely for spectacle.

# Default tool

Use Motion for React for ordinary component and interface animation.

Do not bring GSAP into a component unless the scene genuinely requires timeline/pinning complexity.

# Motion language

Preferred entrance vocabulary:
- opacity
- small translate
- subtle blur-to-sharp where appropriate
- restrained scale

Avoid:
- large spins
- bounces everywhere
- dramatic perspective transforms
- large off-screen travel for simple copy

# Suggested timing

Use as a starting range:
- micro interaction: 150–250ms
- ordinary UI transition: 220–400ms
- reveal: 400–650ms
- hero choreography: 650–1000ms

Do not blindly apply one duration globally.

# Stagger

Use stagger when a group has a reading order.

Example:
1. eyebrow/label
2. heading
3. supporting copy
4. actions
5. supporting visual

Keep stagger subtle.

# Hover

Card hover may use:
- `translateY(-4px to -7px)`
- very small scale if useful
- border/shadow refinement

Avoid aggressive scale.

# Buttons

Buttons can use:
- small icon translation
- surface/border transition
- subtle magnetic treatment on desktop when specifically justified

Interaction must remain predictable.

# RTL/LTR direction

For reading-direction-based motion, use semantic concepts:
- `fromStart`
- `fromEnd`

Resolve them by locale:
- LTR start = left
- RTL start = right

Do not hardcode a left-to-right entrance for Arabic UI when the motion implies reading progression.

# Architecture

Create reusable motion primitives where repetition is real:
- `Reveal`
- `StaggerGroup`
- `StaggerItem`
- section variants
- reduced-motion helpers

Do not hide all layout logic inside a giant animation abstraction.

# Performance

Prefer transforms and opacity.
Avoid continuously animating expensive layout/paint properties.
Do not animate huge blurred layers continuously.

# Accessibility

Coordinate with the accessibility-motion skill.
All major motion needs a reduced-motion path.
