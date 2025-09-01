'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { movementLibrary } from '@/data/movementLibrary';
import { useUserMovements, useWorkoutMovements, useCreateUserMovement, useAddMovementToWorkout, useRemoveMovementFromWorkout } from '@/hooks';
import type { MovementTemplate, UserMovement } from '@/models/types';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
}

export default function MovementSelectionModal({
  isOpen,
  onClose,
  workoutId,
}: MovementSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(new Set());

  // Use our new React Query hooks
  const { data: userMovements = [] } = useUserMovements();
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId);
  const createUserMovementMutation = useCreateUserMovement();
  const addMovementToWorkoutMutation = useAddMovementToWorkout();
  const removeMovementFromWorkoutMutation = useRemoveMovementFromWorkout();

  // Pre-select movements that are already in this workout
  const workoutMovementIdsString = useMemo(() => 
    workoutMovements.map(wm => wm.user_movement_id).sort().join(','), 
    [workoutMovements]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedMovements(new Set());
      return;
    }

    const ids = workoutMovementIdsString ? workoutMovementIdsString.split(',').filter(Boolean) : [];
    if (ids.length > 0) {
      setSelectedMovements(new Set(ids));
    } else {
      setSelectedMovements(new Set());
    }
  }, [isOpen, workoutMovementIdsString]);

  const filteredLibrary = useMemo(() => {
    // Get template IDs that user already has as custom movements
    const existingTemplateIds = new Set(
      userMovements
        .filter(um => um.template_id)
        .map(um => um.template_id!)
    );

    return movementLibrary
      .filter(movement => {
        // Don't show library movements that user already has as custom movements
        if (existingTemplateIds.has(movement.id)) {
          return false;
        }
        
        // Apply search filter
        return movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               movement.muscle_groups.some(group =>
                 group.toLowerCase().includes(searchTerm.toLowerCase())
               );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, userMovements]);

  const filteredUserMovements = useMemo(() => {
    return userMovements
      .filter(movement =>
        movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.muscle_groups?.some(group =>
          group.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userMovements, searchTerm]);

  const handleMovementToggle = async (movementId: string, movementData: MovementTemplate | UserMovement | any) => {
    try {
      if (selectedMovements.has(movementId)) {
        // Optimistically update UI immediately
        setSelectedMovements(prev => {
          const newSet = new Set(prev);
          newSet.delete(movementId);
          return newSet;
        });

        // Deselect movement - remove from workout
        await removeMovementFromWorkoutMutation.mutateAsync({ 
          workoutId, 
          movementId 
        });
      } else {
        // Select movement - add to workout
        let userMovementId = movementId;
        
        // Check if this is a template movement and create user movement if needed
        const isTemplate = 'experience_level' in movementData;
        if (isTemplate) {
          const existingUserMovement = userMovements.find(um => um.template_id === movementId);
          
          if (existingUserMovement) {
            userMovementId = existingUserMovement.id;
          } else {
            // Create new user movement from template
            const template = movementData as MovementTemplate;
            const newUserMovement = await createUserMovementMutation.mutateAsync({
              template_id: template.id,
              name: template.name,
              muscle_groups: template.muscle_groups,
              tracking_type: template.tracking_type,
              personal_notes: template.instructions,
            });
            userMovementId = newUserMovement.id;
          }
        }

        // Check if movement is already in workout to avoid duplicates
        const isAlreadyInWorkout = workoutMovements.some(wm => wm.user_movement_id === userMovementId);
        const isAlreadySelected = selectedMovements.has(userMovementId);
        
        if (isAlreadyInWorkout || isAlreadySelected) {
          console.warn('Movement already in workout or selected, skipping add operation');
          setSelectedMovements(prev => new Set([...prev, userMovementId]));
          return;
        }

        // Optimistically update UI immediately
        setSelectedMovements(prev => new Set([...prev, userMovementId]));

        // Calculate next order index to avoid duplicates
        const maxOrderIndex = workoutMovements.reduce((max, wm) => 
          Math.max(max, wm.order_index || 0), -1
        );
        const nextOrderIndex = maxOrderIndex + 1;

        // Add to workout
        await addMovementToWorkoutMutation.mutateAsync({
          workout_id: workoutId,
          user_movement_id: userMovementId,
          order_index: nextOrderIndex,
        });
      }
    } catch (error) {
      console.error('Error toggling movement:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[85vh] w-[90vw] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Add Movements to Workout</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select exercises from the library to add to your workout
          </p>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="flex-shrink-0">
            <Input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Movement Lists */}
          <ScrollArea className="h-72 -mr-4 pr-4">
            <div className="space-y-4 pb-4">
              {/* User's Custom Movements */}
              {filteredUserMovements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">My Movements</h3>
                  <div className="space-y-2">
                    {filteredUserMovements.map((movement) => (
                      <div
                        key={movement.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                          selectedMovements.has(movement.id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'border-border hover:border-accent-foreground/20'
                        }`}
                        onClick={() => handleMovementToggle(movement.id, movement)}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedMovements.has(movement.id)
                              ? 'bg-primary border-primary' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {selectedMovements.has(movement.id) && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {movement.tracking_type === 'weight' ? '🏋️' : 
                                 movement.tracking_type === 'bodyweight' ? '🤸' :
                                 movement.tracking_type === 'duration' ? '⏱️' :
                                 movement.tracking_type === 'distance' ? '🏃' : '💪'}
                              </span>
                              <h3 className="font-medium text-sm truncate">{movement.name}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">{movement.muscle_groups?.join(', ') || 'Unknown'}</p>
                          </div>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          Custom
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Movement Library */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Movement Library</h3>
                <div className="space-y-2">
                  {filteredLibrary.map((movement) => (
                    <div
                      key={movement.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
                        selectedMovements.has(movement.id) 
                          ? 'bg-primary/10 border-primary' 
                          : 'border-border hover:border-accent-foreground/20'
                      }`}
                      onClick={() => {
                        // For library movements, find the corresponding user_movement_id
                        const existingUserMovement = userMovements.find(um => um.template_id === movement.id);
                        const userMovementId = existingUserMovement?.id || movement.id;
                        handleMovementToggle(userMovementId, movement);
                      }}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            (() => {
                              const existingUserMovement = userMovements.find(um => um.template_id === movement.id);
                              const userMovementId = existingUserMovement?.id || movement.id;
                              return selectedMovements.has(userMovementId);
                            })()
                              ? 'bg-primary border-primary' 
                              : 'border-muted-foreground/30'
                          }`}>
                            {(() => {
                              const existingUserMovement = userMovements.find(um => um.template_id === movement.id);
                              const userMovementId = existingUserMovement?.id || movement.id;
                              return selectedMovements.has(userMovementId);
                            })() && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">
                              {movement.tracking_type === 'weight' ? '🏋️' : 
                               movement.tracking_type === 'bodyweight' ? '🤸' :
                               movement.tracking_type === 'duration' ? '⏱️' :
                               movement.tracking_type === 'distance' ? '🏃' : '💪'}
                            </span>
                            <h3 className="font-medium text-sm truncate">{movement.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground">{movement.muscle_groups?.join(', ') || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {movement.experience_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {filteredLibrary.length === 0 && filteredUserMovements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No movements found matching your search.</p>
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
            <div className="text-sm text-muted-foreground">
              {selectedMovements.size} movement{selectedMovements.size !== 1 ? 's' : ''} in workout
            </div>
            <div className="flex space-x-3">
              <Button onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

