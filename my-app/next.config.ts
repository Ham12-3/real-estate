import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "filcusojgmnyqtvydbna.supabase.co"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      }
    ]
  }
};

export default nextConfig;
