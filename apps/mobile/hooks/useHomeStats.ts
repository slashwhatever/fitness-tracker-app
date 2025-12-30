import { useAuth } from "@/lib/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { HomeStats, useHomeStats as useHomeStatsShared } from "@fitness/shared";
import { UseQueryResult } from "@tanstack/react-query";

export function useHomeStats(): UseQueryResult<HomeStats | null, Error> {
  const { user } = useAuth();
  const supabase = createClient();
  return useHomeStatsShared({ user, supabase });
}
