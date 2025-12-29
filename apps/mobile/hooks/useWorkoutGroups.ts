import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@fitness/shared";
import { useWorkoutGroups as useWorkoutGroupsShared } from "@fitness/shared";
import type { UseMutationResult } from "@tanstack/react-query";

type WorkoutGroup = Tables<"workout_groups">;
type WorkoutGroupUpdate = TablesUpdate<"workout_groups">;

/**
 * Mobile wrapper for useWorkoutGroups
 * Injects mobile-specific Supabase client and auth
 */
export function useWorkoutGroups(): {
  groups: WorkoutGroup[];
  loading: boolean;
  error: Error | null;
  createGroup: UseMutationResult<WorkoutGroup, Error, string>;
  updateGroup: UseMutationResult<
    WorkoutGroup,
    Error,
    { id: string; updates: WorkoutGroupUpdate }
  >;
  deleteGroup: UseMutationResult<void, Error, string>;
} {
  const { user } = useAuth();
  const supabase = createClient();
  return useWorkoutGroupsShared({ user, supabase });
}
