'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateUserMovement } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { TrackingType, UserMovement } from '@/models/types';
import { useEffect, useState } from 'react';

interface EditMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: UserMovement | null;
}

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 
  'Glutes', 'Calves', 'Cardio', 'Full Body'
];

const TRACKING_TYPES = [
  { value: 'weight' as TrackingType, label: 'Weight & Reps', description: 'Track weight lifted and repetitions' },
  { value: 'bodyweight' as TrackingType, label: 'Bodyweight', description: 'Track reps only (push-ups, pull-ups, etc.)' },
  { value: 'duration' as TrackingType, label: 'Duration', description: 'Track time (planks, holds, etc.)' },
  { value: 'distance' as TrackingType, label: 'Distance', description: 'Track distance (running, walking, etc.)' },
  { value: 'reps_only' as TrackingType, label: 'Reps Only', description: 'Just track repetitions' },
];

export default function EditMovementModal({
  isOpen,
  onClose,
  movement,
}: EditMovementModalProps) {
  const [name, setName] = useState('');
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [trackingType, setTrackingType] = useState<TrackingType | ''>('');
  const [customRestTimer, setCustomRestTimer] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const updateUserMovementMutation = useUpdateUserMovement();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Initialize form when movement changes
  useEffect(() => {
    if (movement) {
      setName(movement.name);
      setSelectedMuscleGroups(movement.muscle_groups || []);
      setTrackingType(movement.tracking_type);
      setCustomRestTimer(movement.custom_rest_timer?.toString() || '');
      setPersonalNotes(movement.personal_notes || '');
    }
  }, [movement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movement || !name.trim() || !trackingType || selectedMuscleGroups.length === 0) return;

    try {
      await updateUserMovementMutation.mutateAsync({
        id: movement.id,
        updates: {
          name: name.trim(),
          muscle_groups: selectedMuscleGroups,
          tracking_type: trackingType,
          custom_rest_timer: customRestTimer ? parseInt(customRestTimer) : null,
          personal_notes: personalNotes.trim() || null,
        },
      });

      handleClose();
    } catch (error) {
      console.error('Error updating movement:', error);
    }
  };

  const handleClose = () => {
    // Reset form
    setName('');
    setSelectedMuscleGroups([]);
    setTrackingType('');
    setCustomRestTimer('');
    setPersonalNotes('');
    onClose();
  };

  const handleMuscleGroupToggle = (group: string) => {
    setSelectedMuscleGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  if (!movement) return null;

  const FormContent = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 min-h-0 ${className}`}>
      {/* Movement Name */}
      <div>
        <Label htmlFor="name">Movement Name *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Barbell Bench Press"
          required
        />
      </div>

      {/* Tracking Type */}
      <div>
        <Label htmlFor="trackingType">Tracking Type *</Label>
        <Select value={trackingType} onValueChange={(value) => setTrackingType(value as TrackingType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tracking type" />
          </SelectTrigger>
          <SelectContent>
            {TRACKING_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Muscle Groups */}
      <div>
        <Label>Muscle Groups * ({selectedMuscleGroups.length} selected)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => handleMuscleGroupToggle(group)}
              className={`p-2 text-sm rounded-md border transition-colors ${
                selectedMuscleGroups.includes(group)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-accent'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Rest Timer */}
      <div>
        <Label htmlFor="restTimer">Custom Rest Timer (seconds)</Label>
        <Input
          id="restTimer"
          type="number"
          value={customRestTimer}
          onChange={(e) => setCustomRestTimer(e.target.value)}
          placeholder="e.g., 120"
          min="0"
        />
      </div>

      {/* Personal Notes */}
      <div>
        <Label htmlFor="notes">Personal Notes</Label>
        <Textarea
          id="notes"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Any personal notes about this movement..."
          rows={3}
        />
      </div>

      {/* Display template info if movement is based on a template */}
      {movement.template_id && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            📋 This movement is based on a library template
          </p>
        </div>
      )}
    </div>
  );

  const ActionButtons = () => (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={!name.trim() || !trackingType || selectedMuscleGroups.length === 0 || updateUserMovementMutation.isPending}
      >
        {updateUserMovementMutation.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}>
        <DialogContent className="max-w-md max-h-[85vh] w-[90vw] flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Edit Movement</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 min-h-0">
            <FormContent />
            <ActionButtons />
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Movement</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 min-h-0">
          <FormContent className="px-4" />
          <DrawerFooter className="pt-2">
            <ActionButtons />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}