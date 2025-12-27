"use client";

import { useMovementLastSets } from "@/hooks/useMovementLastSets";
import {
  useRemoveMovementFromWorkout,
  useReorderWorkoutMovements,
  useWorkoutMovements,
} from "@/hooks/useMovements";
import { formatLastSetDate } from "@/lib/utils/dateHelpers";
import SortableMovementItem from "@components/common/SortableMovementItem";
import { Button } from "@components/ui/button";
import { ConfirmationModal } from "@components/ui/confirmation-modal";
import { MovementListSkeleton } from "@components/ui/skeleton-patterns";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MovementListProps {
  workoutId: string;
  expectedCount?: number;
}

export default function MovementList({ workoutId }: MovementListProps) {
  const router = useRouter();
  const { data: movements = [], isLoading } = useWorkoutMovements(workoutId);

  // Get movement IDs for efficient last set date lookup
  const movementIds = movements.map((m) => m.user_movement_id);
  const { data: lastSetsData = [] } = useMovementLastSets(movementIds);
  const removeMovementMutation = useRemoveMovementFromWorkout();
  const reorderMutation = useReorderWorkoutMovements();
  const [deletingMovement, setDeletingMovement] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Drag and drop sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  const handleEditClick = (userMovementId: string) => {
    // Navigate to the movement settings page
    router.push(`/workout/${workoutId}/movement/${userMovementId}/settings`);
  };

  const handleDeleteClick = (movementId: string, movementName: string) => {
    setDeletingMovement({ id: movementId, name: movementName });
  };

  const handleConfirmDelete = async () => {
    if (!deletingMovement) return;

    try {
      await removeMovementMutation.mutateAsync({
        workoutId,
        movementId: deletingMovement.id,
      });
      setDeletingMovement(null);
    } catch (error) {
      console.error("Failed to remove movement:", error);
    }
  };

  const getMovementSets = (userMovementId: string) => {
    const lastSetData = lastSetsData.find(
      (data) => data.user_movement_id === userMovementId
    );
    return Array.from({ length: lastSetData?.total_sets || 0 }, (_, i) => ({
      id: `placeholder-${i}`,
      created_at: new Date().toISOString(),
    }));
  };

  const getLastSetDate = (userMovementId: string) => {
    const lastSetData = lastSetsData.find(
      (data) => data.user_movement_id === userMovementId
    );

    if (!lastSetData?.last_set_date) {
      return "No sets";
    }

    return formatLastSetDate([{ created_at: lastSetData.last_set_date }]);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = movements.findIndex(
      (movement) => movement.id === active.id
    );
    const newIndex = movements.findIndex((movement) => movement.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedMovements = arrayMove(movements, oldIndex, newIndex);

    const updatedMovements = reorderedMovements.map((movement, index) => ({
      id: movement.id,
      order_index: index,
    }));

    try {
      await reorderMutation.mutateAsync({
        workoutId,
        movements: updatedMovements,
      });
    } catch (error) {
      console.error("Failed to reorder movements:", error);
    }
  };

  if (isLoading) {
    return <MovementListSkeleton />;
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dotted border-muted-foreground/30 rounded-lg p-4 flex flex-col items-center justify-center">
        <SearchX className="mb-4" size={48} />
        <p className="text-muted-foreground mb-4">No movements added yet.</p>
        <Button asChild className="flex items-center space-x-2">
          <Link href={`/workout/${workoutId}/movements`}>
            <Plus className="w-4 h-4" />
            <span>Add Movement</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="bg-card border border-default rounded-lg overflow-hidden select-none">
          <SortableContext
            items={movements.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {movements.map((movement, index) => (
              <SortableMovementItem
                key={movement.id}
                movement={movement}
                workoutId={workoutId}
                movementSets={getMovementSets(movement.user_movement_id)}
                lastSetDate={getLastSetDate(movement.user_movement_id)}
                onEdit={() => handleEditClick(movement.user_movement_id)}
                onDelete={() =>
                  handleDeleteClick(
                    movement.user_movement_id,
                    movement.user_movement?.name || "Unknown Movement"
                  )
                }
                showSeparator={index < movements.length - 1}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      <ConfirmationModal
        isOpen={!!deletingMovement}
        onClose={() => setDeletingMovement(null)}
        onConfirm={handleConfirmDelete}
        title="Remove movement from workout"
        description={`Are you sure you want to remove "${deletingMovement?.name}" from this workout? This will not delete the movement from your library, just remove it from this workout.`}
        confirmText="Remove movement"
        cancelText="Keep movement"
        variant="destructive"
        isLoading={removeMovementMutation.isPending}
      />
    </>
  );
}
