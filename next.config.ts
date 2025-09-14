import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  },
  eslint: {
    // Only lint production code during build, exclude stories and mocks
    dirs: ['src/app', 'src/components', 'src/lib', 'src/hooks', 'src/queries', 'src/services', 'src/utils', 'src/models', 'src/contexts'],
    // Ignore linting entirely during builds to focus on TypeScript errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
