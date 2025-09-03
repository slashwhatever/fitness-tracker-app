'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUserMovement } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { TrackingType } from '@/models/types';
import { useEffect, useState } from 'react';

interface CreateCustomMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementCreated: (userMovementId: string) => void;
  initialName?: string;
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

export default function CreateCustomMovementModal({
  isOpen,
  onClose,
  onMovementCreated,
  initialName = '',
}: CreateCustomMovementModalProps) {
  const [name, setName] = useState(initialName);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [trackingType, setTrackingType] = useState<TrackingType | ''>('');
  const [customRestTimer, setCustomRestTimer] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  const createUserMovementMutation = useCreateUserMovement();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Reset form when modal opens/closes or initialName changes
  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
    } else {
      setName('');
      setSelectedMuscleGroups([]);
      setTrackingType('');
      setCustomRestTimer('');
      setPersonalNotes('');
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !trackingType || selectedMuscleGroups.length === 0) return;

    try {
      const newMovement = await createUserMovementMutation.mutateAsync({
        name: name.trim(),
        muscle_groups: selectedMuscleGroups,
        tracking_type: trackingType,
        custom_rest_timer: customRestTimer ? parseInt(customRestTimer) : null,
        personal_notes: personalNotes.trim() || null,
        template_id: null, // This is a custom movement
      });

      onMovementCreated(newMovement.id);
      handleClose();
    } catch (error) {
      console.error('Error creating custom movement:', error);
    }
  };

  const handleClose = () => {
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

  const FormContent = ({ className = "" }: { className?: string }) => (
    <div className={`space-y-4 min-h-0 ${className}`}>
      {/* Movement Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Movement name *</Label>
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
      <div className="space-y-2">
        <Label htmlFor="trackingType" className="text-sm font-medium text-muted-foreground">Tracking type *</Label>
        <Select value={trackingType} onValueChange={(value) => setTrackingType(value as TrackingType)}>
          <SelectTrigger className="px-4 py-3">
            <SelectValue placeholder="Select tracking type">
              {trackingType && TRACKING_TYPES.find(type => type.value === trackingType)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TRACKING_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value} className="px-3 py-2">
                <div className="text-left">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Muscle Groups */}
      <div className="space-y-2">
        <Label htmlFor="muscleGroups" className="text-sm font-medium text-muted-foreground">Muscle groups * ({selectedMuscleGroups.length} selected)</Label>
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
      <div className="space-y-2">
        <Label htmlFor="restTimer" className="text-sm font-medium text-muted-foreground">Custom rest timer (seconds)</Label>
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
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-muted-foreground">Personal notes</Label>
        <Textarea
          id="notes"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Any personal notes about this movement..."
          rows={3}
        />
      </div>
    </div>
  );

  const ActionButtons = () => (
    <div className="flex justify-between items-center pt-4 border-t">
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={!name.trim() || !trackingType || selectedMuscleGroups.length === 0 || createUserMovementMutation.isPending}
      >
        {createUserMovementMutation.isPending ? 'Creating...' : 'Create Movement'}
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
            <DialogTitle className="text-xl">Create custom movement</DialogTitle>
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
      <DrawerContent className="h-[95vh] flex flex-col">
        <DrawerHeader className="text-left flex-shrink-0">
          <DrawerTitle>Create custom movement</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4">
            <FormContent />
          </div>
          <DrawerFooter className="pt-2 flex-shrink-0">
            <ActionButtons />
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}