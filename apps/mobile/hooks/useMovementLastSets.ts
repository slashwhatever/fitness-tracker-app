import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@fitness/shared";
import {
  useMovementLastSet as useMovementLastSetShared,
  useMovementLastSets as useMovementLastSetsShared,
} from "@fitness/shared";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Mobile wrapper for useMovementLastSets
 * Injects mobile-specific Supabase client and auth
 */
export function useMovementLastSets(
  movementIds: string[]
): UseQueryResult<
  Pick<
    Tables<"movement_last_sets">,
    "user_movement_id" | "last_set_date" | "total_sets"
  >[],
  Error
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useMovementLastSetsShared(movementIds, { user, supabase });
}

/**
 * Mobile wrapper for useMovementLastSet
 * Injects mobile-specific Supabase client and auth
 */
export function useMovementLastSet(
  movementId: string
): UseQueryResult<
  Pick<Tables<"movement_last_sets">, "last_set_date" | "total_sets"> | null,
  Error
> {
  const { user } = useAuth();
  const supabase = createClient();
  return useMovementLastSetShared(movementId, { user, supabase });
}
