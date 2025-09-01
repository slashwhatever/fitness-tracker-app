'use client';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDeleteSet, useUpdateSet } from '@/hooks/useSets';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Set, UserMovement } from '@/models/types';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EditableSetProps {
  set: Set;
  movement: UserMovement;
  onDuplicate: (originalSet: Set) => void;
}

export default function EditableSet({
  set,
  movement,
  onDuplicate,
}: EditableSetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [weight, setWeight] = useState(set.weight?.toString() || '');
  const [duration, setDuration] = useState(set.duration?.toString() || '');
  const [distance, setDistance] = useState(set.distance?.toString() || '');
  const [notes, setNotes] = useState(set.notes || '');

  const { data: userProfile } = useUserProfile();
  const updateSetMutation = useUpdateSet();
  const deleteSetMutation = useDeleteSet();
  
  const weightUnit = userProfile?.weight_unit || 'lbs';

  const handleSave = async () => {
    const updates: Partial<Set> = {};
    
    if (movement.tracking_type === 'weight') {
      updates.reps = reps ? Number(reps) : null;
      updates.weight = weight ? Number(weight) : null;
    } else if (movement.tracking_type === 'bodyweight' || movement.tracking_type === 'reps_only') {
      updates.reps = reps ? Number(reps) : null;
    } else if (movement.tracking_type === 'duration') {
      updates.duration = duration ? Number(duration) : null;
    } else if (movement.tracking_type === 'distance') {
      updates.distance = distance ? Number(distance) : null;
    }
    
    if (notes !== set.notes) {
      updates.notes = notes || null;
    }

    try {
      await updateSetMutation.mutateAsync({ id: set.id, updates });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update set:', error);
    }
  };

  const handleCancel = () => {
    setReps(set.reps?.toString() || '');
    setWeight(set.weight?.toString() || '');
    setDuration(set.duration?.toString() || '');
    setDistance(set.distance?.toString() || '');
    setNotes(set.notes || '');
    setIsEditing(false);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      // Reset form values when opening the drawer
      setReps(set.reps?.toString() || '');
      setWeight(set.weight?.toString() || '');
      setDuration(set.duration?.toString() || '');
      setDistance(set.distance?.toString() || '');
      setNotes(set.notes || '');
    }
  };

  const isValidEdit = () => {
    switch (movement.tracking_type) {
      case 'weight':
        return reps && weight;
      case 'bodyweight':
      case 'reps_only':
        return reps;
      case 'duration':
        return duration;
      case 'distance':
        return distance;
      default:
        return false;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDuplicate = () => {
    onDuplicate(set);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 sm:p-3 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <span>{new Date(set.created_at).toLocaleDateString()}</span>
            <span>{new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          {/* Set Data Display */}
          <div className="text-left sm:text-right">
            {movement.tracking_type === 'weight' && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{set.weight}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">{weightUnit}</span>
                <span className="text-muted-foreground">×</span>
                <span className="text-base sm:text-xl font-semibold text-foreground">{set.reps}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">reps</span>
              </div>
            )}
            
            {(movement.tracking_type === 'bodyweight' || movement.tracking_type === 'reps_only') && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{set.reps}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">reps</span>
              </div>
            )}
            
            {movement.tracking_type === 'distance' && set.distance && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{set.distance}</span>
                <span className="text-xs sm:text-sm text-muted-foreground">mi</span>
              </div>
            )}
            
            {movement.tracking_type === 'duration' && set.duration && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg sm:text-2xl font-bold text-foreground">{formatDuration(set.duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <Button
            onClick={handleDuplicate}
            size="sm"
            className="bg-green-500 hover:bg-green-600 h-8 sm:h-9 text-xs sm:text-sm"
          >
            <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden xs:inline">Duplicate</span>
          </Button>
          
          <Drawer open={isEditing} onOpenChange={handleDrawerOpenChange}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Edit Set</DrawerTitle>
                  <DrawerDescription>
                    Modify the values for this set from {new Date(set.created_at).toLocaleDateString()} at {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="px-4 pb-4 space-y-4 sm:space-y-6">
                  {movement.tracking_type === 'weight' && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-weight" className="text-sm">Weight</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="text-center text-base sm:text-lg"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-reps" className="text-sm">Reps</Label>
                        <Input
                          id="edit-reps"
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="text-center text-base sm:text-lg"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                  
                  {(movement.tracking_type === 'bodyweight' || movement.tracking_type === 'reps_only') && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-reps" className="text-sm">Reps</Label>
                      <Input
                        id="edit-reps"
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="text-center text-base sm:text-lg"
                        min="0"
                      />
                    </div>
                  )}
                  
                  {movement.tracking_type === 'distance' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-distance" className="text-sm">Distance (miles)</Label>
                      <Input
                        id="edit-distance"
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        className="text-center text-base sm:text-lg"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                  
                  {movement.tracking_type === 'duration' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration" className="text-sm">Duration (seconds)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="text-center text-base sm:text-lg"
                        min="0"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-notes" className="text-sm">Notes (optional)</Label>
                    <Input
                      id="edit-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="How did it feel?"
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>
                
                <DrawerFooter>
                  <Button
                    onClick={handleSave}
                    disabled={!isValidEdit() || updateSetMutation.isPending}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {updateSetMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            
            <Button
              onClick={() => deleteSetMutation.mutate(set.id)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500 h-8 w-8 sm:h-9 sm:w-9"
              disabled={deleteSetMutation.isPending}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
        </>
  );
}
