import { handleCmsRequest } from "@server/cms-handler";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CmsContext = { params: Promise<{ path: string[] }> };

async function dispatch(request: Request, context: CmsContext) {
  try {
    const { path } = await context.params;
    const response = await handleCmsRequest(request, path);
    if (
      response.ok
      && ["PUT", "DELETE"].includes(request.method)
      && path[0] === "admin"
      && path[1] === "content"
    ) {
      revalidatePath("/", "layout");
      revalidatePath("/sitemap.xml");
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
