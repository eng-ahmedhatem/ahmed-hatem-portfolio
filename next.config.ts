import type { NextConfig } from "next";

const supabaseUrl = process.env.SUPABASE_URL;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET ?? "portfolio-assets";
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl) : null;
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
    remotePatterns: supabaseOrigin
      ? [
          {
            protocol: supabaseOrigin.protocol.slice(0, -1) as "http" | "https",
            hostname: supabaseOrigin.hostname,
            port: supabaseOrigin.port,
            pathname: `/storage/v1/object/public/${storageBucket}/**`,
            search: "",
          },
        ]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
