import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
    SUPABASE_ANON_TOKEN: process.env.SUPABASE_ANON_TOKEN,
  },
};

export default nextConfig;
