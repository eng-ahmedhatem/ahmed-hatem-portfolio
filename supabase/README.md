# Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** and run every file in `migrations/` once, in filename order.
3. Open **Project Settings → API Keys** and copy the project URL, publishable key, and secret key.
4. Add them to `.env.local` using the names documented in `.env.example`.
5. Restart `npm run dev`.

## Administrator setup

- Set a unique `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` (12+ characters), and a random `SESSION_SECRET` (32+ characters) in `.env.local`.
- The first successful API start creates or updates that configured administrator in Supabase Auth and assigns `app_metadata.role = "admin"`.
- Open `http://localhost:3000/admin/login`. The protected `/admin` route redirects unauthenticated requests back to the login page.
- After the first successful login, change the temporary password from Supabase Auth before deploying publicly and keep all production secrets in the hosting provider's server-only environment settings.

The migration files create the CMS content, contact, analytics, storage, append-only audit tables and shared request protection. Run all migrations in this order before using the dashboard:

1. `20260901000000_portfolio_core.sql`
2. `20260901010000_admin_security.sql`
3. `20260920000000_operational_hardening.sql`
4. `20260920010000_testimonials.sql`

Only the server data/auth layer may use the secret key. Next Route Handlers are the production API; the legacy Express runner delegates to the same handler. Never expose the key through a `NEXT_PUBLIC_*` variable or client component.

On an empty installation only, bundled projects, posts, pages, homepage content, categories, and site settings are seeded into `content_records`. Deleted records are not recreated. Uploaded images are stored in the public `portfolio-assets` bucket. Testimonials start empty.

## Operational setup

- Open **الأمان والتشغيل** in the CMS to enroll your authenticator (TOTP). Keep a secure authenticator backup; recovery from lost MFA requires the Supabase project owner. Enrollment and password entry must be completed by the owner.
- Shared request limits fail closed. Apply migration 3 before deploying the updated login/contact API.
- Configure optional server-only `RESEND_API_KEY`, `MAIL_FROM` (a verified sender email), and `CONTACT_NOTIFICATION_EMAIL` (defaults to `ADMIN_EMAIL`) in Vercel. Never put these credentials in the CMS or Git.
- Set `APP_ORIGIN` and `NEXT_PUBLIC_SITE_URL` to the permanent HTTPS production origin. Password recovery links use `APP_ORIGIN`.
- Contact notifications contain only a reference and admin link. The original message remains stored if mail fails. The inbox provides retry for failed notifications.
- Test one contact notification and one recovery email after configuring the sender. These are not assumed to work merely because environment variables exist.

## Backups

The CMS exports content JSON and validates a supplied export without overwriting anything. It does **not** back up image bytes, contacts, analytics, audit data, or Auth users. Use the Supabase project's supported database backup/export workflow and separately copy Storage objects to protected storage. Retain backups privately and test restoration in a separate non-production project before relying on them. No automatic backup schedule or destructive restore is configured by this change.

## Owner recovery before email is configured

From your own terminal in this repository run `npm run admin:password`. It loads the local server configuration, finds the existing `ADMIN_EMAIL` administrator, and asks you to enter and confirm a new password (hidden input, 12–128 characters). It does not create/promote accounts, print passwords, or save them in a file. It invalidates portfolio sessions and preserves MFA. Do not pass the password as a command argument or send it to an AI assistant. `ADMIN_PASSWORD` is the initial bootstrap password only; restarting does not overwrite the password of an existing account.
