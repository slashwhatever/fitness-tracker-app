import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useWorkoutGroups as useWorkoutGroupsShared } from "@fitness/shared";

/**
 * Web wrapper for useWorkoutGroups
 * Injects web-specific Supabase client and auth
 */
export function useWorkoutGroups() {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutGroupsShared({ user, supabase });
}
