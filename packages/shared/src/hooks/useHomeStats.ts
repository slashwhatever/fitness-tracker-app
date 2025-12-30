import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { HookDependencies } from "./types";

export type HomeStats = {
  weekly_volume: number;
  weekly_volume_change: number;
  recent_activity: {
    name: string;
    workout_id: string;
    last_activity_date: string;
    exercise_count: number;
    session_volume: number;
  }[];
};

export function useHomeStats(
  deps: HookDependencies
): UseQueryResult<HomeStats | null, Error> {
  const { user, supabase } = deps;

  return useQuery({
    queryKey: ["home_stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.rpc("get_home_stats");

      if (error) throw error;

      return data as HomeStats;
    },
    enabled: !!user?.id,
  });
}
