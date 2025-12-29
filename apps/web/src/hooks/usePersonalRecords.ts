import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { usePersonalRecordsByMovement as usePersonalRecordsByMovementShared } from "@fitness/shared";

/**
 * Web wrapper for usePersonalRecordsByMovement
 * Injects web-specific Supabase client and auth
 */
export function usePersonalRecordsByMovement(movementId: string) {
  const { user } = useAuth();
  const supabase = createClient();
  return usePersonalRecordsByMovementShared(movementId, { user, supabase });
}
