import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createSessionToken, verifySessionToken, SESSION_COOKIE, isActiveAdministrator } from "../server/auth-core";
import { connectSupabase } from "../server/supabase";
import { handleCmsRequest } from "../server/cms-handler";
import { handleAuthRequest } from "../server/security-handler";
import { readRequestJson } from "../server/request-body";
import { analyticsLocation } from "../server/analytics-event";
import { requestLimit } from "../server/rate-limit";

const originalFetch = globalThis.fetch;
const user = { id: "4dbe116e-a690-40a4-86d7-daa351d6d0c6", email: "owner@portfolio.example", app_metadata: { role: "admin", session_version: "v1" }, user_metadata: { display_name: "Test owner" }, factors: [] as { id: string; status: string; factor_type: string }[] };
let limitAvailable = true;
let limitAllowed = true;
before(async () => {
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("/rest/v1/content_records")) return Response.json([]);
    if (url.includes("/rest/v1/rpc/portfolio_consume_limit")) return limitAvailable ? Response.json({ allowed: limitAllowed, retryAfter: 37 }) : Response.json({ code: "PGRST202", message: "Test RPC unavailable" }, { status: 404 });
    if (url.includes("/auth/v1/admin/users/")) return Response.json(user);
    if (url.includes("/auth/v1/token")) return Response.json({ user, access_token: "test-access", refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600 });
    throw new Error(`Unexpected test network request: ${new URL(url).pathname}`);
  };
  await connectSupabase();
});
after(() => { globalThis.fetch = originalFetch; });

test("admin requests reject absent client header and cross-site origins before DB operations", async () => {
  const absent = await handleCmsRequest(new Request("http://localhost:3000/api/cms/admin/content"), ["admin", "content"]);
  assert.equal(absent.status, 403);
  const crossSite = await handleCmsRequest(new Request("http://localhost:3000/api/cms/auth/login", { method: "POST", headers: { "X-Portfolio-Admin": "1", Origin: "https://attacker.invalid", "Sec-Fetch-Site": "cross-site" } }), ["auth", "login"]);
  assert.equal(crossSite.status, 403);
});

test("session requires current admin role, session version, valid signature and MFA", async () => {
  const token = await createSessionToken({ id: user.id, email: user.email, displayName: "Test owner", sessionVersion: "v1" });
  assert.ok(await verifySessionToken(token));
  assert.equal(await verifySessionToken(`${token}tampered`), null);
  user.app_metadata.session_version = "v2";
  assert.equal(await verifySessionToken(token), null);
  user.app_metadata.session_version = "v1";
  user.app_metadata.role = "viewer";
  assert.equal(await verifySessionToken(token), null);
  user.app_metadata.role = "admin";
  user.factors = [{ id: "totp-1", factor_type: "totp", status: "verified" }];
  assert.equal(await verifySessionToken(token), null);
  const mfaToken = await createSessionToken({ id: user.id, email: user.email, displayName: "Test owner", sessionVersion: "v1", mfaVerified: true });
  assert.ok(await verifySessionToken(mfaToken));
  user.factors = [];
});

test("password alone never issues an admin session when MFA is enrolled", async () => {
  user.factors = [{ id: "totp-1", factor_type: "totp", status: "verified" }];
  const response = await handleAuthRequest(new Request("http://localhost:3000/api/cms/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, password: "test-password" }) }), "auth/login");
  assert.equal(response?.status, 200);
  assert.equal((await response?.json()).mfaRequired, true);
  assert.equal(response?.headers.getSetCookie().some((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`)), false);
  assert.match(response!.headers.get("set-cookie")!, /HttpOnly.*SameSite=Strict/);
  user.factors = [];
});

test("distributed protection enforces Retry-After and fails closed when unavailable", async () => {
  const request = new Request("http://localhost:3000");
  limitAllowed = false;
  let response = await requestLimit(request, "test", 5, 60);
  assert.equal(response?.status, 429);
  assert.equal(response?.headers.get("retry-after"), "37");
  limitAvailable = false;
  response = await requestLimit(request, "test", 5, 60);
  assert.equal(response?.status, 503);
  limitAvailable = true; limitAllowed = true;
});

test("JSON parser rejects oversized, malformed and non-object bodies", async () => {
  const request = (body: string) => new Request("http://localhost", { method: "POST", headers: { "Content-Type": "application/json" }, body });
  assert.deepEqual(await readRequestJson(request('{"name":"ok"}')), { name: "ok" });
  assert.deepEqual(await readRequestJson(request('{"name":"too big"}'), 4), {});
  assert.deepEqual(await readRequestJson(request("null")), {});
  assert.deepEqual(await readRequestJson(request("broken")), {});
});

test("analytics excludes private paths and strips URL tracking/PII", () => {
  assert.equal(analyticsLocation("/admin", "ar"), null);
  assert.equal(analyticsLocation("/preview/ar/project/private", "ar"), null);
  assert.equal(analyticsLocation("/en/../../admin", "en"), null);
  assert.equal(analyticsLocation("/en/blog", "ar"), null);
  assert.deepEqual(analyticsLocation("/ar/work?email=private#secret", "ar", "https://search.example/query?token=private"), { path: "/ar/work", referrer: "https://search.example" });
});

test("banned administrators cannot use existing sessions", () => {
  assert.equal(isActiveAdministrator({ app_metadata: { role: "admin" }, banned_until: "2099-01-01T00:00:00Z" }), false);
  assert.equal(isActiveAdministrator({ app_metadata: { role: "admin" }, banned_until: "2020-01-01T00:00:00Z" }), true);
});
