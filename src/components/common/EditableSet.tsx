'use client';

import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { useDeleteSet, useUpdateSet } from '@/hooks/useSets';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { Set, UserMovement } from '@/models/types';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { useState, useCallback, useMemo, memo } from 'react';
import ResponsiveButton from './ResponsiveButton';
import SetEntryForm from './SetEntryForm';
import { Typography } from './Typography';

interface EditableSetProps {
  set: Set;
  movement: UserMovement;
  onDuplicate: (originalSet: Set) => void;
}

const EditableSet = memo(function EditableSet({
  set,
  movement,
  onDuplicate,
}: EditableSetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: userProfile } = useUserProfile();
  const updateSetMutation = useUpdateSet();
  const deleteSetMutation = useDeleteSet();
  
  const weightUnit = userProfile?.weight_unit || 'lbs';
  const distanceUnit = userProfile?.distance_unit || 'miles';

  // Memoize expensive date formatting
  const formattedDate = useMemo(() => 
    new Date(set.created_at).toLocaleDateString(), [set.created_at]
  );
  const formattedTime = useMemo(() => 
    new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), [set.created_at]
  );

  const handleSave = useCallback(async (setData: Partial<Set>) => {
    const updates: Partial<Set> = {
      reps: setData.reps,
      weight: setData.weight,
      duration: setData.duration,
      distance: setData.distance,
      notes: setData.notes,
    };

    try {
      await updateSetMutation.mutateAsync({ id: set.id, updates });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update set:', error);
    }
  }, [set.id, updateSetMutation]);

  const handleDrawerOpenChange = useCallback((open: boolean) => {
    setIsEditing(open);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDistanceUnitAbbreviation = useCallback((unit: string) => {
    return unit === 'miles' ? 'mi' : 'km';
  }, []);

  const handleDuplicate = useCallback(() => {
    onDuplicate(set);
  }, [onDuplicate, set]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteSetMutation.mutateAsync(set.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete set:', error);
      // Keep modal open on error so user can retry
    }
  }, [deleteSetMutation, set.id]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between items-center">
        <div className="flex-1 min-w-0 text-left">
            {movement.tracking_type === 'weight' && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Typography variant="title2">{set.reps || 0}</Typography>
                <Typography variant="caption">reps</Typography>
                <Typography variant="caption">×</Typography>
                <Typography variant="title2">{set.weight || 0}</Typography>
                <Typography variant="caption">{weightUnit}</Typography>
              </div>
            )}
            
            {(movement.tracking_type === 'bodyweight' || movement.tracking_type === 'reps_only') && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Typography variant="title2">{set.reps}</Typography>
                <Typography variant="caption">reps</Typography>
              </div>
            )}
            
            {movement.tracking_type === 'distance' && set.distance && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Typography variant="title2">{set.distance}</Typography>
                <Typography variant="caption">{getDistanceUnitAbbreviation(distanceUnit)}</Typography>
              </div>
            )}
            
            {movement.tracking_type === 'duration' && set.duration && (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Typography variant="title2">{formatDuration(set.duration)}</Typography>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2 sm:ml-4">
          <ResponsiveButton
            icon={Copy}
            color="green"
            onClick={handleDuplicate}
          >
            <Typography variant="body">Duplicate</Typography>
          </ResponsiveButton>

          <Drawer open={isEditing} onOpenChange={handleDrawerOpenChange}>
            <DrawerTrigger asChild>
              <ResponsiveButton
                title="Edit"
                icon={Edit}
                color="blue"
              > 
                <Typography variant="body">Edit</Typography>
              </ResponsiveButton>
            </DrawerTrigger>
            <DrawerContent className="!max-h-[95vh]">
              <DrawerHeader>
                <DrawerTitle>Edit set</DrawerTitle>
                <DrawerDescription>
                  Modify the values for this set from {formattedDate} at {formattedTime}
                </DrawerDescription>
              </DrawerHeader>
              
              <div className="flex-1 overflow-y-auto">
                <SetEntryForm
                  movement={movement}
                  initialData={{
                    reps: set.reps,
                    weight: set.weight,
                    duration: set.duration,
                    distance: set.distance,
                    notes: set.notes || '',
                  }}
                  onSave={handleSave}
                  isLoading={updateSetMutation.isPending}
                  saveButtonText="Save Changes"
                />
              </div>
            </DrawerContent>
          </Drawer>
          
          <ResponsiveButton
            title="Delete"
            icon={Trash2}
            onClick={handleDeleteClick}
            color="red"
          >
            <Typography variant="body">Delete</Typography>
          </ResponsiveButton>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete set"
        description={`Are you sure you want to delete this set from ${formattedDate} at ${formattedTime}? This action cannot be undone.`}
        confirmText="Delete set"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteSetMutation.isPending}
      />
    </>
  );
});

export default EditableSet;
