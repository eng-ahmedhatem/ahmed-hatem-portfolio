# Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run every file in `migrations/` once, in filename order.
3. Open **Project Settings → API Keys** and copy the project URL, publishable key, and secret key.
4. Add them to `.env.local` using the names documented in `.env.example`.
5. Restart `npm run dev`.

## Administrator setup

- Set a unique `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` (12+ characters), and a random `SESSION_SECRET` (32+ characters) in `.env.local`.
- The first successful API start creates or updates that one administrator in Supabase Auth and assigns the `administrator` role in server-managed user metadata.
- Open `http://localhost:3000/admin/login`. The protected `/admin` route redirects unauthenticated requests back to the login page.
- After the first successful login, change the temporary password from Supabase Auth before deploying publicly and keep all production secrets in the hosting provider's server-only environment settings.

The migration files create the CMS content, contact, analytics, storage, and append-only administrator audit tables. Run both current migrations before using the dashboard:

1. `20260901000000_portfolio_core.sql`
2. `20260901010000_admin_security.sql`

The Express API is the only application layer allowed to use the secret key. Never expose it through a `NEXT_PUBLIC_*` variable or client component.

On the first successful API start, bundled projects, posts, pages, homepage content, categories, and site settings are seeded into `content_records`. The configured administrator is created in Supabase Auth. Uploaded images are stored in the public `portfolio-assets` bucket.
