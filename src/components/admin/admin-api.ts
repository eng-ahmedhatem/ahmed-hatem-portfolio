export type ContentKind = "site-settings" | "homepage" | "static-page" | "project" | "post" | "category" | "testimonial";

export interface AdminContentRecord {
  _id?: string;
  kind: ContentKind;
  entityId: string;
  payload: Record<string, unknown>;
  updatedAt?: string;
}

export class AdminRequestError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "AdminRequestError"; }
}

export async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/cms${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      "X-Portfolio-Admin": "1",
      ...init?.headers,
    },
    credentials: "same-origin",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new AdminRequestError(body?.error ?? `Request failed (${response.status}).`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function uploadAdminImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  return adminRequest<{ asset: { id: string; src: string; mimeType: string } }>("/admin/assets", {
    method: "POST",
    body,
  });
}
