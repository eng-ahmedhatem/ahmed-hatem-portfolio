---
name: seo-frontend-architecture
description: Use when creating routes, metadata, structured data hooks, blog/project page templates, category pages, internal linking, sitemap/robots architecture, canonical handling, or other frontend SEO foundations that must later be CMS-driven.
---

# Objective

Build SEO into the architecture rather than bolting it on after design.

# Content types

Plan metadata contracts for:
- static pages
- projects
- blog posts
- blog categories

Each should be able to receive from the future CMS PER LOCALE:
- SEO title
- meta description
- canonical URL
- index/noindex
- follow/nofollow
- Open Graph title
- Open Graph description
- Open Graph image
- structured data configuration where relevant

# International SEO

Supported language alternatives:
- Arabic: `ar`
- English: `en`

Indexable pages use locale-prefixed URLs.

For each translated page:
- self-canonicalize the active locale URL
- declare Arabic/English alternates
- support an intentional `x-default`
- keep metadata text in the active language
- keep structured-data text in the active language

Do not canonicalize one language to the other.

The sitemap architecture must be able to express localized alternates.

The root `/` is a language-detection redirect and should not compete as a duplicate homepage.

# Rendering

Important textual content must be crawlable in the initial rendered document.
Do not rely on a typing animation to create the only H1 text.
Typing/reveal visuals should enhance a real semantic heading.

# Routes

Prefer stable, readable routes:
- `/work`
- `/work/[slug]`
- `/blog`
- `/blog/[slug]`
- `/blog/category/[slug]`

Avoid meaningless IDs in public URLs.

# Headings

One clear primary page topic.
Use semantic H1/H2/H3 hierarchy based on document structure rather than visual size.

# Internal links

Use crawlable anchor links.
Connect:
- homepage → featured projects
- projects → related projects
- blog → relevant case studies/services
- articles → categories/related articles

# Images

Every meaningful image contract should support alt text.
Decorative images should not create noisy alt text.

# Structured data hooks

Design reusable generators/hooks for future CMS-driven structured data such as:
- Person
- WebSite
- WebPage
- BreadcrumbList
- BlogPosting/Article
- FAQPage when actual FAQ content is present
- SoftwareApplication only when genuinely applicable

Do not fabricate review/rating schema.

# Technical foundation

Architecture must allow:
- dynamic sitemap
- robots configuration
- redirects later from backend/admin
- canonical generation
- pagination metadata if archives grow

# Draft content

Future CMS draft/unpublished content must not leak into:
- sitemap
- archives
- public routes
