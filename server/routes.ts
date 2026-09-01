import { createHmac, randomUUID } from "node:crypto";

import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { z } from "zod";

import {
  clearSessionCookie,
  createSessionToken,
  requireAdmin,
  requireTrustedOrigin,
  setSessionCookie,
  verifyCredentials,
  type AdminRequest,
} from "./auth";
import { hasAuthConfiguration, serverConfig } from "./config";
import { getBundledSnapshot, getPublicSnapshot, validateContentPayload } from "./content";
import { CONTENT_KINDS, type ContentKind } from "./models";
import { getAssetBucketName, getSupabaseAdmin, isDatabaseReady } from "./supabase";

const router = Router();
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});
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

interface AnalyticsSummary {
  views: number;
  uniqueVisitors: number;
  byDevice: { _id: string; value: number }[];
  byDay: { _id: string; value: number }[];
  topPages: { _id: string; value: number }[];
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

function databaseGuard(_request: Request, response: Response, next: NextFunction) {
  if (!isDatabaseReady()) {
    response.status(503).json({ error: "The Supabase data service is not configured." });
    return;
  }
  next();
}

function requireAdminClientHeader(request: Request, response: Response, next: NextFunction) {
  if (request.get("x-portfolio-admin") !== "1") {
    response.status(403).json({ error: "Invalid administration request." });
    return;
  }
  next();
}

function rateLimitKey(request: { ip?: string }) {
  return request.ip ?? "unknown";
}

function canAttemptLogin(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 15 * 60_000 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return {
    allowed: current.count <= 8,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1_000)),
  };
}

function classifyDevice(userAgent: string) {
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) return "tablet" as const;
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile" as const;
  return "desktop" as const;
}

function throwSupabaseError(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

async function writeAudit(
  actor: { id?: string; email?: string } | undefined,
  action: string,
  entityKind?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await getSupabaseAdmin().from("admin_audit_log").insert({
    actor_id: actor?.id ?? null,
    actor_email: actor?.email ?? null,
    action,
    entity_kind: entityKind ?? null,
    entity_id: entityId ?? null,
    metadata,
  });
  throwSupabaseError(error, "Unable to write the administration audit log");
}

function detectedImageMimeType(buffer: Buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp" && /^(avif|avis)$/.test(buffer.toString("ascii", 8, 12))) return "image/avif";
  return null;
}

function toContentRecord(row: ContentRow) {
  return {
    _id: row.id,
    kind: row.kind,
    entityId: row.entity_id,
    payload: row.payload,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toContactItem(row: ContactRow) {
  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    service: row.service,
    budget: row.budget ?? undefined,
    details: row.details,
    preferredContact: row.preferred_contact ?? undefined,
    locale: row.locale,
    pagePath: row.page_path,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/health", (_request, response) => {
  response.json({
    ok: true,
    provider: "supabase",
    database: isDatabaseReady(),
    administration: hasAuthConfiguration(),
  });
});

router.use("/auth", (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

router.use("/admin", (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});

router.use("/admin", requireAdminClientHeader);

router.get("/public/snapshot", async (_request, response) => {
  if (!isDatabaseReady()) {
    response.set("Cache-Control", "no-store");
    response.set("X-Content-Source", "bundled-fallback");
    response.json(getBundledSnapshot());
    return;
  }
  try {
    response.set("Cache-Control", "public, max-age=30, stale-while-revalidate=120");
    response.set("X-Content-Source", "supabase");
    response.json(await getPublicSnapshot());
  } catch (error) {
    console.error("Supabase content read failed; returning bundled content.", error);
    response.set("Cache-Control", "no-store");
    response.set("X-Content-Source", "bundled-fallback");
    response.json(getBundledSnapshot());
  }
});

router.post("/auth/login", requireAdminClientHeader, requireTrustedOrigin, databaseGuard, async (request, response) => {
  const key = rateLimitKey(request);
  const attempt = canAttemptLogin(key);
  if (!attempt.allowed) {
    response.set("Retry-After", String(attempt.retryAfter));
    response.status(429).json({ error: "Too many sign-in attempts. Try again later." });
    return;
  }
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid sign-in details." });
    return;
  }
  const verificationStartedAt = Date.now();
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    const remainingDelay = Math.max(0, 350 - (Date.now() - verificationStartedAt));
    if (remainingDelay) await new Promise((resolve) => setTimeout(resolve, remainingDelay));
    response.status(401).json({ error: "Email or password is incorrect." });
    return;
  }
  loginAttempts.delete(key);
  setSessionCookie(response, await createSessionToken(user));
  await writeAudit(user, "auth.login", "admin-user", user.id);
  response.json({ user: { email: user.email, displayName: user.displayName } });
});

router.post("/auth/logout", requireAdminClientHeader, requireTrustedOrigin, (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});

router.get("/auth/me", requireAdmin, (request: AdminRequest, response) => {
  response.json({ user: request.admin });
});

router.get("/admin/content", requireAdmin, async (request, response) => {
  const kind = typeof request.query.kind === "string" ? request.query.kind : undefined;
  if (kind && !CONTENT_KINDS.includes(kind as ContentKind)) {
    response.status(400).json({ error: "Unknown content kind." });
    return;
  }
  let query = getSupabaseAdmin()
    .from("content_records")
    .select("*")
    .order("kind", { ascending: true })
    .order("updated_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  throwSupabaseError(error, "Unable to read content records");
  response.json({ records: ((data ?? []) as ContentRow[]).map(toContentRecord) });
});

router.get("/admin/activity", requireAdmin, async (_request, response) => {
  const { data, error } = await getSupabaseAdmin()
    .from("admin_audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  throwSupabaseError(error, "Unable to read administration activity");
  response.json({
    items: ((data ?? []) as AuditRow[]).map((item) => ({
      id: item.id,
      actorEmail: item.actor_email,
      action: item.action,
      entityKind: item.entity_kind,
      entityId: item.entity_id,
      metadata: item.metadata,
      createdAt: item.created_at,
    })),
  });
});

router.put("/admin/content/:kind/:entityId", requireTrustedOrigin, requireAdmin, async (request: AdminRequest, response) => {
  const kind = Array.isArray(request.params.kind) ? request.params.kind[0] : request.params.kind;
  if (!CONTENT_KINDS.includes(kind as ContentKind)) {
    response.status(400).json({ error: "Unknown content kind." });
    return;
  }
  const entityId = entityIdSchema.safeParse(request.params.entityId);
  const parsed = validateContentPayload(kind as ContentKind, request.body?.payload);
  const version = z.string().datetime({ offset: true }).optional().safeParse(request.body?.version);
  if (!entityId.success || !version.success) {
    response.status(400).json({ error: "Content identifier or version is invalid." });
    return;
  }
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    response.status(400).json({ error: `راجع الحقل ${issue.path.join(".") || "المحتوى"}: ${issue.message}` });
    return;
  }
  if (parsed.data.id !== entityId.data) {
    response.status(400).json({ error: "Content payload and identifier do not match." });
    return;
  }
  const payload = { ...parsed.data };
  if ("updatedAt" in payload) payload.updatedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (["project", "post", "category"].includes(kind)) {
    const translations = payload.translations as Record<string, { slug?: unknown }> | undefined;
    const localizedSlugs = [translations?.ar?.slug, translations?.en?.slug]
      .filter((slug): slug is string => typeof slug === "string");
    const { data: peers, error: peerError } = await supabase
      .from("content_records")
      .select("entity_id,payload")
      .eq("kind", kind)
      .neq("entity_id", entityId.data);
    throwSupabaseError(peerError, "Unable to verify localized slugs");
    const collision = (peers ?? []).find((peer) => {
      const peerTranslations = (peer.payload as Record<string, unknown>)?.translations as Record<string, { slug?: unknown }> | undefined;
      return [peerTranslations?.ar?.slug, peerTranslations?.en?.slug]
        .some((slug) => typeof slug === "string" && localizedSlugs.includes(slug));
    });
    if (collision) {
      response.status(409).json({ error: "الرابط المختصر مستخدم في محتوى آخر. اختر رابطًا مختلفًا لكل لغة." });
      return;
    }
  }

  const { data: existing, error: existingError } = await supabase
    .from("content_records")
    .select("id,updated_at")
    .eq("kind", kind)
    .eq("entity_id", entityId.data)
    .maybeSingle();
  throwSupabaseError(existingError, "Unable to inspect the content record");
  if (existing && version.data && existing.updated_at !== version.data) {
    response.status(409).json({ error: "This content changed in another session. Reload it before saving." });
    return;
  }

  const mutation = existing
    ? supabase
        .from("content_records")
        .update({ payload, updated_by: request.admin?.email ?? null })
        .eq("id", existing.id)
        .eq("updated_at", version.data ?? existing.updated_at)
    : supabase
        .from("content_records")
        .insert({ kind, entity_id: entityId.data, payload, updated_by: request.admin?.email ?? null });
  const { data, error } = await mutation.select("*").maybeSingle();
  throwSupabaseError(error, "Unable to save the content record");
  if (!data) {
    response.status(409).json({ error: "This content changed while you were editing. Reload it before saving." });
    return;
  }
  await writeAudit(
    request.admin,
    existing ? "content.update" : "content.create",
    kind,
    entityId.data,
  );
  response.json({ record: toContentRecord(data as ContentRow) });
});

router.delete("/admin/content/:kind/:entityId", requireTrustedOrigin, requireAdmin, async (request: AdminRequest, response) => {
  const kind = Array.isArray(request.params.kind) ? request.params.kind[0] : request.params.kind;
  if (!CONTENT_KINDS.includes(kind as ContentKind) || kind === "site-settings" || kind === "homepage") {
    response.status(400).json({ error: "This content cannot be deleted." });
    return;
  }
  const entityId = entityIdSchema.safeParse(request.params.entityId);
  if (!entityId.success) {
    response.status(400).json({ error: "Invalid content identifier." });
    return;
  }
  const { error } = await getSupabaseAdmin()
    .from("content_records")
    .delete()
    .eq("kind", kind)
    .eq("entity_id", entityId.data);
  throwSupabaseError(error, "Unable to delete the content record");
  await writeAudit(request.admin, "content.delete", kind, entityId.data);
  response.status(204).end();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (allowed.includes(file.mimetype)) callback(null, true);
    else callback(new Error("Unsupported image format."));
  },
});

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

router.post("/admin/assets", requireTrustedOrigin, requireAdmin, upload.single("file"), async (request: AdminRequest, response) => {
  if (!request.file) {
    response.status(400).json({ error: "Select a JPG, PNG, WebP, or AVIF image." });
    return;
  }
  const detectedMimeType = detectedImageMimeType(request.file.buffer);
  if (!detectedMimeType || detectedMimeType !== request.file.mimetype) {
    response.status(400).json({ error: "The uploaded file content does not match its image format." });
    return;
  }
  const assetId = randomUUID();
  const objectPath = `${assetId}.${extensionByMimeType[request.file.mimetype]}`;
  const storage = getSupabaseAdmin().storage.from(getAssetBucketName());
  const { error } = await storage.upload(objectPath, request.file.buffer, {
    contentType: request.file.mimetype,
    cacheControl: "31536000",
    upsert: false,
  });
  throwSupabaseError(error, "Unable to upload the asset");
  await writeAudit(request.admin, "asset.upload", "asset", assetId, {
    mimeType: detectedMimeType,
    size: request.file.size,
  });
  const { data } = storage.getPublicUrl(objectPath);
  response.status(201).json({
    asset: { id: assetId, src: data.publicUrl, mimeType: request.file.mimetype },
  });
});

router.get("/assets/:assetId", databaseGuard, async (request, response) => {
  const parsed = assetIdSchema.safeParse(request.params.assetId);
  if (!parsed.success) {
    response.status(404).end();
    return;
  }
  const storage = getSupabaseAdmin().storage.from(getAssetBucketName());
  const candidates = Object.values(extensionByMimeType).map((extension) => `${parsed.data}.${extension}`);
  for (const objectPath of candidates) {
    const { data, error } = await storage.download(objectPath);
    if (!error && data) {
      response.type(data.type || "application/octet-stream");
      response.set("Cache-Control", "public, max-age=31536000, immutable");
      response.send(Buffer.from(await data.arrayBuffer()));
      return;
    }
  }
  response.status(404).end();
});

router.post("/contact", requireTrustedOrigin, databaseGuard, async (request, response) => {
  const parsed = contactSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Please review the required contact fields." });
    return;
  }
  const input = parsed.data;
  const { data, error } = await getSupabaseAdmin()
    .from("contact_submissions")
    .insert({
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone || null,
      service: input.service,
      budget: input.budget || null,
      details: input.details,
      preferred_contact: input.preferredContact || null,
      locale: input.locale,
      page_path: input.pagePath,
    })
    .select("id")
    .single();
  throwSupabaseError(error, "Unable to save the contact submission");
  response.status(201).json({ delivered: true, id: data?.id });
});

router.get("/admin/contacts", requireAdmin, async (request, response) => {
  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = 20;
  const from = (page - 1) * limit;
  const { data, error, count } = await getSupabaseAdmin()
    .from("contact_submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);
  throwSupabaseError(error, "Unable to read contact submissions");
  const total = count ?? 0;
  response.json({
    items: ((data ?? []) as ContactRow[]).map(toContactItem),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.patch("/admin/contacts/:id", requireTrustedOrigin, requireAdmin, async (request, response) => {
  const status = z.object({ status: z.enum(["new", "read", "archived"]) }).safeParse(request.body);
  const id = z.string().uuid().safeParse(request.params.id);
  if (!status.success || !id.success) {
    response.status(400).json({ error: "Invalid message update." });
    return;
  }
  const { data, error } = await getSupabaseAdmin()
    .from("contact_submissions")
    .update({ status: status.data.status })
    .eq("id", id.data)
    .select("*")
    .single();
  throwSupabaseError(error, "Unable to update the contact submission");
  await writeAudit((request as AdminRequest).admin, "contact.update", "contact", id.data, {
    status: status.data.status,
  });
  response.json({ item: toContactItem(data as ContactRow) });
});

router.post("/analytics", requireTrustedOrigin, databaseGuard, async (request, response) => {
  const parsed = analyticsSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "Invalid analytics event." });
    return;
  }
  const salt = serverConfig.analyticsSalt;
  if (!salt) {
    response.status(503).json({ error: "Analytics is not configured." });
    return;
  }
  const visitorHash = createHmac("sha256", salt).update(parsed.data.visitorId).digest("hex");
  const { error } = await getSupabaseAdmin().from("page_views").insert({
    visitor_hash: visitorHash,
    path: parsed.data.path,
    locale: parsed.data.locale,
    referrer: parsed.data.referrer || null,
    device: classifyDevice(request.get("user-agent") ?? ""),
  });
  throwSupabaseError(error, "Unable to record the analytics event");
  response.status(204).end();
});

router.get("/admin/analytics", requireAdmin, async (request, response) => {
  const requestedDays = Math.max(7, Math.min(90, Number(request.query.days) || 30));
  const from = new Date(Date.now() - requestedDays * 86_400_000);
  const { data, error } = await getSupabaseAdmin().rpc("portfolio_analytics_summary", {
    p_from: from.toISOString(),
  });
  throwSupabaseError(error, "Unable to calculate analytics");
  const summary = data as AnalyticsSummary;
  response.json({ rangeDays: requestedDays, ...summary });
});

export const apiRouter = router;
