import { createHmac } from "node:crypto";
import { serverConfig } from "./config";
import { getSupabaseAdmin } from "./supabase";

export function requestAddress(request: Request) {
  // Vercel overwrites this platform header; do not prefer arbitrary client headers.
  return (process.env.VERCEL ? request.headers.get("x-vercel-forwarded-for") : request.headers.get("x-forwarded-for"))?.split(",")[0]?.trim() || "unknown";
}

export async function consumeLimit(scope: string, identifier: string, limit: number, windowSeconds: number) {
  const secret = serverConfig.analyticsSalt ?? serverConfig.sessionSecret;
  if (!secret) return { allowed: false, unavailable: true, retryAfter: 60 };
  const key = createHmac("sha256", secret).update(`${scope}:${identifier}`).digest("hex");
  const { data, error } = await getSupabaseAdmin().rpc("portfolio_consume_limit", { p_key: key, p_limit: limit, p_window_seconds: windowSeconds });
  if (error || !data || typeof data.allowed !== "boolean") {
    console.error("Shared request protection unavailable.", error?.code ?? "invalid-response");
    return { allowed: false, unavailable: true, retryAfter: 60 };
  }
  return { allowed: data.allowed as boolean, unavailable: false, retryAfter: Number(data.retryAfter) || 60 };
}

export async function requestLimit(request: Request, scope: string, limit: number, seconds: number) {
  const result = await consumeLimit(scope, requestAddress(request), limit, seconds);
  if (result.allowed) return null;
  return Response.json({ error: result.unavailable ? "خدمة الحماية غير جاهزة. حاول لاحقًا." : "طلبات كثيرة. انتظر قليلًا ثم حاول مجددًا." }, {
    status: result.unavailable ? 503 : 429,
    headers: { "Cache-Control": "no-store", "Retry-After": String(result.retryAfter) },
  });
}
