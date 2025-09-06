'use client';

import CreateCustomMovementModal from '@/components/common/CreateCustomMovementModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { useAddMovementsToWorkout, useCreateUserMovement, useMovementTemplates, useRemoveMovementsFromWorkout, useTrackingTypes, useUserMovements, useWorkoutMovements } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getExperienceLevelVariant } from '@/lib/utils/typeHelpers';
import type { UserMovement, MovementTemplate } from '@/models/types';
import { prepareWorkoutMovements, getNextOrderIndex } from '@/lib/utils/workout-helpers';
import { Check, Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Typography } from './Typography';

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
}

// Use the proper transformed types from hooks

interface SearchAndContentProps {
  className?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setShowCustomMovementModal: (value: boolean) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  filteredUserMovements: UserMovement[];
  filteredLibrary: MovementTemplate[];
  selectedMovements: Set<string>;
  handleMovementToggle: (movementId: string, movementData: UserMovement | MovementTemplate) => void;
  userMovements: UserMovement[];
  isSaving: boolean;
}

const SearchAndContent = React.memo(function SearchAndContent({ 
  className = "", 
  searchTerm, 
  setSearchTerm, 
  setShowCustomMovementModal,
  scrollContainerRef,
  filteredUserMovements,
  filteredLibrary,
  selectedMovements,
  handleMovementToggle,
  userMovements,
  isSaving
}: SearchAndContentProps) {
  return (
  <div className={`flex flex-col space-y-4 overflow-hidden ${className}`}>
    {/* Search Bar */}
    <div className="flex-shrink-0 flex space-x-3">
      <Input
        type="text"
        placeholder="Search movements..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-1"
      />
      <Button 
        type="button"
        variant="outline"
        onClick={() => setShowCustomMovementModal(true)}
        className="flex items-center space-x-2 whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span>Add Custom</span>
      </Button>
    </div>

    {/* Movement Lists */}
    <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto pr-4">
      <div className="space-y-4 pb-4">
        {/* User's Custom Movements */}
        {filteredUserMovements.length > 0 && (
          <div>
            <Typography variant="caption" className="mb-2">My movements</Typography>
            <div className="space-y-2">
              {filteredUserMovements.map((movement) => (
                <div
                  key={movement.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isSaving 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'cursor-pointer hover:bg-accent/50'
                  } ${
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
          <Typography variant="caption" className="mb-2">Movement Library</Typography>
          <div className="space-y-2">
            {filteredLibrary.map((movement) => (
              <div
                key={movement.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isSaving 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'cursor-pointer hover:bg-accent/50'
                } ${
                  (() => {
                    const existingUserMovement = userMovements.find(um => um.template_id === movement.id);
                    const userMovementId = existingUserMovement?.id || movement.id;
                    return selectedMovements.has(userMovementId);
                  })()
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
                
                <Badge variant={getExperienceLevelVariant(movement.experience_level)}> 
                  {movement.experience_level}
                </Badge>
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
    </div>
  </div>
  );
});

export default function MovementSelectionModal({
  isOpen,
  onClose,
  workoutId,
}: MovementSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(new Set());
  const [initialSelectedMovements, setInitialSelectedMovements] = useState<Set<string>>(new Set());
  const [showCustomMovementModal, setShowCustomMovementModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [frozenSelectedMovements, setFrozenSelectedMovements] = useState<Set<string>>(new Set());
  
  // Use frozen state for display during save operations
  const displaySelectedMovements = isSaving ? frozenSelectedMovements : selectedMovements;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch movement templates from database instead of local file
  const { data: movementTemplates = [] } = useMovementTemplates();
  
  // Use our React Query hooks
  const { data: userMovements = [] } = useUserMovements();
  const { data: workoutMovements = [] } = useWorkoutMovements(workoutId);
  const { data: trackingTypes = [] } = useTrackingTypes();
  const createUserMovementMutation = useCreateUserMovement();
  const addMovementsBatch = useAddMovementsToWorkout();
  const removeMovementsBatch = useRemoveMovementsFromWorkout();


  // Pre-select movements that are already in this workout
  const workoutMovementIdsString = useMemo(() => 
    workoutMovements.map(wm => wm.user_movement_id).sort().join(','), 
    [workoutMovements]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedMovements(new Set());
      setInitialSelectedMovements(new Set());
      setFrozenSelectedMovements(new Set());
      setIsSaving(false);
      return;
    }

    // Don't update selections if we're in the middle of saving
    if (isSaving) return;

    const ids = workoutMovementIdsString ? workoutMovementIdsString.split(',').filter(Boolean) : [];
    const initialSet = new Set(ids);
    setSelectedMovements(initialSet);
    setInitialSelectedMovements(initialSet);
    setFrozenSelectedMovements(initialSet);
  }, [isOpen, workoutMovementIdsString, isSaving]);

  const filteredLibrary = useMemo(() => {
    // Get template IDs that users already have custom movements for
    const usedTemplateIds = new Set(
      userMovements
        .filter(userMovement => userMovement.template_id)
        .map(userMovement => userMovement.template_id)
    );

    return movementTemplates
      .filter(movement => {
        // Filter out templates that user already has custom movements for
        if (usedTemplateIds.has(movement.id)) {
          return false;
        }

        // Apply search filter
        return movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               movement.muscle_groups.some(group =>
                 group.toLowerCase().includes(searchTerm.toLowerCase())
               );
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [movementTemplates, searchTerm, userMovements]);

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

  const handleMovementToggle = useCallback((movementId: string, movementData: UserMovement | MovementTemplate) => {
    // Don't allow selection changes while saving
    if (isSaving) return;
    
    // Save current scroll position
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    
    // For library movements, we need to use the potential user movement ID
    let actualMovementId = movementId;
    const isTemplate = 'experience_level' in movementData;
    
    if (isTemplate) {
      // For templates, check if user already has a movement for this template
      const existingUserMovement = userMovements.find(um => um.template_id === movementData.id);
      actualMovementId = existingUserMovement?.id || movementId;
    }

    // Toggle selection in local state only
    setSelectedMovements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actualMovementId)) {
        newSet.delete(actualMovementId);
      } else {
        newSet.add(actualMovementId);
      }
      return newSet;
    });

    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollTop;
      }
    });
  }, [userMovements, isSaving]);

  const handleCustomMovementCreated = (userMovementId: string) => {
    // Close custom movement modal
    setShowCustomMovementModal(false);
    
    // Automatically select the new custom movement (don't save to DB yet)
    setSelectedMovements(prev => new Set([...prev, userMovementId]));
  };

  const handleSave = async () => {
    // Freeze the current selections to prevent checkbox flashing
    setFrozenSelectedMovements(new Set(selectedMovements));
    setIsSaving(true);
    try {
      // Calculate movements to add and remove
      const movementsToAdd = Array.from(selectedMovements).filter(id => !initialSelectedMovements.has(id));
      const movementsToRemove = Array.from(initialSelectedMovements).filter(id => !selectedMovements.has(id));

      // Batch remove movements (single API call)
      if (movementsToRemove.length > 0) {
        await removeMovementsBatch.mutateAsync({
          workoutId,
          movementIds: movementsToRemove
        });
      }

      // Process movements to add (create user movements for templates if needed)
      const userMovementIds: string[] = [];
      
      for (const movementId of movementsToAdd) {
        // Check if this is a template that needs a user movement created
        const templateMovement = movementTemplates.find(t => t.id === movementId);
        let userMovementId = movementId;

        if (templateMovement && !userMovements.find(um => um.id === movementId)) {
          // Get tracking type from ID since hooks aren't transforming data yet
          const trackingType = trackingTypes.find(tt => tt.id === templateMovement.tracking_type_id);
          if (!trackingType) {
            throw new Error(`Unknown tracking type ID: ${templateMovement.tracking_type_id}`);
          }

          // Create user movement from template
          const newUserMovement = await createUserMovementMutation.mutateAsync({
            template_id: templateMovement.id,
            name: templateMovement.name,
            muscle_groups: templateMovement.muscle_groups,
            tracking_type_id: trackingType.id,
            personal_notes: templateMovement.instructions,
          });
          userMovementId = newUserMovement.id;
        }

        userMovementIds.push(userMovementId);
      }

      // Batch add movements (single API call)
      if (userMovementIds.length > 0) {
        const startingOrderIndex = getNextOrderIndex(workoutMovements);
        const newWorkoutMovements = prepareWorkoutMovements(workoutId, userMovementIds, startingOrderIndex);
        
        await addMovementsBatch.mutateAsync(newWorkoutMovements);
      }

      onClose();
    } catch (error) {
      console.error('Error saving workout changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to initial state and close
    setSelectedMovements(initialSelectedMovements);
    onClose();
  };


  const FooterContent = () => (
    <div className="flex justify-between items-center pt-4 border-t bg-background">
      <div className="text-sm text-muted-foreground">
        {displaySelectedMovements.size} movement{displaySelectedMovements.size !== 1 ? 's' : ''} selected
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Done'}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={isOpen}>
          <DialogContent className="max-w-3xl h-[85vh] w-[90vw] flex flex-col">
            <DialogHeader className="pb-4 flex-shrink-0">
              <DialogTitle className="text-xl">Add Movements to Workout</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Select exercises from the library to add to your workout
              </DialogDescription>
            </DialogHeader>

            <SearchAndContent 
              className="flex-1 min-h-0"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setShowCustomMovementModal={setShowCustomMovementModal}
              scrollContainerRef={scrollContainerRef}
              filteredUserMovements={filteredUserMovements}
              filteredLibrary={filteredLibrary}
              selectedMovements={displaySelectedMovements}
              handleMovementToggle={handleMovementToggle}
              userMovements={userMovements}
              isSaving={isSaving}
            />
            <div className="flex-shrink-0">
              <FooterContent />
            </div>
          </DialogContent>
        </Dialog>

        {/* Custom Movement Creation Modal */}
        <CreateCustomMovementModal
          isOpen={showCustomMovementModal}
          onClose={() => setShowCustomMovementModal(false)}
          onMovementCreated={handleCustomMovementCreated}
          initialName={searchTerm.trim()}
        />
      </>
    );
  }

  return (
    <>
      <Drawer open={isOpen}>
        <DrawerContent className="!max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left flex-shrink-0">
            <DrawerTitle>Add movements to workout</DrawerTitle>
          </DrawerHeader>
          <SearchAndContent 
            className="px-4 flex-1 min-h-0"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowCustomMovementModal={setShowCustomMovementModal}
            scrollContainerRef={scrollContainerRef}
            filteredUserMovements={filteredUserMovements}
            filteredLibrary={filteredLibrary}
            selectedMovements={selectedMovements}
            handleMovementToggle={handleMovementToggle}
            userMovements={userMovements as UserMovement[]}
            isSaving={isSaving}
          />
          <DrawerFooter className="pt-2 flex-shrink-0">
            <FooterContent />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Custom Movement Creation Modal */}
      <CreateCustomMovementModal
        isOpen={showCustomMovementModal}
        onClose={() => setShowCustomMovementModal(false)}
        onMovementCreated={handleCustomMovementCreated}
        initialName={searchTerm.trim()}
      />
    </>
  );
}

