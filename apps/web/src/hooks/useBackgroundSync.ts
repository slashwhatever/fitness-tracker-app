import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useBackgroundSync as useBackgroundSyncShared } from "@fitness/shared";

/**
 * Web wrapper for useBackgroundSync
 * Injects web-specific Supabase client and auth
 */
export function useBackgroundSync() {
  const { user } = useAuth();
  const supabase = createClient();
  return useBackgroundSyncShared({ user, supabase });
}
