'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRemoveMovementFromWorkout, useWorkoutMovements } from '@/hooks';
import { Plus, Trash2 } from 'lucide-react';

interface DraggableMovementListProps {
  workoutId: string;
  onMovementAdded: (userMovementId: string) => Promise<void>;
  onAddMovementClick: () => void;
}

export default function DraggableMovementList({ 
  workoutId, 
  onAddMovementClick 
}: DraggableMovementListProps) {
  const { data: movements = [], isLoading } = useWorkoutMovements(workoutId);
  const removeMovementMutation = useRemoveMovementFromWorkout();

  const handleRemoveMovement = async (movementId: string) => {
    try {
      await removeMovementMutation.mutateAsync({ 
        workoutId, 
        movementId 
      });
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveMovement(movement.user_movement_id)}
                disabled={removeMovementMutation.isPending}
                className="text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}