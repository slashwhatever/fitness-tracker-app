'use client';

import EditMovementModal from '@/components/common/EditMovementModal';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { MovementListSkeleton } from '@/components/ui/skeleton-patterns';
import { useRemoveMovementFromWorkout, useUserMovement, useWorkoutMovements } from '@/hooks';
import { useSets, useSetsByWorkout } from '@/hooks/useSets';
import { formatLastSetDate } from '@/lib/utils/dateHelpers';
import type { UserMovement } from '@/models/types';
import { Dumbbell, Edit3, Plus, SearchX, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ResponsiveButton from './ResponsiveButton';
import { Typography } from './Typography';

interface MovementListProps {
  workoutId: string;
  onMovementAdded: (userMovementId: string) => Promise<void>;
  onAddMovementClick: () => void;
  expectedCount?: number; // Number of movements we expect to load
}

export default function MovementList({ 
  workoutId, 
  onAddMovementClick,
  expectedCount = 2
}: MovementListProps) {
  const { data: movements = [], isLoading } = useWorkoutMovements(workoutId);
  const { data: workoutSets = [] } = useSetsByWorkout(workoutId);
  const { data: allSets = [] } = useSets();
  const removeMovementMutation = useRemoveMovementFromWorkout();
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<{ id: string; name: string } | null>(null);
  
  // Get the movement data for editing
  const { data: editingMovement } = useUserMovement(editingMovementId || '');


  const handleDeleteClick = (movementId: string, movementName: string) => {
    setDeletingMovement({ id: movementId, name: movementName });
  };

  const handleConfirmDelete = async () => {
    if (!deletingMovement) return;

    try {
      await removeMovementMutation.mutateAsync({ 
        workoutId, 
        movementId: deletingMovement.id 
      });
      setDeletingMovement(null);
    } catch (error) {
      console.error('Failed to remove movement:', error);
    }
  };

  const getMovementSets = (userMovementId: string) => {
    return workoutSets.filter(set => set.user_movement_id === userMovementId);
  };

  const getLastSetDate = (userMovementId: string) => {
    // Get all sets for this specific movement
    const movementSets = allSets.filter(set => set.user_movement_id === userMovementId);
    return formatLastSetDate(movementSets);
  };

  if (isLoading) {
    return (
      <MovementListSkeleton />
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dotted border-muted-foreground/30 rounded-lg p-4 flex flex-col items-center justify-center">
        <SearchX className="mb-4" size={48}/>
        <p className="text-muted-foreground mb-4">No movements added yet.</p>
        <Button onClick={onAddMovementClick} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Movement</span>
        </Button>
      </div>  
    );
  }

  return (
    <>
      <div className="grid gap-2">
        {movements.map((movement) => {
          const movementSets = getMovementSets(movement.user_movement_id);
          
          return (
            <div key={movement.id} className="bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/10 transition-all">
                <Link 
                  href={`/workout/${workoutId}/movement/${movement.user_movement_id}`}
                  className="flex items-center space-x-2 sm:space-x-3 flex-1 cursor-pointer min-w-0 overflow-hidden"
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <Typography variant="title3" className="truncate block">
                      {movement.user_movement?.name || 'Unknown Movement'}
                    </Typography>
                    <Typography variant="caption" className="line-clamp-2 block">
                      {getLastSetDate(movement.user_movement_id)}
                      {movementSets.length > 0 && ` • ${movementSets.length} set${movementSets.length > 1 ? 's' : ''}`}
                    </Typography>
                  </div>
                </Link>
                <div className="flex items-center space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                  <ResponsiveButton
                    icon={Dumbbell}
                    color="green"
                    asChild
                  >
                    <Link href={`/workout/${workoutId}/movement/${movement.user_movement_id}`}>
                      <Typography variant="body">Log sets</Typography>
                    </Link>
                  </ResponsiveButton>
                  <ResponsiveButton
                    icon={Edit3}
                    color="blue"
                    onClick={() => setEditingMovementId(movement.user_movement_id)}
                  >
                    Edit
                  </ResponsiveButton>
                  <ResponsiveButton
                    icon={Trash2}
                    color="red"
                    onClick={() => handleDeleteClick(movement.user_movement_id, movement.user_movement?.name || 'Unknown Movement')}
                  >
                    Delete
                  </ResponsiveButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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