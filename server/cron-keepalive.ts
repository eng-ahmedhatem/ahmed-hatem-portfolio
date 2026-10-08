import { createHash, timingSafeEqual } from "node:crypto";
import { serverConfig } from "./config";
import { getSupabaseAdmin } from "./supabase";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

function secureEqual(actual: string, expected: string) {
  const actualDigest = createHash("sha256").update(actual).digest();
  const expectedDigest = createHash("sha256").update(expected).digest();

  return timingSafeEqual(actualDigest, expectedDigest);
}

export function isAuthorizedCronRequest(request: Request, secret = serverConfig.cronSecret) {
  if (!secret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  return secureEqual(authorization, `Bearer ${secret}`);
}

export async function handleSupabaseKeepalive(
  request: Request,
  secret = serverConfig.cronSecret,
) {
  if (!secret) {
    return Response.json(
      { ok: false, error: "Cron is not configured." },
      { status: 503, headers: responseHeaders },
    );
  }

  if (!isAuthorizedCronRequest(request, secret)) {
    return Response.json(
      { ok: false, error: "Unauthorized." },
      { status: 401, headers: responseHeaders },
    );
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("content_records")
      .select("entity_id")
      .limit(1);

    if (error) {
      console.error("Supabase keepalive query failed.", error.message);
      return Response.json(
        { ok: false, error: "Keepalive query failed." },
        { status: 503, headers: responseHeaders },
      );
    }

    return Response.json({ ok: true }, { headers: responseHeaders });
  } catch (error) {
    console.error(
      "Supabase keepalive request failed.",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json(
      { ok: false, error: "Keepalive request failed." },
      { status: 503, headers: responseHeaders },
    );
  }
}
