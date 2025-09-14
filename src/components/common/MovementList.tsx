"use client";

import EditMovementModal from "@/components/common/EditMovementModal";
import SortableMovementItem from "@/components/common/SortableMovementItem";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { MovementListSkeleton } from "@/components/ui/skeleton-patterns";
import {
  useRemoveMovementFromWorkout,
  useReorderWorkoutMovements,
  useUserMovement,
  useWorkoutMovements,
} from "@/hooks";
import { useSets, useSetsByWorkout } from "@/hooks/useSets";
import { formatLastSetDate } from "@/lib/utils/dateHelpers";
import type { UserMovement } from "@/models/types";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, SearchX } from "lucide-react";
import { useState } from "react";

interface MovementListProps {
  workoutId: string;
  onMovementAdded: (userMovementId: string) => Promise<void>;
  onAddMovementClick: () => void;
  expectedCount?: number; // Number of movements we expect to load
}

export default function MovementList({
  workoutId,
  onAddMovementClick,
}: MovementListProps) {
  const { data: movements = [], isLoading } = useWorkoutMovements(workoutId);
  const { data: workoutSets = [] } = useSetsByWorkout(workoutId);
  const { data: allSets = [] } = useSets();
  const removeMovementMutation = useRemoveMovementFromWorkout();
  const reorderMutation = useReorderWorkoutMovements();
  const [editingMovementId, setEditingMovementId] = useState<string | null>(
    null
  );
  const [deletingMovement, setDeletingMovement] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  );

  // Get the movement data for editing
  const { data: editingMovement } = useUserMovement(editingMovementId || "");

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
    return workoutSets.filter((set) => set.user_movement_id === userMovementId);
  };

  const getLastSetDate = (userMovementId: string) => {
    // Get all sets for this specific movement
    const movementSets = allSets.filter(
      (set) => set.user_movement_id === userMovementId
    );
    return formatLastSetDate(movementSets);
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

    // Create the reordered array
    const reorderedMovements = arrayMove(movements, oldIndex, newIndex);

    // Update order_index for all affected movements
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
        <Button
          onClick={onAddMovementClick}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Movement</span>
        </Button>
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="bg-card border border-default rounded-lg overflow-hidden">
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
                onEdit={() => setEditingMovementId(movement.user_movement_id)}
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

      <EditMovementModal
        isOpen={!!editingMovementId}
        onClose={() => setEditingMovementId(null)}
        movement={editingMovement as UserMovement | null}
      />

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
