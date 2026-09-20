import { handleCmsRequest } from "@server/cms-handler";
import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { notifyContact } from "@server/mail";

import { CONTENT_SNAPSHOT_CACHE_TAG } from "@/data/content-cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CmsContext = { params: Promise<{ path: string[] }> };

type SavedRecord = {
  kind?: string;
  payload?: {
    key?: string;
    translations?: Partial<Record<"ar" | "en", { slug?: string }>>;
  };
};

function revalidateContentRoutes(kind: string | undefined, record?: SavedRecord) {
  revalidateTag(CONTENT_SNAPSHOT_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");

  for (const locale of ["ar", "en"] as const) {
    revalidatePath(`/${locale}`);
    if (kind === "project") revalidatePath(`/${locale}/work`);
    if (kind === "post" || kind === "category") revalidatePath(`/${locale}/blog`);

    const slug = record?.payload?.translations?.[locale]?.slug;
    if (kind === "project" && slug) revalidatePath(`/${locale}/work/${slug}`);
    if (kind === "post" && slug) revalidatePath(`/${locale}/blog/${slug}`);
    if (kind === "category" && slug) revalidatePath(`/${locale}/blog/category/${slug}`);
    if (kind === "static-page" && record?.payload?.key) {
      revalidatePath(`/${locale}/${record.payload.key}`);
    }
  }
}

async function dispatch(request: Request, context: CmsContext) {
  try {
    const { path } = await context.params;
    const response = await handleCmsRequest(request, path);
    if (response.ok && request.method === "POST" && path.join("/") === "contact") {
      const body = await response.clone().json() as { id?: string };
      if (body.id) after(async () => { await notifyContact(body.id!); });
    }
    if (
      response.ok
      && ["PUT", "DELETE"].includes(request.method)
      && path[0] === "admin"
      && path[1] === "content"
    ) {
      let savedRecord: SavedRecord | undefined;
      if (request.method === "PUT") {
        const body = (await response.clone().json().catch(() => null)) as { record?: SavedRecord } | null;
        savedRecord = body?.record;
      }
      revalidateContentRoutes(path[2], savedRecord);
    }
    return response;
  } catch (error) {
    console.error("CMS route failed.", error);
    return Response.json(
      { error: "Unexpected server error." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = dispatch;
export const POST = dispatch;
export const PUT = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
