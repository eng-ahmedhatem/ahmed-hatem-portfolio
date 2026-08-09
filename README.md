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

This pack intentionally focuses on Phase 1 while preserving a clean path to the future Express + MongoDB CMS.


## Bilingual requirements

The pack is configured for:
- Arabic (`ar`, RTL)
- English (`en`, LTR)
- first-visit browser language detection via `Accept-Language`
- persisted explicit language selection
- locale-prefixed public URLs
- localized SEO/canonical/hreflang architecture
- future bilingual Express + MongoDB CMS content

Typography:
- Arabic: IBM Plex Sans Arabic
- English: Manrope

See:
- `.agents/skills/internationalization-bilingual/SKILL.md`
- `I18N_DECISIONS.md`
