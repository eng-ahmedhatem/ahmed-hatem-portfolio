import { Readable } from "node:stream";
import { Router } from "express";
import { handleCmsRequest } from "./cms-handler";
import { serverConfig } from "./config";
import { notifyContact } from "./mail";

// Compatibility adapter: every API entry point uses the same authorization,
// distributed limits, content validation and MFA rules.
const router = Router();
router.use(async (request, response, next) => {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined && !["host", "content-length", "x-forwarded-for", "x-vercel-forwarded-for"].includes(key)) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    headers.set("x-forwarded-for", request.ip ?? "unknown");
    const method = request.method.toUpperCase();
    const init: RequestInit & { duplex?: "half" } = { method, headers };
    if (!["GET", "HEAD"].includes(method)) {
      init.body = request.is("application/json")
        ? JSON.stringify(request.body ?? {})
        : Readable.toWeb(request) as ReadableStream<Uint8Array>;
      init.duplex = "half";
    }
    const url = new URL(request.url, serverConfig.appOrigin);
    const result = await handleCmsRequest(new Request(url, init), url.pathname.split("/").filter(Boolean));
    response.status(result.status);
    result.headers.forEach((value, key) => { if (key !== "set-cookie") response.setHeader(key, value); });
    const cookies = result.headers.getSetCookie();
    if (cookies.length) response.setHeader("Set-Cookie", cookies);
    let contactId: string | undefined;
    if (result.ok && method === "POST" && url.pathname === "/contact") contactId = (await result.clone().json() as { id?: string }).id;
    response.send(Buffer.from(await result.arrayBuffer()));
    if (contactId) await notifyContact(contactId);
  } catch (error) { next(error); }
});
export const apiRouter = router;
