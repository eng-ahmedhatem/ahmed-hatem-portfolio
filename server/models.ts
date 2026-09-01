export const CONTENT_KINDS = [
  "site-settings",
  "homepage",
  "static-page",
  "project",
  "post",
  "category",
] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];

export interface ContentRecord {
  id: string;
  kind: ContentKind;
  entityId: string;
  payload: Record<string, unknown>;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget?: string;
  details: string;
  preferredContact?: string;
  locale: "ar" | "en";
  pagePath: string;
  status: "new" | "read" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface PageView {
  id: string;
  visitorHash: string;
  path: string;
  locale: "ar" | "en";
  device: "mobile" | "tablet" | "desktop";
  referrer?: string;
  createdAt: string;
}
