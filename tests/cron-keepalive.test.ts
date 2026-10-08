import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  handleSupabaseKeepalive,
  isAuthorizedCronRequest,
} from "../server/cron-keepalive";

const secret = "isolated-test-cron-secret";
const originalFetch = globalThis.fetch;
let requests = 0;

before(() => {
  globalThis.fetch = async (input) => {
    const url = String(input);
    assert.match(url, /\/rest\/v1\/content_records/);
    requests += 1;
    return Response.json([]);
  };
});

after(() => {
  globalThis.fetch = originalFetch;
});

test("cron authorization accepts only the configured bearer secret", () => {
  const valid = new Request("http://localhost/api/cron/supabase-keepalive", {
    headers: { authorization: `Bearer ${secret}` },
  });
  const invalid = new Request("http://localhost/api/cron/supabase-keepalive", {
    headers: { authorization: "Bearer wrong-secret" },
  });

  assert.equal(isAuthorizedCronRequest(valid, secret), true);
  assert.equal(isAuthorizedCronRequest(invalid, secret), false);
  assert.equal(isAuthorizedCronRequest(valid, ""), false);
});

test("keepalive rejects unauthorized requests without contacting Supabase", async () => {
  requests = 0;
  const response = await handleSupabaseKeepalive(
    new Request("http://localhost/api/cron/supabase-keepalive"),
    secret,
  );

  assert.equal(response.status, 401);
  assert.equal(requests, 0);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("authorized keepalive performs one read-only Supabase request", async () => {
  requests = 0;
  const response = await handleSupabaseKeepalive(
    new Request("http://localhost/api/cron/supabase-keepalive", {
      headers: { authorization: `Bearer ${secret}` },
    }),
    secret,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(requests, 1);
});
