const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? LOCAL_SITE_URL;

  try {
    return new URL(configuredUrl);
  } catch {
    return new URL(LOCAL_SITE_URL);
  }
}

export function absoluteUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl).toString();
  } catch {
    return new URL(pathOrUrl, getSiteUrl()).toString();
  }
}
