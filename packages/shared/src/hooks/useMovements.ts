"use client";

import type { QueryData, SupabaseClient } from "@supabase/supabase-js";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "../lib/auth/AuthProvider";
import { createClient } from "../lib/supabase/client";
import type { Database } from "../lib/supabase/database.types";
import type { Tables, TablesInsert, TablesUpdate } from "../lib/supabase/types";
import { isSafeForQueries } from "../lib/utils/validation";
import type {
  MovementTemplate,
  TrackingTypeName,
  UserMovement,
} from "../models/types";

type UserMovementInsert = TablesInsert<"user_movements">;
type UserMovementUpdate = TablesUpdate<"user_movements">;
type WorkoutMovement = Tables<"workout_movements">;
type WorkoutMovementInsert = TablesInsert<"workout_movements">;

// Query keys
const movementKeys = {
  all: ["movements"] as const,
  templates: () => [...movementKeys.all, "templates"] as const,
  userMovements: () => [...movementKeys.all, "user"] as const,
  userMovementsList: (userId: string) =>
    [...movementKeys.userMovements(), userId] as const,
  userMovement: (id: string) => [...movementKeys.userMovements(), id] as const,
  workoutMovements: () => [...movementKeys.all, "workout"] as const,
  workoutMovementsList: (workoutId: string) =>
    [...movementKeys.workoutMovements(), workoutId] as const,
};

// Get all movement templates from database using QueryData for automatic type inference

export function useMovementTemplates(initialData?: MovementTemplate[]) {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.templates(),
    queryFn: async () => {
      // Optimized query: use simpler joins and let PostgREST handle the optimization
      const query = supabase
        .from("movement_templates")
        .select(
          `
          id,
          name,
          instructions,
          tags,
          experience_level,
          tracking_type_id,
          created_at,
          updated_at,
          tracking_types!inner(name),
          movement_template_muscle_groups!inner(
            muscle_groups!inner(name, display_name)
          )
        `
        )
        .order("name");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to include muscle_groups array and tracking_type
      return (data as QueryResult).map((template) => ({
        ...template,
        tracking_type:
          template.tracking_types?.name || ("weight" as TrackingTypeName),
        muscle_groups:
          template.movement_template_muscle_groups
            ?.map((mtmg) => mtmg.muscle_groups?.display_name)
            .filter((name): name is string => Boolean(name)) || [],
      })) as MovementTemplate[];
    },
    initialData,
    staleTime: 15 * 60 * 1000, // 15 minutes - templates rarely change
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get all user movements
export function useUserMovements() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.userMovementsList(user?.id || ""),
    queryFn: async () => {
      if (!user?.id) return [];

      // Optimized query: use simpler joins for better performance
      const query = supabase
        .from("user_movements")
        .select(
          `
          id,
          name,
          personal_notes,
          tags,
          experience_level,
          tracking_type_id,
          custom_rest_timer,
          last_used_at,
          manual_1rm,
          migrated_from_template,
          migration_date,
          original_template_id,
          template_id,
          user_id,
          created_at,
          updated_at,
          tracking_types!inner(name),
          user_movement_muscle_groups(
            muscle_groups(name, display_name)
          )
        `
        )
        .eq("user_id", user.id)
        .order("name");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to include muscle_groups array and tracking_type
      return (data as QueryResult).map((movement) => ({
        ...movement,
        tracking_type:
          movement.tracking_types?.name || ("weight" as TrackingTypeName),
        muscle_groups:
          movement.user_movement_muscle_groups
            ?.map((ummg) => ummg.muscle_groups?.display_name)
            .filter((name): name is string => Boolean(name)) || [],
      })) as UserMovement[];
    },
    enabled: !!user?.id,
    // User movements change occasionally - moderate caching
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get a single user movement
export function useUserMovement(
  movementId: string
): UseQueryResult<UserMovement, Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.userMovement(movementId),
    queryFn: async () => {
      const query = supabase
        .from("user_movements")
        .select(
          `
          id,
          name,
          personal_notes,
          tags,
          experience_level,
          tracking_type_id,
          custom_rest_timer,
          last_used_at,
          manual_1rm,
          migrated_from_template,
          migration_date,
          original_template_id,
          template_id,
          user_id,
          created_at,
          updated_at,
          tracking_types!inner(name),
          user_movement_muscle_groups(
            muscle_groups(name, display_name)
          )
        `
        )
        .eq("id", movementId)
        .single();

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to include muscle_groups array and tracking_type
      const transformedData = data as QueryResult;
      return {
        ...transformedData,
        tracking_type:
          transformedData.tracking_types?.name ||
          ("weight" as TrackingTypeName),
        muscle_groups:
          transformedData.user_movement_muscle_groups
            ?.map((ummg) => ummg.muscle_groups?.display_name)
            .filter((name): name is string => Boolean(name)) || [],
      } as UserMovement;
    },
    enabled: isSafeForQueries(movementId),
  });
}

// Get workout movements
export function useWorkoutMovements(workoutId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: movementKeys.workoutMovementsList(workoutId),
    queryFn: async () => {
      const query = supabase
        .from("workout_movements")
        .select(
          `
          id,
          workout_id,
          user_movement_id,
          order_index,
          created_at,
          workout_notes,
          user_movements!inner(
            id,
            name,
            personal_notes,
            tags,
            experience_level,
            tracking_type_id,
            custom_rest_timer,
            last_used_at,
            manual_1rm,
            migrated_from_template,
            migration_date,
            original_template_id,
            template_id,
            user_id,
            created_at,
            updated_at,
            tracking_types!inner(name),
            user_movement_muscle_groups(
              muscle_groups(name, display_name)
            )
          )
        `
        )
        .eq("workout_id", workoutId)
        .order("order_index");

      type QueryResult = QueryData<typeof query>;

      const { data, error } = await query;
      if (error) throw error;

      // Transform the data to include muscle_groups and tracking_type for user_movements
      return (data as QueryResult).map((workoutMovement) => ({
        ...workoutMovement,
        user_movement: workoutMovement.user_movements
          ? ({
              ...workoutMovement.user_movements,
              tracking_type:
                workoutMovement.user_movements.tracking_types?.name ||
                ("weight" as TrackingTypeName),
              muscle_groups:
                workoutMovement.user_movements.user_movement_muscle_groups
                  ?.map((ummg) => ummg.muscle_groups?.display_name)
                  .filter((name): name is string => Boolean(name)) || [],
            } as UserMovement)
          : null,
      }));
    },
    enabled: isSafeForQueries(workoutId),
  });
}

// Helper function to manage muscle group relationships
async function createMuscleGroupRelationships(
  supabase: SupabaseClient<Database>,
  userMovementId: string,
  muscleGroupDisplayNames: string[]
) {
  if (!muscleGroupDisplayNames.length) return;

  // First, get the muscle group IDs by display_name
  const { data: muscleGroups, error: mgError } = await supabase
    .from("muscle_groups")
    .select("id, name, display_name")
    .in("display_name", muscleGroupDisplayNames);

  if (mgError) throw mgError;

  // Create the junction table entries
  const relationships = muscleGroups.map((mg: { id: string }) => ({
    user_movement_id: userMovementId,
    muscle_group_id: mg.id,
  }));

  const { error: relError } = await supabase
    .from("user_movement_muscle_groups")
    .insert(relationships);

  if (relError) throw relError;
}

// Helper function to update muscle group relationships
async function updateMuscleGroupRelationships(
  supabase: SupabaseClient<Database>,
  userMovementId: string,
  muscleGroupDisplayNames: string[]
) {
  // First, delete existing relationships
  const { error: deleteError } = await supabase
    .from("user_movement_muscle_groups")
    .delete()
    .eq("user_movement_id", userMovementId);

  if (deleteError) throw deleteError;

  // Then create new ones
  if (muscleGroupDisplayNames.length > 0) {
    await createMuscleGroupRelationships(
      supabase,
      userMovementId,
      muscleGroupDisplayNames
    );
  }
}

// Create a new user movement
export function useCreateUserMovement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (
      movement: Omit<UserMovementInsert, "user_id"> & {
        muscle_groups: string[];
      }
    ) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { muscle_groups, ...movementData } = movement;

      // Don't send tracking_type to database, it only has tracking_type_id
      const { data, error } = await supabase
        .from("user_movements")
        .insert({
          ...movementData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create muscle group relationships
      await createMuscleGroupRelationships(supabase, data.id, muscle_groups);

      // Return the raw data first, then the queryClient will refetch with proper joins
      return data;
    },
    onMutate: async (newMovement) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.userMovementsList(user.id),
      });

      // Snapshot the previous value
      const previousUserMovements = queryClient.getQueryData(
        movementKeys.userMovementsList(user.id)
      );

      // Optimistically update to the new value
      const optimisticMovement = {
        id: `temp-${Date.now()}`,
        ...newMovement,
        user_id: user.id,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_used_at: null,
        manual_1rm: null,
      };

      queryClient.setQueryData(
        movementKeys.userMovementsList(user.id),
        (old: UserMovement[]) => [optimisticMovement, ...(old || [])]
      );

      return { previousUserMovements };
    },
    onError: (err, newMovement, context) => {
      // If the mutation fails, roll back
      if (user?.id) {
        queryClient.setQueryData(
          movementKeys.userMovementsList(user.id),
          context?.previousUserMovements
        );
      }
      console.error("Error creating user movement:", err);
    },
    onSuccess: (data) => {
      if (user?.id) {
        // Replace optimistic movement with real data from server
        queryClient.setQueryData(
          movementKeys.userMovementsList(user.id),
          (old: UserMovement[] | undefined) => {
            if (!old) return [data];
            return old.map((m) =>
              m.id.toString().startsWith("temp-") ? data : m
            );
          }
        );
        // Set individual movement cache
        queryClient.setQueryData(movementKeys.userMovement(data.id), data);
      }
    },
  });
}

// Update a user movement
export function useUpdateUserMovement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UserMovementUpdate & { muscle_groups?: string[] };
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { muscle_groups, ...movementUpdates } = updates;

      // Don't send tracking_type to database, it only has tracking_type_id
      const { data, error } = await supabase
        .from("user_movements")
        .update(movementUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update muscle group relationships if provided
      if (muscle_groups !== undefined) {
        await updateMuscleGroupRelationships(supabase, id, muscle_groups);
      }

      // Return the raw data first, then the queryClient will refetch with proper joins
      return data;
    },
    onMutate: async ({ id, updates }) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.userMovementsList(user.id),
      });
      await queryClient.cancelQueries({
        queryKey: movementKeys.userMovement(id),
      });
      // Cancel workout movements queries that might contain this user movement
      await queryClient.cancelQueries({
        queryKey: movementKeys.all,
        predicate: (query) => {
          return (
            query.queryKey.includes("workout") &&
            query.queryKey.includes("movement")
          );
        },
      });

      // Snapshot the previous values
      const previousUserMovements = queryClient.getQueryData(
        movementKeys.userMovementsList(user.id)
      );
      const previousMovement = queryClient.getQueryData(
        movementKeys.userMovement(id)
      );

      // Optimistically update the movement in the list
      queryClient.setQueryData(
        movementKeys.userMovementsList(user.id),
        (old: UserMovement[]) => {
          if (!old) return old;
          return old.map((movement: UserMovement) =>
            movement.id === id
              ? {
                  ...movement,
                  ...updates,
                  updated_at: new Date().toISOString(),
                }
              : movement
          );
        }
      );

      // Optimistically update the individual movement
      if (previousMovement) {
        queryClient.setQueryData(
          movementKeys.userMovement(id),
          (old: UserMovement) => ({
            ...old,
            ...updates,
            updated_at: new Date().toISOString(),
          })
        );
      }

      // Optimistically update workout movements that contain this user movement
      const workoutMovementQueries = queryClient.getQueriesData({
        queryKey: movementKeys.all,
        predicate: (query) => {
          return (
            query.queryKey.includes("workout") &&
            query.queryKey.includes("movement")
          );
        },
      });

      workoutMovementQueries.forEach(([queryKey, data]) => {
        if (Array.isArray(data)) {
          queryClient.setQueryData(
            queryKey,
            (
              old: Array<WorkoutMovement & { user_movement?: UserMovement }>
            ) => {
              return old.map(
                (
                  workoutMovement: WorkoutMovement & {
                    user_movement?: UserMovement;
                  }
                ) => {
                  if (workoutMovement.user_movement?.id === id) {
                    return {
                      ...workoutMovement,
                      user_movement: {
                        ...workoutMovement.user_movement,
                        ...updates,
                        updated_at: new Date().toISOString(),
                      },
                    };
                  }
                  return workoutMovement;
                }
              );
            }
          );
        }
      });

      return { previousUserMovements, previousMovement };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, roll back
      if (user?.id && context) {
        if (context.previousUserMovements) {
          queryClient.setQueryData(
            movementKeys.userMovementsList(user.id),
            context.previousUserMovements
          );
        }
        if (context.previousMovement) {
          queryClient.setQueryData(
            movementKeys.userMovement(id),
            context.previousMovement
          );
        }
      }
    },
    onSuccess: (data, { id }) => {
      if (user?.id) {
        // Update the user movements list cache
        queryClient.setQueryData(
          movementKeys.userMovementsList(user.id),
          (old: UserMovement[] | undefined) => {
            if (!old) return [data];
            return old.map((m) => (m.id === id ? data : m));
          }
        );
        // Update the individual movement cache
        queryClient.setQueryData(movementKeys.userMovement(id), data);

        // Only invalidate workout movements that use this user movement
        // This is necessary because workout movements include joined user movement data
        queryClient.invalidateQueries({
          queryKey: movementKeys.workoutMovements(),
        });
      }
    },
  });
}

// Add movement to workout
export function useAddMovementToWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (workoutMovement: WorkoutMovementInsert) => {
      const { data, error } = await supabase
        .from("workout_movements")
        .insert(workoutMovement)
        .select(
          `
          id,
          workout_id,
          user_movement_id,
          order_index,
          created_at,
          workout_notes,
          user_movements!inner(
            id,
            name,
            personal_notes,
            tags,
            experience_level,
            tracking_type_id,
            custom_rest_timer,
            last_used_at,
            manual_1rm,
            migrated_from_template,
            migration_date,
            original_template_id,
            template_id,
            user_id,
            created_at,
            updated_at,
            tracking_types!inner(name),
            user_movement_muscle_groups(
              muscle_groups(name, display_name)
            )
          )
        `
        )
        .single();

      if (error) throw error;
      return data as WorkoutMovement;
    },
    onMutate: async (newWorkoutMovement) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(
          newWorkoutMovement.workout_id
        ),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id)
      );

      // Try to get the user movement data from cache for optimistic display
      let userMovement = queryClient.getQueryData(
        movementKeys.userMovement(newWorkoutMovement.user_movement_id)
      ) as UserMovement | undefined;

      // If not in individual cache, search in the list cache
      if (!userMovement) {
        const allUserMovementsCaches = queryClient.getQueriesData({
          queryKey: movementKeys.userMovements(),
        });

        for (const [, data] of allUserMovementsCaches) {
          if (Array.isArray(data)) {
            userMovement = data.find(
              (m: UserMovement) => m.id === newWorkoutMovement.user_movement_id
            );
            if (userMovement) break;
          }
        }
      }

      // Optimistically update to the new value
      const optimisticMovement = {
        id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
        ...newWorkoutMovement,
        created_at: new Date().toISOString(),
        user_movement: userMovement || null, // Use cached data for immediate display
      };

      queryClient.setQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id),
        (old: WorkoutMovement[]) => {
          const sortedList = [...(old || []), optimisticMovement].sort(
            (a, b) => (a.order_index || 0) - (b.order_index || 0)
          );
          return sortedList;
        }
      );

      // Return a context object with the snapshotted value
      return { previousWorkoutMovements };
    },
    onError: (err, newWorkoutMovement, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(newWorkoutMovement.workout_id),
        context?.previousWorkoutMovements
      );
      console.error("Error adding movement to workout:", err);
    },
    onSuccess: (data, variables) => {
      // Invalidate the workout movements query so it refetches with proper data transformation
      queryClient.invalidateQueries({
        queryKey: movementKeys.workoutMovementsList(variables.workout_id),
      });

      // Invalidate workout movement counts so dashboard shows updated counts
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
    },
  });
}

// Add multiple movements to workout (batch operation)
export function useAddMovementsToWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutMovements,
    }: {
      workoutMovements: WorkoutMovementInsert[];
      userMovementsForOptimistic?: UserMovement[];
    }) => {
      if (!workoutMovements.length) return [];

      // Use a single insert query for all movements
      const { data, error } = await supabase
        .from("workout_movements")
        .insert(workoutMovements)
        .select(
          `
          id,
          workout_id,
          user_movement_id,
          order_index,
          created_at,
          workout_notes,
          user_movements!inner(
            id,
            name,
            personal_notes,
            tags,
            experience_level,
            tracking_type_id,
            custom_rest_timer,
            last_used_at,
            manual_1rm,
            migrated_from_template,
            migration_date,
            original_template_id,
            template_id,
            user_id,
            created_at,
            updated_at,
            tracking_types!inner(name),
            user_movement_muscle_groups(
              muscle_groups(name, display_name)
            )
          )
        `
        );

      if (error) throw error;
      return data as WorkoutMovement[];
    },
    onMutate: async ({
      workoutMovements: newWorkoutMovements,
      userMovementsForOptimistic,
    }) => {
      if (!newWorkoutMovements.length) return;

      const workoutId = newWorkoutMovements[0].workout_id;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      );

      // Create optimistic movements
      const optimisticMovements = newWorkoutMovements.map((movement, index) => {
        // Find corresponding user movement data for optimistic display
        const userMovement = userMovementsForOptimistic?.find(
          (um) => um.id === movement.user_movement_id
        );

        return {
          id: `temp-${Date.now()}-${index}`, // Unique temporary IDs
          ...movement,
          created_at: new Date().toISOString(),
          user_movement: userMovement || null, // Use actual data for proper display
        };
      });

      // Optimistically update with all new movements
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: WorkoutMovement[]) => {
          const combined = [...(old || []), ...optimisticMovements];
          return combined.sort(
            (a, b) => (a.order_index || 0) - (b.order_index || 0)
          );
        }
      );

      return { previousWorkoutMovements, workoutId };
    },
    onError: (err, _variables, context) => {
      // If the mutation fails, roll back
      if (context?.workoutId) {
        queryClient.setQueryData(
          movementKeys.workoutMovementsList(context.workoutId),
          context.previousWorkoutMovements
        );
      }
      console.error("Error adding movements to workout:", err);
    },
    onSuccess: (data, { workoutMovements }) => {
      if (workoutMovements.length > 0) {
        const workoutId = workoutMovements[0].workout_id;
        // Invalidate the workout movements query so it refetches with proper data transformation
        queryClient.invalidateQueries({
          queryKey: movementKeys.workoutMovementsList(workoutId),
        });
      }

      // Invalidate workout movement counts so dashboard shows updated counts
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
    },
  });
}

// Reorder movements in workout
export function useReorderWorkoutMovements() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      movements,
    }: {
      workoutId: string;
      movements: { id: string; order_index: number }[];
    }) => {
      // Simple direct updates now that unique constraint is removed
      const promises = movements.map(({ id, order_index }) =>
        supabase.from("workout_movements").update({ order_index }).eq("id", id)
      );

      const results = await Promise.all(promises);
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;

      return movements;
    },
    onMutate: async ({ workoutId, movements: reorderedMovements }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      ) as WorkoutMovement[] | undefined;

      if (previousWorkoutMovements) {
        // Create new order map
        const orderMap = new Map(
          reorderedMovements.map((m) => [m.id, m.order_index])
        );

        // Optimistically update with new order
        const reorderedList = [...previousWorkoutMovements]
          .map((movement) => ({
            ...movement,
            order_index: orderMap.get(movement.id) ?? movement.order_index ?? 0,
          }))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

        queryClient.setQueryData(
          movementKeys.workoutMovementsList(workoutId),
          reorderedList
        );
      }

      return { previousWorkoutMovements };
    },
    onError: (err, { workoutId }, context) => {
      // If the mutation fails, roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        context?.previousWorkoutMovements
      );
      console.error("Error reordering workout movements:", err);
    },
  });
}

// Remove movement from workout
export function useRemoveMovementFromWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      movementId,
    }: {
      workoutId: string;
      movementId: string;
    }) => {
      const { error } = await supabase
        .from("workout_movements")
        .delete()
        .eq("workout_id", workoutId)
        .eq("user_movement_id", movementId);

      if (error) throw error;
      return { workoutId, movementId };
    },
    onMutate: async ({ workoutId, movementId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      );

      // Optimistically remove the movement
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: WorkoutMovement[]) =>
          (old || []).filter((wm) => wm.user_movement_id !== movementId)
      );

      return { previousWorkoutMovements };
    },
    onError: (err, { workoutId }, context) => {
      // If the mutation fails, roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        context?.previousWorkoutMovements
      );
      console.error("Error removing movement from workout:", err);
    },
    onSuccess: () => {
      // Invalidate workout movement counts so dashboard shows updated counts
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
    },
  });
}

// Remove multiple movements from workout (batch operation)
export function useRemoveMovementsFromWorkout() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutId,
      movementIds,
    }: {
      workoutId: string;
      movementIds: string[];
    }) => {
      if (!movementIds.length) return { workoutId, movementIds };

      // Use a single delete query with IN clause for all movements
      const { error } = await supabase
        .from("workout_movements")
        .delete()
        .eq("workout_id", workoutId)
        .in("user_movement_id", movementIds);

      if (error) throw error;
      return { workoutId, movementIds };
    },
    onMutate: async ({ workoutId, movementIds }) => {
      if (!movementIds.length) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      );

      // Optimistically remove all specified movements
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: WorkoutMovement[]) =>
          (old || []).filter((wm) => !movementIds.includes(wm.user_movement_id))
      );

      return { previousWorkoutMovements };
    },
    onError: (err, { workoutId }, context) => {
      // If the mutation fails, roll back
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        context?.previousWorkoutMovements
      );
      console.error("Error removing movements from workout:", err);
    },
    onSuccess: () => {
      // Invalidate workout movement counts so dashboard shows updated counts
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
    },
  });
}

// Update workout-movement notes
export function useUpdateWorkoutMovementNotes() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutMovementId,
      workout_notes,
    }: {
      workoutMovementId: string;
      workout_notes: string | null;
    }) => {
      const { data, error } = await supabase
        .from("workout_movements")
        .update({ workout_notes })
        .eq("id", workoutMovementId)
        .select(
          `
          id,
          workout_id,
          user_movement_id,
          order_index,
          created_at,
          workout_notes,
          user_movements!inner(
            id,
            name,
            personal_notes,
            tags,
            experience_level,
            tracking_type_id,
            custom_rest_timer,
            last_used_at,
            manual_1rm,
            migrated_from_template,
            migration_date,
            original_template_id,
            template_id,
            user_id,
            created_at,
            updated_at,
            tracking_types!inner(name),
            user_movement_muscle_groups(
              muscle_groups(name, display_name)
            )
          )
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ workoutMovementId, workout_notes }) => {
      // Find the workout_id by checking all workout movements caches
      let workoutId: string | null = null;
      const caches = queryClient.getQueriesData({
        queryKey: movementKeys.workoutMovements(),
      });

      for (const [, data] of caches) {
        if (Array.isArray(data)) {
          const movement = (data as WorkoutMovement[]).find(
            (m) => m.id === workoutMovementId
          );
          if (movement) {
            workoutId = movement.workout_id;
            break;
          }
        }
      }

      if (!workoutId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData<
        WorkoutMovement[]
      >(movementKeys.workoutMovementsList(workoutId));

      // Optimistically update the notes
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: WorkoutMovement[] | undefined) => {
          if (!old) return old;
          return old.map((m) =>
            m.id === workoutMovementId ? { ...m, workout_notes } : m
          );
        }
      );

      return { previousWorkoutMovements, workoutId };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, roll back
      if (context?.workoutId && context?.previousWorkoutMovements) {
        queryClient.setQueryData(
          movementKeys.workoutMovementsList(context.workoutId),
          context.previousWorkoutMovements
        );
      }
      console.error("Error updating workout movement notes:", err);
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(data.workout_id),
        (old: WorkoutMovement[] | undefined) => {
          if (!old) return [data];
          return old.map((m) => (m.id === data.id ? data : m));
        }
      );
    },
  });
}

// Delete a movement from a workout
export function useDeleteWorkoutMovement() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({
      workoutMovementId,
      workoutId,
    }: {
      workoutMovementId: string;
      workoutId: string;
    }) => {
      const { error } = await supabase
        .from("workout_movements")
        .delete()
        .eq("id", workoutMovementId);

      if (error) throw error;
      return { workoutMovementId, workoutId };
    },
    onMutate: async ({ workoutMovementId, workoutId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });

      // Snapshot the previous value
      const previousWorkoutMovements = queryClient.getQueryData(
        movementKeys.workoutMovementsList(workoutId)
      );

      // Optimistically remove the item
      queryClient.setQueryData(
        movementKeys.workoutMovementsList(workoutId),
        (old: any[]) => {
          if (!old) return [];
          return old.filter((movement) => movement.id !== workoutMovementId);
        }
      );

      return { previousWorkoutMovements };
    },
    onError: (err, { workoutId }, context) => {
      // If the mutation fails, roll back
      if (context?.previousWorkoutMovements) {
        queryClient.setQueryData(
          movementKeys.workoutMovementsList(workoutId),
          context.previousWorkoutMovements
        );
      }
      console.error("Error deleting workout movement:", err);
    },
    onSuccess: ({ workoutId }) => {
      queryClient.invalidateQueries({
        queryKey: movementKeys.workoutMovementsList(workoutId),
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-movement-counts"],
      });
    },
  });
}
