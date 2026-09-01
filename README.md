# Codex Portfolio Foundation Pack

Place the contents of this folder at the root of your portfolio repository.

Key files:

- `AGENTS.md` — repository-wide Codex guidance
- `.agents/skills/*/SKILL.md` — specialized Codex skills
- `START_HERE_CODEX_PROMPT.md` — use this as the first implementation task
- `ROADMAP.md` — planned product phases

Recommended workflow:

1. Copy these files into the repository.
2. Launch/restart Codex from the repository root so it discovers the guidance and skills.
3. Ask Codex to summarize the active project instructions and available local skills.
4. Paste the contents of `START_HERE_CODEX_PROMPT.md` as the first coding task.
5. Review the foundation before asking it to build the full homepage.

The application now uses Express as its protected API layer and Supabase for PostgreSQL content, Auth, Storage, contact requests, and analytics.


## Bilingual requirements

The pack is configured for:
- Arabic (`ar`, RTL)
- English (`en`, LTR)
- first-visit browser language detection via `Accept-Language`
- persisted explicit language selection
- locale-prefixed public URLs
- localized SEO/canonical/hreflang architecture
- bilingual Express + Supabase CMS content

## Supabase backend

The public UI still consumes the typed content repository interface. The API implementation stores content in Supabase PostgreSQL, authenticates the administrator through Supabase Auth, uploads media to Supabase Storage, and records contact requests and privacy-preserving analytics in PostgreSQL.

Apply the SQL migration and configure the server-only keys by following `supabase/README.md`.

For production deployment from GitHub to Vercel, follow `DEPLOY_VERCEL_AR.md`. The CMS API is implemented with Next.js Route Handlers so the public site and administration deploy as one Vercel project; the standalone Express runner remains available only for legacy/local troubleshooting.

Typography:
- Arabic: IBM Plex Sans Arabic
- English: Manrope

See:
- `.agents/skills/internationalization-bilingual/SKILL.md`
- `I18N_DECISIONS.md`
