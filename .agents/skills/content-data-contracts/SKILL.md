---
name: content-data-contracts
description: Use when defining TypeScript content models, repository interfaces, mock data, project/blog schemas, section configuration, or API-ready frontend data boundaries so Phase 1 can later switch cleanly to Express and MongoDB.
---

# Mission

Make Phase 1 frontend content-driven and Phase-2-ready.

# Hard rule

Presentation components must not import raw mock JSON directly.

Use contracts and repositories.

# Suggested structure

```text
src/
  domain/
    content/
      types.ts
      repositories.ts
  data/
    mock/
      homepage.ts
      projects.ts
      posts.ts
      categories.ts
      site-settings.ts
    repositories/
      mock-content-repository.ts
  features/
  components/
```

Adapt to the actual repository, but preserve the dependency direction.

# Locales

Supported locales:

```ts
type Locale = "ar" | "en";
```

Keep shared machine data separate from translated editorial data.

Prefer explicit translation maps:

```ts
type Translations<T> = Partial<Record<Locale, T>>;
```

Entities such as Projects, Posts, Categories, Site Settings and Homepage Sections should support independent `ar` and `en` editorial/SEO payloads.

Do not silently fall back to the other language inside a localized public page.
Missing translation is a real state.

The future CMS must be able to edit each locale independently.

# Core entities

Plan typed models for:

## Site settings
- identity
- localized navigation labels
- contact details
- social links
- localized footer
- global SEO per locale
- locale preference/settings

## Homepage
Use structured section data.
Every section should have:
- id
- type
- enabled
- order
- content payload

Do not build a fully freeform page builder.

## Project
Include room for:
- title
- slug
- excerpt
- overview
- client/industry/year
- role
- stack
- challenge/problem
- solution
- process
- architecture
- automation
- results
- media gallery
- featured state/order
- links
- SEO

## Blog post
Include room for:
- title
- slug
- excerpt
- content
- featured image
- author
- category references
- status
- published date
- SEO

## Category
- shared identity/reference
- translations for `ar` and `en`
- localized name
- localized slug
- localized description
- localized image alt/content where required
- localized SEO

# Repository interfaces

UI should consume methods such as:
- getHomepage()
- getProjects()
- getFeaturedProjects()
- getProjectBySlug()
- getPosts()
- getPostBySlug()
- getCategories()
- getSiteSettings()

Exact names may vary.

# Future API compatibility

Design returned data so later implementations can be:
- MockContentRepository
- ApiContentRepository

without rewriting presentation components.

# IDs and slugs

Keep stable IDs separate from public slugs.
Do not use array indexes as entity identity.

# Dates

Use a consistent serialized representation across mock/API boundaries.

# Validation

When runtime external data arrives in Phase 2, validate it at the API boundary.
Do not scatter validation throughout UI components.
