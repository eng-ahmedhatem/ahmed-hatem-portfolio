/** Bound streamed JSON before parsing; Content-Length is not trusted. */
export async function readRequestJson(request: Request, limit = 64 * 1024): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json") || !request.body) return {};
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      size += result.value.byteLength;
      if (size > limit) { await reader.cancel(); return {}; }
      chunks.push(result.value);
    }
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  } catch { return {}; }
  finally { reader.releaseLock(); }
}
