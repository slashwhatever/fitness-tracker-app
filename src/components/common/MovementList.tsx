'use client';

import EditMovementModal from '@/components/common/EditMovementModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useRemoveMovementFromWorkout, useUserMovement, useWorkoutMovements } from '@/hooks';
import type { UserMovement } from '@/models/types';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MovementListProps {
  workoutId: string;
  onMovementAdded: (userMovementId: string) => Promise<void>;
  onAddMovementClick: () => void;
}

export default function MovementList({ 
  workoutId, 
  onAddMovementClick 
}: MovementListProps) {
  const { data: movements = [], isLoading } = useWorkoutMovements(workoutId);
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading movements...</p>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Movements</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No movements added yet.</p>
          <Button onClick={onAddMovementClick} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Movement</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Workout Movements ({movements.length})</CardTitle>
          <Button onClick={onAddMovementClick} size="sm" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Movement</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {movements.map((movement: { id: string; user_movement_id: string; user_movement?: { name?: string; muscle_groups?: string[] } }, index: number) => (
            <div 
              key={movement.id} 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="font-medium">
                    {movement.user_movement?.name || 'Unknown Movement'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {movement.user_movement?.muscle_groups?.join(', ') || 'No muscle groups'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingMovementId(movement.user_movement_id)}
                  className="text-muted-foreground hover:text-blue-500"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteClick(movement.user_movement_id, movement.user_movement?.name || 'Unknown Movement')}
                  className="text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit Movement Modal */}
      <EditMovementModal
        isOpen={!!editingMovementId}
        onClose={() => setEditingMovementId(null)}
        movement={editingMovement as UserMovement | null}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingMovement}
        onClose={() => setDeletingMovement(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Movement from Workout"
        description={`Are you sure you want to remove "${deletingMovement?.name}" from this workout? This will not delete the movement from your library, just remove it from this workout.`}
        confirmText="Remove Movement"
        cancelText="Keep Movement"
        variant="destructive"
        isLoading={removeMovementMutation.isPending}
      />
    </Card>
  );
}