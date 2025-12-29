import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useUpdateUserProfile as useUpdateUserProfileShared,
  useUserProfile as useUserProfileShared,
  type Tables,
  type TablesUpdate,
} from "@fitness/shared";
import {
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

/**
 * Mobile wrapper for useUserProfile
 * Injects mobile-specific Supabase client and auth
 */
export function useUserProfile(): UseQueryResult<
  Tables<"user_profiles"> | null,
  Error
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useUserProfileShared({ user, supabase });
}

/**
 * Mobile wrapper for useUpdateUserProfile
 * Injects mobile-specific Supabase client and auth
 */
export function useUpdateUserProfile(): UseMutationResult<
  Tables<"user_profiles">,
  Error,
  TablesUpdate<"user_profiles">
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateUserProfileShared({ user, supabase });
}
