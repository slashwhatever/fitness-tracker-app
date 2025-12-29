import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useUpdateUserProfile as useUpdateUserProfileShared,
  useUserProfile as useUserProfileShared,
} from "@fitness/shared";

/**
 * Web wrapper for useUserProfile
 * Injects web-specific Supabase client and auth
 */
export function useUserProfile() {
  const { user } = useAuth();
  const supabase = createClient();
  return useUserProfileShared({ user, supabase });
}

/**
 * Web wrapper for useUpdateUserProfile
 * Injects web-specific Supabase client and auth
 */
export function useUpdateUserProfile() {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateUserProfileShared({ user, supabase });
}
