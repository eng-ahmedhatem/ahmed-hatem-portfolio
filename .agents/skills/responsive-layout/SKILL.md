---
name: responsive-layout
description: Use when adapting layouts, navigation, typography, interactive diagrams, project presentations, or motion behavior across desktop, tablet, and mobile. Mobile must be intentionally recomposed, not merely shrunk.
---

# Philosophy

Mobile is a separate composition problem.

Do not simply:
- shrink font sizes
- stack every desktop column
- preserve complex desktop diagrams unchanged

# Target review widths

Always review relevant UI around:
- 1440
- 1280
- 1024
- 768
- 430
- 390

# Bilingual direction

Review every breakpoint in both:
- `dir="rtl"` Arabic
- `dir="ltr"` English

Do not assume a layout that works LTR will automatically be polished RTL.

Prefer logical CSS properties and verify:
- asymmetric layouts
- project metadata rows
- icon/text spacing
- nav/menu alignment
- arrows and directional controls
- workflow direction
- scroll animation direction

# Typography

Use fluid sizing where helpful.
Protect minimum readable body size.
Prevent display headings from creating awkward 1-word orphan lines when a better wrap is possible.

# Layout

Desktop:
- richer asymmetry
- more whitespace
- stronger interactive visuals

Tablet:
- reduce layout complexity
- preserve hierarchy

Mobile:
- clear vertical reading flow
- simplify diagrams
- shorten animation paths
- avoid sticky constructs that consume the viewport
- ensure buttons and navigation are easy to tap

# Automation diagrams

Desktop can use network/node layouts.

Mobile should generally use a vertical workflow:

Trigger
↓
Webhook
↓
Automation
↓
CRM / Email / Sheet

# Media

Use appropriate responsive image sizing.
Avoid cropped project screenshots that hide the important UI.
Prevent horizontal overflow.

# Navigation

Ensure:
- keyboard accessibility
- mobile menu focus management
- no inaccessible hover-only links
- clear active/focus state

# Final check

At each review width inspect:
- horizontal overflow
- clipped shadows/content
- heading wraps
- long URLs/code
- button size
- sticky behavior
- image aspect ratios
- touch target separation
