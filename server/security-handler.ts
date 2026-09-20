import { createHash, randomUUID } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { z } from "zod";
import type { User, Session } from "@supabase/supabase-js";
import { createSessionToken, isActiveAdministrator, SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionToken, type AdminIdentity } from "./auth-core";
import { serverConfig } from "./config";
import { createSupabaseAuthClient, getSupabaseAdmin } from "./supabase";
import { requestLimit } from "./rate-limit";
import { mailReady, sendMail } from "./mail";
import { readRequestJson } from "./request-body";

const STEP_COOKIE = serverConfig.production ? "__Host-portfolio_admin_step" : "portfolio_admin_step";
const credentials = z.object({ email: z.string().trim().email().max(320), password: z.string().min(1).max(256) });
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });
const passwordSchema = z.string().min(12).max(128);
const jweKey = () => createHash("sha256").update(`portfolio-step:${serverConfig.sessionSecret}`).digest();
const answer = (body: unknown, status = 200, cookie?: string) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) } });

export function authCookie(name: string, value: string, ttl: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Priority=High; Max-Age=${ttl}${serverConfig.production ? "; Secure" : ""}`;
}
export function readAuthCookie(request: Request, name: string) {
  try { return decodeURIComponent(request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? ""); } catch { return ""; }
}
function identity(user: User, mfaVerified = false): AdminIdentity | null {
  if (!user.email || !isActiveAdministrator(user)) return null;
  return { id: user.id, email: user.email, displayName: String(user.user_metadata.display_name || "Ahmed Hatem"), mfaVerified, sessionVersion: String(user.app_metadata.session_version ?? "initial") };
}
const body = readRequestJson;
async function stepCookie(session: Session, user: User, factorId: string, purpose: "login" | "enroll") {
  const token = await new EncryptJWT({ access: session.access_token, refresh: session.refresh_token, factor: factorId, version: user.app_metadata.session_version ?? "initial" })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" }).setSubject(user.id).setAudience(purpose).setIssuedAt().setExpirationTime("5m").encrypt(jweKey());
  return authCookie(STEP_COOKIE, token, 300);
}
async function openStep(request: Request, purpose: "login" | "enroll") {
  try {
    const { payload } = await jwtDecrypt(readAuthCookie(request, STEP_COOKIE), jweKey(), { audience: purpose, keyManagementAlgorithms: ["dir"], contentEncryptionAlgorithms: ["A256GCM"] });
    if (typeof payload.access !== "string" || typeof payload.refresh !== "string" || typeof payload.factor !== "string") return null;
    const client = createSupabaseAuthClient();
    const result = await client.auth.setSession({ access_token: payload.access, refresh_token: payload.refresh });
    if (result.error) return null;
    const { data, error } = await client.auth.getUser();
    if (error || !data.user || data.user.id !== payload.sub || !identity(data.user) || (data.user.app_metadata.session_version ?? "initial") !== payload.version) return null;
    return { client, user: data.user, factorId: payload.factor };
  } catch { return null; }
}
async function completeLogin(user: User, mfa: boolean) {
  const admin = identity(user, mfa);
  if (!admin) return answer({ error: "غير مصرح بالدخول." }, 401);
  const audit = await getSupabaseAdmin().from("admin_audit_log").insert({ actor_id: admin.id, actor_email: admin.email, action: "auth.login", entity_kind: "admin-user", entity_id: admin.id, metadata: { mfa } });
  if (audit.error) return answer({ error: "تعذّر إنشاء جلسة آمنة." }, 503);
  const response = answer({ user: { email: admin.email, displayName: admin.displayName } }, 200, authCookie(SESSION_COOKIE, await createSessionToken(admin), SESSION_TTL_SECONDS));
  response.headers.append("Set-Cookie", authCookie(STEP_COOKIE, "", 0));
  return response;
}

export async function handleAuthRequest(request: Request, route: string): Promise<Response | null> {
  if (request.method !== "POST") return null;
  if (!["auth/login", "auth/mfa", "auth/recovery", "auth/reset", "auth/logout"].includes(route)) return null;
  const limited = route === "auth/logout" ? null : await requestLimit(request, route, route === "auth/recovery" ? 3 : 8, route === "auth/recovery" ? 3600 : 900);
  if (limited) return limited;

  if (route === "auth/logout") {
    const admin = await verifySessionToken(readAuthCookie(request, SESSION_COOKIE));
    if (admin) {
      const current = await getSupabaseAdmin().auth.admin.getUserById(admin.id);
      if (current.error || !current.data.user) return answer({ error: "تعذّر إلغاء الجلسات. حاول مجددًا." }, 503);
      const revoked = await getSupabaseAdmin().auth.admin.updateUserById(admin.id, { app_metadata: { ...current.data.user.app_metadata, session_version: randomUUID() } });
      if (revoked.error) return answer({ error: "تعذّر إلغاء الجلسات. حاول مجددًا." }, 503);
    }
    const response = answer({ signedOut: true }, 200, authCookie(SESSION_COOKIE, "", 0));
    response.headers.append("Set-Cookie", authCookie(STEP_COOKIE, "", 0));
    return response;
  }
  if (route === "auth/login") {
    const input = credentials.safeParse(await body(request));
    if (!input.success) return answer({ error: "راجع بيانات الدخول." }, 400);
    const started = Date.now();
    const client = createSupabaseAuthClient();
    const { data, error } = await client.auth.signInWithPassword({ email: input.data.email.toLowerCase(), password: input.data.password });
    if (error || !data.user || !data.session || !identity(data.user)) {
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, 350 - (Date.now() - started))));
      return answer({ error: "البريد أو كلمة المرور غير صحيحة." }, 401);
    }
    const factor = data.user.factors?.find((item) => item.status === "verified" && item.factor_type === "totp");
    if (factor) return answer({ mfaRequired: true }, 200, await stepCookie(data.session, data.user, factor.id, "login"));
    if (data.user.factors?.some((item) => item.status === "verified")) return answer({ error: "وسيلة التحقق المسجلة غير مدعومة هنا. راجع إعدادات حسابك." }, 403);
    return completeLogin(data.user, false);
  }
  if (route === "auth/mfa") {
    const input = codeSchema.safeParse(await body(request));
    const step = await openStep(request, "login");
    if (!input.success || !step) return answer({ error: "انتهت محاولة الدخول. سجّل الدخول مجددًا." }, 401);
    const result = await step.client.auth.mfa.challengeAndVerify({ factorId: step.factorId, code: input.data.code });
    if (result.error) return answer({ error: "رمز التحقق غير صحيح أو انتهت صلاحيته." }, 401);
    const current = await step.client.auth.getUser();
    if (current.error || !current.data.user) return answer({ error: "تعذّر التحقق من الحساب." }, 401);
    return completeLogin(current.data.user, true);
  }
  if (route === "auth/recovery") {
    if (!mailReady()) return answer({ error: "استعادة الدخول بالبريد غير مفعّلة بعد. يلزم إعداد بريد الإرسال من إعدادات الاستضافة." }, 503);
    const input = z.object({ email: z.string().trim().email().max(320) }).safeParse(await body(request));
    if (!input.success) return answer({ error: "أدخل بريدًا صحيحًا." }, 400);
    const email = input.data.email.toLowerCase();
    if (email === serverConfig.adminEmail) {
      const { data, error } = await getSupabaseAdmin().auth.admin.generateLink({ type: "recovery", email });
      if (!error && data.user && identity(data.user)) {
        // Fragment never enters server access logs. Supabase verifies this single-use token.
        const url = `${serverConfig.appOrigin}/admin/recover#token_hash=${encodeURIComponent(data.properties.hashed_token)}`;
        try { await sendMail(email, "استعادة دخول لوحة الموقع", `لإعادة تعيين كلمة المرور افتح الرابط التالي:\n${url}\n\nإذا لم تطلب ذلك فتجاهل الرسالة.`, `recovery-${randomUUID()}`); }
        catch { return answer({ error: "تعذّر إرسال البريد. حاول لاحقًا." }, 503); }
      }
    }
    return answer({ sent: true });
  }
  const input = z.object({ tokenHash: z.string().min(20).max(512), password: passwordSchema }).safeParse(await body(request));
  if (!input.success) return answer({ error: "الرابط غير صالح، أو كلمة المرور أقل من 12 حرفًا." }, 400);
  const client = createSupabaseAuthClient();
  const { data, error } = await client.auth.verifyOtp({ token_hash: input.data.tokenHash, type: "recovery" });
  if (error || !data.user || !identity(data.user)) return answer({ error: "الرابط مستخدم أو منتهي. اطلب رابطًا جديدًا." }, 401);
  const reset = await getSupabaseAdmin().auth.admin.updateUserById(data.user.id, { password: input.data.password, app_metadata: { ...data.user.app_metadata, session_version: randomUUID() } });
  if (reset.error) return answer({ error: "تعذّر تغيير كلمة المرور. اطلب رابطًا جديدًا وحاول مجددًا." }, 400);
  await client.auth.signOut({ scope: "global" });
  return answer({ reset: true }, 200, authCookie(SESSION_COOKIE, "", 0));
}

export async function handleAdminSecurity(request: Request, route: string, admin: AdminIdentity): Promise<Response | null> {
  if (route === "admin/security" && request.method === "GET") {
    const [user, protection] = await Promise.all([
      getSupabaseAdmin().auth.admin.getUserById(admin.id),
      getSupabaseAdmin().from("request_limits").select("key_hash", { head: true }).limit(1),
    ]);
    if (user.error) return answer({ error: "تعذّر قراءة حالة الأمان." }, 503);
    return answer({ mfaEnabled: Boolean(user.data.user?.factors?.some((factor) => factor.status === "verified")), sharedProtection: !protection.error, emailReady: mailReady(), siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "", origin: serverConfig.appOrigin });
  }
  if (route === "admin/security/mfa/enroll" && request.method === "POST") {
    const limited = await requestLimit(request, "mfa-enroll", 5, 900);
    if (limited) return limited;
    const input = z.object({ password: z.string().min(1).max(256) }).safeParse(await body(request));
    if (!input.success) return answer({ error: "أدخل كلمة المرور الحالية." }, 400);
    const client = createSupabaseAuthClient();
    const { data, error } = await client.auth.signInWithPassword({ email: admin.email, password: input.data.password });
    if (error || !data.user || !data.session || data.user.id !== admin.id) return answer({ error: "كلمة المرور غير صحيحة." }, 401);
    if (data.user.factors?.some((factor) => factor.status === "verified")) return answer({ error: "التحقق بخطوتين مفعّل بالفعل." }, 409);
    // Abandoned, unverified enrollments are not authentication credentials.
    for (const factor of data.user.factors ?? []) {
      if (factor.status === "unverified") await client.auth.mfa.unenroll({ factorId: factor.id });
    }
    const enrollment = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Portfolio administrator", issuer: "Ahmed Hatem Portfolio" });
    if (enrollment.error || enrollment.data.type !== "totp") return answer({ error: "تعذّر إعداد التحقق بخطوتين." }, 503);
    return answer({ qr: enrollment.data.totp.qr_code, secret: enrollment.data.totp.secret }, 200, await stepCookie(data.session, data.user, enrollment.data.id, "enroll"));
  }
  if (route === "admin/security/mfa/confirm" && request.method === "POST") {
    const limited = await requestLimit(request, "mfa-confirm", 8, 900);
    if (limited) return limited;
    const input = codeSchema.safeParse(await body(request));
    const step = await openStep(request, "enroll");
    if (!input.success || !step || step.user.id !== admin.id) return answer({ error: "أعد بدء الإعداد ثم أدخل رمز التطبيق." }, 400);
    const verified = await step.client.auth.mfa.challengeAndVerify({ factorId: step.factorId, code: input.data.code });
    if (verified.error) return answer({ error: "رمز التحقق غير صحيح." }, 400);
    const { data, error } = await getSupabaseAdmin().auth.admin.updateUserById(admin.id, { app_metadata: { ...step.user.app_metadata, session_version: randomUUID() } });
    if (error || !data.user) return answer({ error: "تم التفعيل. سجّل الدخول مجددًا باستخدام الرمز." }, 401);
    return completeLogin(data.user, true);
  }
  return null;
}
