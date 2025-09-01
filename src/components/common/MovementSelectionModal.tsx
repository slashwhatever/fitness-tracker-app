'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { movementLibrary } from '@/data/movementLibrary';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { CreateUserMovementRequest, MovementTemplate, UserMovement } from '@/models/types';
import { SupabaseService } from '@/services/supabaseService';
import { Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  onMovementAdded: (userMovementId: string) => void;
}

export default function MovementSelectionModal({
  isOpen,
  onClose,
  workoutId,
  onMovementAdded,
}: MovementSelectionModalProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(new Set());
  const [userMovements, setUserMovements] = useState<UserMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserMovements = async () => {
    if (!user?.id) return;
    
    try {
      const movements = await SupabaseService.getUserMovements(user.id);
      setUserMovements(movements);
    } catch (error) {
      console.error('Error loading user movements:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserMovements();
    }
  }, [isOpen, user?.id]);

  const filteredLibrary = useMemo(() => {
    return movementLibrary
      .filter(movement =>
        movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.muscle_groups.some(group =>
          group.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm]);

  const filteredUserMovements = useMemo(() => {
    return userMovements
      .filter(movement =>
        movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.muscle_groups.some(group =>
          group.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [userMovements, searchTerm]);

  const handleMovementToggle = async (movementId: string, movementData: MovementTemplate) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      if (selectedMovements.has(movementId)) {
        // Deselect movement
        setSelectedMovements(prev => {
          const newSet = new Set(prev);
          newSet.delete(movementId);
          return newSet;
        });
      } else {
        // Select movement - find existing user_movement or create one
        let userMovementId = movementId;
        
        // Check if this is a template movement
        const isTemplate = movementLibrary.some(m => m.id === movementId);
        
        if (isTemplate) {
          // First, check if user already has this movement
          const existingUserMovement = userMovements.find(um => um.template_id === movementId);
          
          if (existingUserMovement) {
            // Use existing user movement
            userMovementId = existingUserMovement.id;
          } else {
            // Create new user movement from template
            const template = movementLibrary.find(m => m.id === movementId);
            if (template) {
              const userMovementRequest: CreateUserMovementRequest = {
                template_id: template.id,
                name: template.name,
                muscle_groups: template.muscle_groups,
                tracking_type: template.tracking_type,
                personal_notes: template.instructions || undefined,
              };

              const savedUserMovement = await SupabaseService.saveUserMovement(user.id, userMovementRequest);
              if (savedUserMovement) {
                userMovementId = savedUserMovement.id;
                setUserMovements(prev => [...prev, savedUserMovement]); // Add to local state
              } else {
                throw new Error('Failed to create user movement');
              }
            }
          }
        }

        // Add to workout
        setSelectedMovements(prev => new Set([...prev, userMovementId]));
        onMovementAdded(userMovementId);
      }
    } catch (error) {
      console.error('Error toggling movement:', error);
    } finally {
      setLoading(false);
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
                        onClick={() => {
                          // For existing user movements, we don't need to create a new one
                          setSelectedMovements(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(movement.id)) {
                              newSet.delete(movement.id);
                            } else {
                              newSet.add(movement.id);
                              // Defer callback to avoid state update during render
                              setTimeout(() => onMovementAdded(movement.id), 0);
                            }
                            return newSet;
                          });
                        }}
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

