import { cookies } from "next/headers";

import { SESSION_COOKIE, verifySessionToken } from "@server/auth-core";
import { ensureBackendReady } from "@server/backend";

export async function hasValidAdminSession() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token || !(await ensureBackendReady())) return false;
    return Boolean(await verifySessionToken(token));
  } catch {
    return false;
  }
}
