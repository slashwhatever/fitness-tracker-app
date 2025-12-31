import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  useCreateSet as useCreateSetShared,
  useDeleteSet as useDeleteSetShared,
  useSetsByMovement as useSetsByMovementShared,
  useSetsByWorkout as useSetsByWorkoutShared,
  useSetsCountByMovement as useSetsCountByMovementShared,
  useSets as useSetsShared,
  useUpdateSet as useUpdateSetShared,
  type SetInsert,
  type SetUpdate,
  type SetWithMovement,
} from "@fitness/shared";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

/**
 * Mobile wrapper for useSets
 * Injects mobile-specific Supabase client and auth
 */
export function useSets(): UseQueryResult<SetWithMovement[], Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsShared({ user, supabase });
}

/**
 * Mobile wrapper for useSetsCountByMovement
 * Injects mobile-specific Supabase client and auth
 */
export function useSetsCountByMovement(
  movementId: string
): UseQueryResult<number, Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsCountByMovementShared(movementId, { user, supabase });
}

/**
 * Mobile wrapper for useSetsByMovement
 * Injects mobile-specific Supabase client and auth
 */
export function useSetsByMovement(
  movementId: string
): UseQueryResult<SetWithMovement[], Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsByMovementShared(movementId, { user, supabase });
}

/**
 * Mobile wrapper for useSetsByWorkout
 * Injects mobile-specific Supabase client and auth
 */
export function useSetsByWorkout(
  workoutId: string
): UseQueryResult<SetWithMovement[], Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useSetsByWorkoutShared(workoutId, { user, supabase });
}

/**
 * Mobile wrapper for useCreateSet
 * Injects mobile-specific Supabase client and auth
 */
export function useCreateSet(): UseMutationResult<
  SetWithMovement,
  Error,
  Omit<SetInsert, "user_id">
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useCreateSetShared({ user, supabase });
}

/**
 * Mobile wrapper for useUpdateSet
 * Injects mobile-specific Supabase client and auth
 */
export function useUpdateSet(): UseMutationResult<
  SetWithMovement,
  Error,
  { id: string; updates: SetUpdate }
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useUpdateSetShared({ user, supabase });
}

/**
 * Mobile wrapper for useDeleteSet
 * Injects mobile-specific Supabase client and auth
 */
export function useDeleteSet(): UseMutationResult<
  {
    setId: string;
    setData: { user_movement_id: string; workout_id: string | null } | null;
    contextMovementId?: string;
  },
  Error,
  string | { id: string; user_movement_id?: string }
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useDeleteSetShared({ user, supabase });
}
