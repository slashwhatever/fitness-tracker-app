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
import { Textarea } from '@/components/ui/textarea';

import { useCreateWorkout } from '@/hooks';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Workout } from '@/models/types';
import { useState } from 'react';

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCreated: (workout: Workout) => void;
}

export default function CreateWorkoutModal({
  isOpen,
  onClose,
  onWorkoutCreated,
}: CreateWorkoutModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createWorkoutMutation = useCreateWorkout();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      const savedWorkout = await createWorkoutMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
      });
      
      onWorkoutCreated(savedWorkout);
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Failed to create workout:', error);
    }
  };

  const FormContent = ({ className = "" }: { className?: string }) => (
    <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="title">
          Workout Title *
        </Label>
        <Input
          type="text"
          id="title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workout title"
          disabled={createWorkoutMutation.isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description (Optional)
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter workout description"
          rows={3}
          disabled={createWorkoutMutation.isPending}
        />
      </div>

      {isDesktop && (
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={createWorkoutMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createWorkoutMutation.isPending || !name.trim()}
            className="w-full sm:w-auto"
          >
            {createWorkoutMutation.isPending ? 'Creating...' : 'Create Workout'}
          </Button>
        </div>
      )}
      
      {!isDesktop && (
        <div className="pt-4">
          <Button
            type="submit"
            disabled={createWorkoutMutation.isPending || !name.trim()}
            className="w-full"
          >
            {createWorkoutMutation.isPending ? 'Creating...' : 'Create Workout'}
          </Button>
        </div>
      )}
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Workout</DialogTitle>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create New Workout</DrawerTitle>
        </DrawerHeader>
        <FormContent className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
