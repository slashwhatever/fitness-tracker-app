import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },
  experimental: {
    // Optimize package imports to reduce bundle complexity and help HMR stability
    optimizePackageImports: [
      "@tanstack/react-query",
      "@tanstack/query-core",
      "@tanstack/react-query-devtools",
      "lucide-react",
    ],
  },
};

export default nextConfig;
