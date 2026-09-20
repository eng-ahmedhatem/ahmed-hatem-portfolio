// Isolated test configuration: never load developer or production credentials.
Object.assign(process.env, {
  NODE_ENV: "test",
  APP_ORIGIN: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "https://portfolio.example",
  SUPABASE_URL: "https://test.supabase.invalid",
  SUPABASE_PUBLISHABLE_KEY: "test-publishable",
  SUPABASE_SECRET_KEY: "test-server-only",
  SESSION_SECRET: "isolated-test-session-secret-at-least-32-characters",
  ANALYTICS_SALT: "isolated-test-analytics-secret",
  ADMIN_EMAIL: "owner@portfolio.example",
  ADMIN_PASSWORD: "isolated-test-password",
});
delete process.env.RESEND_API_KEY;
delete process.env.MAIL_FROM;
globalThis.fetch = async () => { throw new Error("Network disabled in tests. Mock explicit requests."); };
