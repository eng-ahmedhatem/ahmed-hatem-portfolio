import { z } from "zod";

const schema = z.object({
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("portfolio-assets"),
  SESSION_SECRET: z.string().min(32).optional(),
  ANALYTICS_SALT: z.string().min(16).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(12).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  MAIL_FROM: z.string().email().optional(),
  CONTACT_NOTIFICATION_EMAIL: z.string().email().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid server configuration: ${parsed.error.message}`);
}

export const serverConfig = {
  port: parsed.data.API_PORT,
  appOrigin: parsed.data.APP_ORIGIN,
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabasePublishableKey: parsed.data.SUPABASE_PUBLISHABLE_KEY ?? parsed.data.SUPABASE_ANON_KEY,
  supabaseSecretKey: parsed.data.SUPABASE_SECRET_KEY ?? parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  supabaseStorageBucket: parsed.data.SUPABASE_STORAGE_BUCKET,
  sessionSecret: parsed.data.SESSION_SECRET,
  analyticsSalt: parsed.data.ANALYTICS_SALT ?? parsed.data.SESSION_SECRET,
  adminEmail: parsed.data.ADMIN_EMAIL?.toLowerCase(),
  adminPassword: parsed.data.ADMIN_PASSWORD,
  resendApiKey: parsed.data.RESEND_API_KEY,
  mailFrom: parsed.data.MAIL_FROM,
  notificationEmail: parsed.data.CONTACT_NOTIFICATION_EMAIL ?? parsed.data.ADMIN_EMAIL,
  production: parsed.data.NODE_ENV === "production",
};

export function hasDatabaseConfiguration() {
  return Boolean(serverConfig.supabaseUrl && serverConfig.supabaseSecretKey);
}

export function hasAuthConfiguration() {
  return Boolean(
    serverConfig.sessionSecret &&
    !serverConfig.sessionSecret.startsWith("replace-") &&
    serverConfig.supabaseUrl &&
    serverConfig.supabasePublishableKey &&
    serverConfig.supabaseSecretKey &&
    serverConfig.adminEmail &&
    serverConfig.adminEmail !== "admin@example.com" &&
    serverConfig.adminPassword &&
    !serverConfig.adminPassword.startsWith("replace-"),
  );
}
