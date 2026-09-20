import { createHmac, randomUUID } from "node:crypto";

import { z } from "zod";
import { requestLimit } from "./rate-limit";
import { handleAuthRequest, handleAdminSecurity } from "./security-handler";
import { notifyContact } from "./mail";
import { readRequestJson } from "./request-body";
import { analyticsLocation } from "./analytics-event";
import { withEmploymentDefaults } from "../src/data/defaults/employment";
import { withTestimonialsDefaults } from "../src/data/defaults/testimonials";
import { withHomepageCopyDefaults } from "../src/data/defaults/homepage-copy";
import type { Homepage, SiteSettings } from "../src/domain/content/types";

import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  verifySessionToken,
  type AdminIdentity,
} from "./auth-core";
import { ensureBackendReady } from "./backend";
import { hasAuthConfiguration, serverConfig } from "./config";
import { getBundledSnapshot, getPublicSnapshot, validateContentPayload } from "./content";
import { CONTENT_KINDS, type ContentKind } from "./models";
import { getAssetBucketName, getSupabaseAdmin, isDatabaseReady } from "./supabase";

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
  website: z.string().max(500).optional(),
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
  notification_status?: string;
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
  return new URL(request.url).origin;
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
    try { return decodeURIComponent(cookie.slice(separator + 1).trim()); } catch { return undefined; }
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

function classifyDevice(userAgent: string) {
  if (/ipad|tablet|playbook|silk/i.test(userAgent) || (/android/i.test(userAgent) && !/mobile/i.test(userAgent))) return "tablet" as const;
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile" as const;
  return "desktop" as const;
}

function isLikelyBot(userAgent: string) {
  return /bot|crawler|spider|slurp|lighthouse|headlesschrome|preview|facebookexternalhit|whatsapp/i.test(userAgent);
}

function detectedImageMimeType(buffer: Buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp" && /^(avif|avis)$/.test(buffer.toString("ascii", 8, 12))) return "image/avif";
  return null;
}

function toContentRecord(row: ContentRow) {
  if (row.kind === "homepage") row = { ...row, payload: withHomepageCopyDefaults(withTestimonialsDefaults(row.payload as unknown as Homepage)) as unknown as Record<string, unknown> };
  if (row.kind === "site-settings") row = { ...row, payload: withEmploymentDefaults(row.payload as unknown as SiteSettings) as unknown as Record<string, unknown> };
  return { _id: row.id, kind: row.kind, entityId: row.entity_id, payload: row.payload, updatedBy: row.updated_by ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at };
}

function toContactItem(row: ContactRow) {
  return { _id: row.id, name: row.name, email: row.email, phone: row.phone ?? undefined, service: row.service, budget: row.budget ?? undefined, details: row.details, preferredContact: row.preferred_contact ?? undefined, locale: row.locale, pagePath: row.page_path, status: row.status, notificationStatus: row.notification_status, createdAt: row.created_at, updatedAt: row.updated_at };
}

function throwSupabaseError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

async function writeAudit(admin: AdminIdentity, action: string, entityKind?: string, entityId?: string, metadata: Record<string, unknown> = {}) {
  const { error } = await getSupabaseAdmin().from("admin_audit_log").insert({ actor_id: admin.id, actor_email: admin.email, action, entity_kind: entityKind ?? null, entity_id: entityId ?? null, metadata });
  throwSupabaseError(error, "Unable to write the administration audit log");
}

async function requestJson(request: Request) {
  return readRequestJson(request, new URL(request.url).pathname.includes("/admin/") ? 4 * 1024 * 1024 : 64 * 1024);
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

  if ((route.startsWith("auth/") || route.startsWith("admin/")) && !isAdminClient(request)) {
    return json({ error: "Invalid administration request." }, 403);
  }
  if (method !== "GET" && (route.startsWith("auth/") || route.startsWith("admin/")) && !trustedMutation(request)) {
    return json({ error: "Untrusted request origin." }, 403);
  }

  if (!(await ensureDatabase())) return json({ error: "The Supabase data service is not configured." }, 503);

  const authResponse = await handleAuthRequest(request, route);
  if (authResponse) return authResponse;

  if (method === "GET" && route === "auth/me") {
    const admin = await adminFor(request);
    return admin ? json({ user: admin }) : json({ error: "Authentication required." }, 401, { "Set-Cookie": sessionCookie("", true) });
  }

  if (route.startsWith("admin/")) {
    const authorization = await requireAdminRequest(request);
    if (authorization.response) return authorization.response;
    const admin = authorization.admin as AdminIdentity;
    const supabase = getSupabaseAdmin();
    const securityResponse = await handleAdminSecurity(request, route, admin);
    if (securityResponse) return securityResponse;

    if (method === "GET" && route === "admin/backup") {
      const { data, error } = await supabase.from("content_records").select("kind,entity_id,payload,updated_at").order("kind");
      throwSupabaseError(error, "Unable to export content");
      return json({ schemaVersion: 1, exportedAt: new Date().toISOString(), records: data ?? [] });
    }
    if (method === "POST" && route === "admin/backup/validate") {
      const backup = z.object({ schemaVersion: z.literal(1), records: z.array(z.object({ kind: z.enum(CONTENT_KINDS), entity_id: entityIdSchema, payload: z.unknown() })).max(2000) }).safeParse(await requestJson(request));
      if (!backup.success) return json({ error: "صيغة النسخة غير صالحة." }, 400);
      const seen = new Set<string>();
      for (const record of backup.data.records) {
        const parsed = validateContentPayload(record.kind, record.payload);
        const key = `${record.kind}:${record.entity_id}`;
        if (!parsed.success || parsed.data.id !== record.entity_id || seen.has(key)) return json({ error: `راجع بيانات ${record.kind} / ${record.entity_id}.` }, 400);
        seen.add(key);
      }
      return json({ valid: true, records: backup.data.records.length });
    }

    if (method === "POST" && path[1] === "contacts" && path[3] === "notify") {
      if (!z.string().uuid().safeParse(path[2]).success) return json({ error: "Invalid message." }, 400);
      const limited = await requestLimit(request, "contact-notification", 10, 900);
      if (limited) return limited;
      const status = await notifyContact(path[2]);
      return status === "sent" ? json({ sent: true }) : json({ error: status === "disabled" ? "بريد التنبيهات غير مهيأ بعد." : "تعذّر إرسال التنبيه؛ الطلب ما زال محفوظًا." }, 503);
    }

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
      const params = new URL(request.url).searchParams;
      const page = Math.min(100000, Math.max(1, Math.floor(Number(params.get("page")) || 1)));
      const status = params.get("status");
      if (status && !["new", "read", "archived"].includes(status)) return json({ error: "Invalid status." }, 400);
      const limit = 20;
      const from = (page - 1) * limit;
      let query = supabase.from("contact_submissions").select("*", { count: "exact" }).order("created_at", { ascending: false }).order("id", { ascending: false });
      if (status) query = query.eq("status", status);
      const [{ data, error, count }, unread] = await Promise.all([
        query.range(from, from + limit - 1),
        supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      ]);
      throwSupabaseError(error, "Unable to read contact submissions");
      const total = count ?? 0;
      throwSupabaseError(unread.error, "Unable to count unread messages");
      return json({ items: ((data ?? []) as ContactRow[]).map(toContactItem), total, newCount: unread.count ?? 0, page, pages: Math.max(1, Math.ceil(total / limit)) });
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
    const limited = await requestLimit(request, "contact", 5, 900);
    if (limited) return limited;
    const parsed = contactSchema.safeParse(await requestJson(request));
    if (!parsed.success) return json({ error: "Please review the required contact fields." }, 400);
    const input = parsed.data;
    if (input.website) return json({ delivered: true }, 201);
    const { data, error } = await getSupabaseAdmin().from("contact_submissions").insert({ name: input.name, email: input.email.toLowerCase(), phone: input.phone || null, service: input.service, budget: input.budget || null, details: input.details, preferred_contact: input.preferredContact || null, locale: input.locale, page_path: input.pagePath }).select("id").single();
    throwSupabaseError(error, "Unable to save the contact submission");
    return json({ delivered: true, id: data?.id }, 201);
  }

  if (method === "POST" && route === "analytics") {
    if (!trustedMutation(request)) return json({ error: "Untrusted request origin." }, 403);
    if (request.headers.get("dnt") === "1") return empty();
    const parsed = analyticsSchema.safeParse(await requestJson(request));
    if (!parsed.success) return json({ error: "Invalid analytics event." }, 400);
    if (!serverConfig.analyticsSalt) return json({ error: "Analytics is not configured." }, 503);
    const userAgent = request.headers.get("user-agent") ?? "";
    if (isLikelyBot(userAgent)) return empty();
    const location = analyticsLocation(parsed.data.path, parsed.data.locale, parsed.data.referrer);
    if (!location) return empty();
    const limited = await requestLimit(request, "analytics", 120, 60);
    if (limited) return limited;
    const visitorHash = createHmac("sha256", serverConfig.analyticsSalt).update(parsed.data.visitorId).digest("hex");
    const { error } = await getSupabaseAdmin().from("page_views").insert({ visitor_hash: visitorHash, ...location, locale: parsed.data.locale, device: classifyDevice(userAgent) });
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
