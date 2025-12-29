import type { QueryData } from "@supabase/supabase-js";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../types/database.types";
import type { HookDependencies } from "./types";

type WorkoutGroup = Tables<"workout_groups">;
type WorkoutGroupInsert = TablesInsert<"workout_groups">;
type WorkoutGroupUpdate = TablesUpdate<"workout_groups">;

export const groupKeys = {
  all: ["workout-groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (userId: string) => [...groupKeys.lists(), userId] as const,
};

/**
 * Hook for managing workout groups
 * @param deps - Platform-specific dependencies (Supabase client, user)
 */
export function useWorkoutGroups(deps: HookDependencies): {
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
  const { user, supabase } = deps;
  const queryClient = useQueryClient();

  // Query for fetching groups
  const query = useQuery({
    queryKey: groupKeys.list(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      const dbQuery = supabase
        .from("workout_groups")
        .select(
          `
          *,
          workouts:workouts(count)
        `
        )
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      type QueryResult = QueryData<typeof dbQuery>;

      const { data, error } = await dbQuery;
      if (error) throw error;

      // Transform data to include workout_count
      return (
        (data as QueryResult)?.map((group) => ({
          ...group,
          workout_count: group.workouts?.[0]?.count ?? 0,
        })) ?? []
      );
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Create Group
  const createGroup = useMutation({
    mutationFn: async (name: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get max sort order
      const { data: existing } = await supabase
        .from("workout_groups")
        .select("sort_order")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const maxOrder = existing?.[0]?.sort_order ?? -1;

      const newGroup: WorkoutGroupInsert = {
        user_id: user.id,
        name,
        sort_order: maxOrder + 1,
      };

      const { data, error } = await supabase
        .from("workout_groups")
        .insert(newGroup)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.list(user?.id || ""),
      });
    },
  });

  // Update Group
  const updateGroup = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: WorkoutGroupUpdate;
    }) => {
      const { data, error } = await supabase
        .from("workout_groups")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.list(user?.id || ""),
      });
    },
  });

  // Delete Group
  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workout_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.list(user?.id || ""),
      });
      // Also invalidate workouts list as they might be updated (group_id set to null)
      queryClient.invalidateQueries({
        queryKey: ["workouts", "list", user?.id || ""],
      });
    },
  });

  return {
    groups: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    createGroup,
    updateGroup,
    deleteGroup,
  };
}
