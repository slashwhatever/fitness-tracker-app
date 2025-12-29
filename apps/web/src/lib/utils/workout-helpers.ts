import type { TablesInsert } from "@fitness/shared";

type WorkoutMovementInsert = TablesInsert<"workout_movements">;

/**
 * Prepares multiple movements to be added to a workout with sequential order indexes
 * @param workoutId - The workout to add movements to
 * @param userMovementIds - Array of user movement IDs to add
 * @param startingOrderIndex - Starting order index (defaults to 0)
 * @returns Array of workout movement inserts ready for batch operation
 */
export function prepareWorkoutMovements(
  workoutId: string,
  userMovementIds: string[],
  startingOrderIndex: number = 0
): WorkoutMovementInsert[] {
  return userMovementIds.map((userMovementId, index) => ({
    workout_id: workoutId,
    user_movement_id: userMovementId,
    order_index: startingOrderIndex + index,
  }));
}

/**
 * Calculates the next order index for a workout based on existing movements
 * @param existingMovements - Current workout movements
 * @returns Next available order index
 */
export function getNextOrderIndex(
  existingMovements: { order_index: number }[]
): number {
  if (!existingMovements.length) return 0;

  const maxIndex = Math.max(
    ...existingMovements.map((m) => m.order_index || 0)
  );
  return maxIndex + 1;
}
