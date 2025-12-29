import type { QueryData } from "@supabase/supabase-js";
import {
  UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { Tables, TablesUpdate } from "../types/database.types";
import type { HookDependencies } from "./types";

type UserProfileUpdate = TablesUpdate<"user_profiles">;

// Query keys
const profileKeys = {
  all: ["user_profiles"] as const,
  profile: (userId: string) => [...profileKeys.all, userId] as const,
};

/**
 * Get user profile
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useUserProfile(
  deps: HookDependencies
): UseQueryResult<Tables<"user_profiles"> | null, Error> {
  const { user, supabase } = deps;

  return useQuery({
    queryKey: profileKeys.profile(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return null;

      const query = supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) {
        // If profile doesn't exist, this is unexpected since triggers should create it
        if (error.code === "PGRST116") {
          console.warn(
            "User profile missing - this should not happen with database triggers. User ID:",
            user.id
          );
          return null;
        }
        throw error;
      }
      return data as QueryResult;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes - profile data doesn't change often
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
  });
}

/**
 * Update user profile
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useUpdateUserProfile(
  deps: HookDependencies
): UseMutationResult<Tables<"user_profiles">, Error, UserProfileUpdate> {
  const { user, supabase } = deps;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UserProfileUpdate) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (user?.id) {
        queryClient.setQueryData(profileKeys.profile(user.id), data);
      }
    },
  });
}
