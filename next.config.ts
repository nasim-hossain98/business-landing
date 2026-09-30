import type { NextConfig } from "next";

/**
 * The Supabase Storage host for admin-uploaded product images. Resolved from
 * the public project URL at build time; when Supabase is not configured the
 * list is empty and everything stays local.
 */
function supabaseHost(): string[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    return [new URL(url).hostname];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // One lockfile above the project root predates this repo; keep Turbopack
  // scoped to the app so builds stay reproducible.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      ...supabaseHost().map((hostname) => ({
        protocol: "https" as const,
        hostname,
        pathname: "/storage/v1/object/public/**",
      })),
      // Common placeholder/demo hosts so catalogue entries that still point
      // at stock photography render before every image lives in Storage.
      { protocol: "https" as const, hostname: "picsum.photos" },
      { protocol: "https" as const, hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
