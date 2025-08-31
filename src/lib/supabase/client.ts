import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

// Re-export Database type for other files that import it from here
export type { Database } from "./database.types";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

// Build-time check - this will show if env vars are missing during build
if (!supabaseUrl || !supabasePublishableKey) {
  console.error("Missing Supabase environment variables at build time:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabasePublishableKey,
    urlLength: supabaseUrl?.length || 0,
    keyLength: supabasePublishableKey?.length || 0,
  });
}

// Client-side Supabase client (will be null if env vars are missing)
export const supabaseClient =
  supabaseUrl && supabasePublishableKey
    ? createClient<Database>(supabaseUrl, supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
        global: {
          headers: {
            "X-Client-Info": "fitness-tracking-app@1.0.0",
          },
        },
      })
    : null;

// Server-side client for Netlify Functions
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabaseServerClient =
  supabaseUrl && serviceRoleKey
    ? createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Client component client (for App Router)
export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}

// Helper function to check if we're on the client side
export const isClient = typeof window !== "undefined";
