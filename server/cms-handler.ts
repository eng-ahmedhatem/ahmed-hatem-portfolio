import { createHmac, randomUUID } from "node:crypto";

import { z } from "zod";

import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifyCredentials,
  verifySessionToken,
  type AdminIdentity,
} from "./auth-core";
import { ensureBackendReady } from "./backend";
import { hasAuthConfiguration, serverConfig } from "./config";
import { getBundledSnapshot, getPublicSnapshot, validateContentPayload } from "./content";
import { CONTENT_KINDS, type ContentKind } from "./models";
import { getAssetBucketName, getSupabaseAdmin, isDatabaseReady } from "./supabase";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const loginSchema = z.object({ email: z.string().email().max(320), password: z.string().min(1).max(256) });
const contactSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional(),
  service: z.string().trim().min(1).max(120),
  budget: z.string().trim().max(120).optional(),
  details: z.string().trim().min(1).max(5000),
  preferredContact: z.string().trim().max(120).optional(),
  locale: z.enum(["ar", "en"]),
  pagePath: z.string().startsWith("/").max(500),
});
const analyticsSchema = z.object({
  visitorId: z.string().min(16).max(160),
  path: z.string().startsWith("/").max(500),
  locale: z.enum(["ar", "en"]),
  referrer: z.string().max(1000).optional(),
});
const entityIdSchema = z.string().trim().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/);
const assetIdSchema = z.string().uuid();

interface ContentRow {
  id: string;
  kind: ContentKind;
  entity_id: string;
  payload: Record<string, unknown>;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string;
  budget: string | null;
  details: string;
  preferred_contact: string | null;
  locale: "ar" | "en";
  page_path: string;
  status: "new" | "read" | "archived";
  created_at: string;
  updated_at: string;
}

interface AuditRow {
  id: string;
  actor_email: string | null;
  action: string;
  entity_kind: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface AnalyticsSummary {
  views: number;
  uniqueVisitors: number;
  byDevice: { _id: string; value: number }[];
  byDay: { _id: string; value: number }[];
  topPages: { _id: string; value: number }[];
}

function responseHeaders(extra?: HeadersInit) {
  const headers = new Headers(extra);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin, Sec-Fetch-Site");
  return headers;
}

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers: responseHeaders(headers) });
}

function empty(status = 204, headers?: HeadersInit) {
  return new Response(null, { status, headers: responseHeaders(headers) });
}

function requestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return forwardedHost ? `${forwardedProtocol}://${forwardedHost}` : new URL(request.url).origin;
}

function trustedMutation(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  let sourceOrigin = origin;
  if (!sourceOrigin && referer) {
    try { sourceOrigin = new URL(referer).origin; } catch { sourceOrigin = null; }
  }
  return Boolean(sourceOrigin && [requestOrigin(request), serverConfig.appOrigin].includes(sourceOrigin));
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  for (const cookie of cookies) {
    const separator = cookie.indexOf("=");
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(cookie.slice(separator + 1).trim());
  }
  return undefined;
}

function sessionCookie(token: string, expires = false) {
  const attributes = [
    `${SESSION_COOKIE}=${expires ? "" : encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Priority=High",
    serverConfig.production ? "Secure" : "",
    expires ? "Max-Age=0" : `Max-Age=${SESSION_TTL_SECONDS}`,
  ].filter(Boolean);
  return attributes.join("; ");
}

async function adminFor(request: Request) {
  if (!hasAuthConfiguration()) return null;
  const token = cookieValue(request, SESSION_COOKIE);
  return token ? verifySessionToken(token) : null;
}

function isAdminClient(request: Request) {
  return request.headers.get("x-portfolio-admin") === "1";
}

function rateLimitKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
}

function canAttemptLogin(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= 8, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)) };
}

function classifyDevice(userAgent: string) {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet" as const;
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile" as const;
  return "desktop" as const;
}

function detectedImageMimeType(buffer: Buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp" && /^(avif|avis)$/.test(buffer.toString("ascii", 8, 12))) return "image/avif";
  return null;
}

function toContentRecord(row: ContentRow) {
  return { _id: row.id, kind: row.kind, entityId: row.entity_id, payload: row.payload, updatedBy: row.updated_by ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at };
}

function toContactItem(row: ContactRow) {
  return { _id: row.id, name: row.name, email: row.email, phone: row.phone ?? undefined, service: row.service, budget: row.budget ?? undefined, details: row.details, preferredContact: row.preferred_contact ?? undefined, locale: row.locale, pagePath: row.page_path, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

function throwSupabaseError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

async function writeAudit(admin: AdminIdentity, action: string, entityKind?: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const { error } = await getSupabaseAdmin().from("admin_audit_log").insert({ actor_id: admin.id, actor_email: admin.email, action, entity_kind: entityKind ?? null, entity_id: entityId ?? null, metadata });
  throwSupabaseError(error, "Unable to write the administration audit log");
}

async function requestJson(request: Request) {
  try { return await request.json() as Record<string, unknown>; } catch { return {}; }
}

async function ensureDatabase() {
  try { return await ensureBackendReady(); } catch (error) {
    console.error("Supabase initialization failed.", error instanceof Error ? error.message : error);
    return false;
  }
}

async function requireAdminRequest(request: Request) {
  if (!isAdminClient(request)) return { response: json({ error: "Invalid administration request." }, 403) };
  if (!isDatabaseReady() || !hasAuthConfiguration()) return { response: json({ error: "Administration is not configured." }, 503) };
  const admin = await adminFor(request);
  if (!admin) return { response: json({ error: "Authentication required." }, 401, { "Set-Cookie": sessionCookie("", true) }) };
  return { admin };
}

export async function handleCmsRequest(request: Request, path: readonly string[]) {
  const method = request.method.toUpperCase();
  const route = path.join("/");

  if (method === "GET" && route === "health") {
    const database = await ensureDatabase();
    return json({ ok: true, provider: "supabase", database, administration: database && hasAuthConfiguration() });
  }

  if (method === "GET" && route === "public/snapshot") {
    if (!(await ensureDatabase())) return json(getBundledSnapshot(), 200, { "X-Content-Source": "bundled-fallback" });
    try {
      return json(await getPublicSnapshot(), 200, { "Cache-Control": "public, max-age=30, stale-while-revalidate=120", "X-Content-Source": "supabase" });
    } catch (error) {
      console.error("Supabase content read failed; returning bundled content.", error);
      return json(getBundledSnapshot(), 200, { "X-Content-Source": "bundled-fallback" });
    }
  }

  if ((route === "auth/login" || route === "auth/logout" || route.startsWith("admin/")) && !isAdminClient(request)) {
    return json({ error: "Invalid administration request." }, 403);
  }
  if (method !== "GET" && (route === "auth/login" || route === "auth/logout") && !trustedMutation(request)) {
    return json({ error: "Untrusted request origin." }, 403);
  }

  if (!(await ensureDatabase())) return json({ error: "The Supabase data service is not configured." }, 503);

  if (method === "POST" && route === "auth/login") {
    if (!isAdminClient(request)) return json({ error: "Invalid administration request." }, 403);
    if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
    const attempt = canAttemptLogin(rateLimitKey(request));
    if (!attempt.allowed) return json({ error: "Too many sign-in attempts. Try again later." }, 429, { "Retry-After": String(attempt.retryAfter) });
    const parsed = loginSchema.safeParse(await requestJson(request));
    if (!parsed.success) return json({ error: "Invalid sign-in details." }, 400);
    const startedAt = Date.now();
    const admin = await verifyCredentials(parsed.data.email, parsed.data.password);
    if (!admin) {
      const remainingDelay = Math.max(0, 350 - (Date.now() - startedAt));
      if (remainingDelay) await new Promise((resolve) => setTimeout(resolve, remainingDelay));
      return json({ error: "Email or password is incorrect." }, 401);
    }
    loginAttempts.delete(rateLimitKey(request));
    await writeAudit(admin, "auth.login", "admin-user", admin.id);
    return json({ user: { email: admin.email, displayName: admin.displayName } }, 200, { "Set-Cookie": sessionCookie(await createSessionToken(admin)) });
  }

  if (method === "POST" && route === "auth/logout") {
    if (!isAdminClient(request)) return json({ error: "Invalid administration request." }, 403);
    if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
    return empty(204, { "Set-Cookie": sessionCookie("", true) });
  }

  if (method === "GET" && route === "auth/me") {
    const admin = await adminFor(request);
    return admin ? json({ user: admin }) : json({ error: "Authentication required." }, 401, { "Set-Cookie": sessionCookie("", true) });
  }

  if (route.startsWith("admin/")) {
    const authorization = await requireAdminRequest(request);
    if (authorization.response) return authorization.response;
    const admin = authorization.admin as AdminIdentity;
    const supabase = getSupabaseAdmin();

    if (method === "GET" && route === "admin/content") {
      const kind = new URL(request.url).searchParams.get("kind");
      if (kind && !CONTENT_KINDS.includes(kind as ContentKind)) return json({ error: "Unknown content kind." }, 400);
      let query = supabase.from("content_records").select("*").order("kind", { ascending: true }).order("updated_at", { ascending: false });
      if (kind) query = query.eq("kind", kind);
      const { data, error } = await query;
      throwSupabaseError(error, "Unable to read content records");
      return json({ records: ((data ?? []) as ContentRow[]).map(toContentRecord) });
    }

    if (method === "GET" && route === "admin/activity") {
      const { data, error } = await supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(20);
      throwSupabaseError(error, "Unable to read administration activity");
      return json({ items: ((data ?? []) as AuditRow[]).map((item) => ({ id: item.id, actorEmail: item.actor_email, action: item.action, entityKind: item.entity_kind, entityId: item.entity_id, metadata: item.metadata, createdAt: item.created_at })) });
    }

    if ((method === "PUT" || method === "DELETE") && path[1] === "content" && path.length === 4) {
      const kind = path[2];
      const entityId = entityIdSchema.safeParse(path[3]);
      if (!CONTENT_KINDS.includes(kind as ContentKind) || !entityId.success) return json({ error: "Invalid content identifier." }, 400);

      if (method === "DELETE") {
        if (kind === "site-settings" || kind === "homepage") return json({ error: "This content cannot be deleted." }, 400);
        if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
        const { error } = await supabase.from("content_records").delete().eq("kind", kind).eq("entity_id", entityId.data);
        throwSupabaseError(error, "Unable to delete the content record");
        await writeAudit(admin, "content.delete", kind, entityId.data);
        return empty();
      }

      if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
      const body = await requestJson(request);
      const parsed = validateContentPayload(kind as ContentKind, body.payload);
      const version = z.string().datetime({ offset: true }).optional().safeParse(body.version);
      if (!version.success) return json({ error: "Content version is invalid." }, 400);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return json({ error: `راجع الحقل ${issue.path.join(".") || "المحتوى"}: ${issue.message}` }, 400);
      }
      if (parsed.data.id !== entityId.data) return json({ error: "Content payload and identifier do not match." }, 400);
      const payload = { ...parsed.data };
      if ("updatedAt" in payload) payload.updatedAt = new Date().toISOString();

      if (["project", "post", "category"].includes(kind)) {
        const translations = payload.translations as Record<string, { slug?: unknown }> | undefined;
        const slugs = [translations?.ar?.slug, translations?.en?.slug].filter((slug): slug is string => typeof slug === "string");
        const { data: peers, error: peerError } = await supabase.from("content_records").select("entity_id,payload").eq("kind", kind).neq("entity_id", entityId.data);
        throwSupabaseError(peerError, "Unable to verify localized slugs");
        const collision = (peers ?? []).some((peer) => {
          const peerTranslations = (peer.payload as Record<string, unknown>)?.translations as Record<string, { slug?: unknown }> | undefined;
          return [peerTranslations?.ar?.slug, peerTranslations?.en?.slug].some((slug) => typeof slug === "string" && slugs.includes(slug));
        });
        if (collision) return json({ error: "الرابط المختصر مستخدم في محتوى آخر. اختر رابطًا مختلفًا لكل لغة." }, 409);
      }

      const { data: existing, error: existingError } = await supabase.from("content_records").select("id,updated_at").eq("kind", kind).eq("entity_id", entityId.data).maybeSingle();
      throwSupabaseError(existingError, "Unable to inspect the content record");
      if (existing && version.data && existing.updated_at !== version.data) return json({ error: "This content changed in another session. Reload it before saving." }, 409);
      const mutation = existing
        ? supabase.from("content_records").update({ payload, updated_by: admin.email }).eq("id", existing.id).eq("updated_at", version.data ?? existing.updated_at)
        : supabase.from("content_records").insert({ kind, entity_id: entityId.data, payload, updated_by: admin.email });
      const { data, error } = await mutation.select("*").maybeSingle();
      throwSupabaseError(error, "Unable to save the content record");
      if (!data) return json({ error: "This content changed while you were editing. Reload it before saving." }, 409);
      await writeAudit(admin, existing ? "content.update" : "content.create", kind, entityId.data);
      return json({ record: toContentRecord(data as ContentRow) });
    }

    if (method === "POST" && route === "admin/assets") {
      if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "Select a JPG, PNG, WebP, or AVIF image." }, 400);
      if (file.size > 4 * 1024 * 1024) return json({ error: "The image must be smaller than 4 MB." }, 413);
      const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
      if (!allowed.has(file.type)) return json({ error: "Unsupported image format." }, 400);
      const buffer = Buffer.from(await file.arrayBuffer());
      const detected = detectedImageMimeType(buffer);
      if (!detected || detected !== file.type) return json({ error: "The uploaded file content does not match its image format." }, 400);
      const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
      const assetId = randomUUID();
      const objectPath = `${assetId}.${extensions[file.type]}`;
      const storage = supabase.storage.from(getAssetBucketName());
      const { error } = await storage.upload(objectPath, buffer, { contentType: file.type, cacheControl: "31536000", upsert: false });
      throwSupabaseError(error, "Unable to upload the asset");
      await writeAudit(admin, "asset.upload", "asset", assetId, { mimeType: detected, size: file.size });
      return json({ asset: { id: assetId, src: storage.getPublicUrl(objectPath).data.publicUrl, mimeType: file.type } }, 201);
    }

    if (method === "GET" && route === "admin/contacts") {
      const page = Math.max(1, Number(new URL(request.url).searchParams.get("page")) || 1);
      const limit = 20;
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase.from("contact_submissions").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + limit - 1);
      throwSupabaseError(error, "Unable to read contact submissions");
      const total = count ?? 0;
      return json({ items: ((data ?? []) as ContactRow[]).map(toContactItem), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    }

    if (method === "PATCH" && path[1] === "contacts" && path.length === 3) {
      if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
      const status = z.object({ status: z.enum(["new", "read", "archived"]) }).safeParse(await requestJson(request));
      const id = z.string().uuid().safeParse(path[2]);
      if (!status.success || !id.success) return json({ error: "Invalid message update." }, 400);
      const { data, error } = await supabase.from("contact_submissions").update({ status: status.data.status }).eq("id", id.data).select("*").single();
      throwSupabaseError(error, "Unable to update the contact submission");
      await writeAudit(admin, "contact.update", "contact", id.data, { status: status.data.status });
      return json({ item: toContactItem(data as ContactRow) });
    }

    if (method === "GET" && route === "admin/analytics") {
      const requestedDays = Math.max(7, Math.min(90, Number(new URL(request.url).searchParams.get("days")) || 30));
      const from = new Date(Date.now() - requestedDays * 86_400_000);
      const { data, error } = await supabase.rpc("portfolio_analytics_summary", { p_from: from.toISOString() });
      throwSupabaseError(error, "Unable to calculate analytics");
      return json({ rangeDays: requestedDays, ...(data as AnalyticsSummary) });
    }
  }

  if (method === "POST" && route === "contact") {
    if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
    const parsed = contactSchema.safeParse(await requestJson(request));
    if (!parsed.success) return json({ error: "Please review the required contact fields." }, 400);
    const input = parsed.data;
    const { data, error } = await getSupabaseAdmin().from("contact_submissions").insert({ name: input.name, email: input.email.toLowerCase(), phone: input.phone || null, service: input.service, budget: input.budget || null, details: input.details, preferred_contact: input.preferredContact || null, locale: input.locale, page_path: input.pagePath }).select("id").single();
    throwSupabaseError(error, "Unable to save the contact submission");
    return json({ delivered: true, id: data?.id }, 201);
  }

  if (method === "POST" && route === "analytics") {
    if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
    const parsed = analyticsSchema.safeParse(await requestJson(request));
    if (!parsed.success) return json({ error: "Invalid analytics event." }, 400);
    if (!serverConfig.analyticsSalt) return json({ error: "Analytics is not configured." }, 503);
    const visitorHash = createHmac("sha256", serverConfig.analyticsSalt).update(parsed.data.visitorId).digest("hex");
    const { error } = await getSupabaseAdmin().from("page_views").insert({ visitor_hash: visitorHash, path: parsed.data.path, locale: parsed.data.locale, referrer: parsed.data.referrer || null, device: classifyDevice(request.headers.get("user-agent") ?? "") });
    throwSupabaseError(error, "Unable to record the analytics event");
    return empty();
  }

  if (method === "GET" && path[0] === "assets" && path.length === 2) {
    const assetId = assetIdSchema.safeParse(path[1]);
    if (!assetId.success) return empty(404);
    const storage = getSupabaseAdmin().storage.from(getAssetBucketName());
    for (const extension of ["jpg", "png", "webp", "avif"]) {
      const { data, error } = await storage.download(`${assetId.data}.${extension}`);
      if (!error && data) return new Response(await data.arrayBuffer(), { headers: { "Content-Type": data.type || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" } });
    }
    return empty(404);
  }

  return json({ error: "Not found." }, 404);
}
