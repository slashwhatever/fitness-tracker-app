/**
 * EXAMPLE: How to use the batch add/remove movements hooks
 *
 * This shows how to replace multiple individual API calls with single batch operations
 */

import {
  useAddMovementsToWorkout,
  useRemoveMovementsFromWorkout,
  useWorkoutMovements,
} from "@/hooks";
import {
  getNextOrderIndex,
  prepareWorkoutMovements,
} from "@/lib/utils/workout-helpers";

interface BatchMovementsProps {
  workoutId: string;
  selectedMovementIds: string[];
  movementIdsToRemove: string[];
}

export function BatchMovementsExample({
  workoutId,
  selectedMovementIds,
  movementIdsToRemove,
}: BatchMovementsProps) {
  const addMovementsBatch = useAddMovementsToWorkout();
  const removeMovementsBatch = useRemoveMovementsFromWorkout();
  const { data: existingMovements = [] } = useWorkoutMovements(workoutId);

  const handleAddMovements = async () => {
    if (!selectedMovementIds.length) return;

    // Calculate starting order index based on existing movements
    const startingIndex = getNextOrderIndex(existingMovements);

    // Prepare all movements for batch insert
    const workoutMovements = prepareWorkoutMovements(
      workoutId,
      selectedMovementIds,
      startingIndex
    );

    try {
      // Single API call instead of multiple!
      await addMovementsBatch.mutateAsync({ workoutMovements });
      console.log(
        `Successfully added ${selectedMovementIds.length} movements in one batch`
      );
    } catch (error) {
      console.error("Failed to add movements:", error);
    }
  };

  const handleRemoveMovements = async () => {
    if (!movementIdsToRemove.length) return;

    try {
      // Single DELETE with IN clause instead of multiple deletes!
      await removeMovementsBatch.mutateAsync({
        workoutId,
        movementIds: movementIdsToRemove,
      });
      console.log(
        `Successfully removed ${movementIdsToRemove.length} movements in one batch`
      );
    } catch (error) {
      console.error("Failed to remove movements:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add movements */}
      <button
        onClick={handleAddMovements}
        disabled={addMovementsBatch.isPending || !selectedMovementIds.length}
      >
        {addMovementsBatch.isPending
          ? `Adding ${selectedMovementIds.length} movements...`
          : `Add ${selectedMovementIds.length} movements`}
      </button>

      {/* Remove movements */}
      <button
        onClick={handleRemoveMovements}
        disabled={removeMovementsBatch.isPending || !movementIdsToRemove.length}
        className="bg-red-600 text-white"
      >
        {removeMovementsBatch.isPending
          ? `Removing ${movementIdsToRemove.length} movements...`
          : `Remove ${movementIdsToRemove.length} movements`}
      </button>
    </div>
  );
}

/**
 * COMPARISON:
 *
 * OLD WAY (multiple API calls):
 * ADD: 5 movements = 5 separate POST requests
 * REMOVE: 3 movements = 3 separate DELETE requests
 * - 8 total API calls
 * - 8 separate optimistic updates
 * - 8 separate loading states
 * - Potential for partial failures
 * - Poor UX with multiple spinners
 *
 * NEW WAY (batch operations):
 * ADD: 5 movements = 1 batch INSERT request
 * REMOVE: 3 movements = 1 DELETE with IN clause
 * - 2 total API calls
 * - 2 optimistic updates (one per operation type)
 * - 2 loading states (add vs remove)
 * - All movements in each operation succeed or fail together
 * - Much better performance and UX
 * - Atomic operations prevent inconsistent state
 */
