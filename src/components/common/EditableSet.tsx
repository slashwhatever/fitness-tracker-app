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
import { useAuth } from '@/lib/auth/AuthProvider';
import { Set, UserMovement, WeightUnit } from '@/models/types';
import { UserPreferences } from '@/utils/userPreferences';
import { Copy, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditableSetProps {
  set: Set;
  movement: UserMovement;
  onUpdate: (updatedSet: Set) => void;
  onDelete: (setId: string) => void;
  onDuplicate: (originalSet: Set) => void;
}

export default function EditableSet({
  set,
  movement,
  onUpdate,
  onDelete,
  onDuplicate,
}: EditableSetProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [reps, setReps] = useState(set.reps?.toString() || '');
  const [weight, setWeight] = useState(set.weight?.toString() || '');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState(set.distance?.toString() || '');
  const [notes, setNotes] = useState(set.notes || '');

  useEffect(() => {
    const loadWeightUnit = async () => {
      if (user?.id) {
        const unit = await UserPreferences.getWeightUnit(user.id);
        setWeightUnit(unit as WeightUnit);
      }
    };
    loadWeightUnit();
  }, [user?.id]);

  const handleSave = () => {
    const updatedSet: Set = {
      ...set,
      ...(movement.tracking_type === 'weight' && { 
        reps: reps ? Number(reps) : undefined, 
        weight: weight ? Number(weight) : undefined 
      }),
      ...(movement.tracking_type === 'bodyweight' && { 
        reps: reps ? Number(reps) : undefined 
      }),
      ...(movement.tracking_type === 'duration' && { 
        duration: duration ? Number(duration) : undefined 
      })
    };

    onUpdate(updatedSet);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setReps(set.reps?.toString() || '');
    setWeight(set.weight?.toString() || '');
    setDuration('');
    setIsEditing(false);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setIsEditing(open);
    if (open) {
      // Reset form values when opening the drawer
      setReps(set.reps?.toString() || '');
      setWeight(set.weight?.toString() || '');
      setDuration('');
    }
  };

  const isValidEdit = () => {
    switch (movement.tracking_type) {
      case 'weight':
        return reps && weight;
      case 'bodyweight':
        return reps;
      case 'duration':
        return duration;
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
      <div className="flex justify-between items-center p-4 bg-card border border-default rounded-lg hover:border-gray-300 transition-all cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleDateString()}
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      
        <div className="flex items-center space-x-6">
          {/* Set Data Display */}
          <div className="text-right">
            {movement.tracking_type === 'weight' && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-foreground">{set.weight}</span>
                <span className="text-sm text-muted-foreground">{weightUnit}</span>
                <span className="text-muted-foreground">×</span>
                <span className="text-xl font-semibold text-foreground">{set.reps}</span>
                <span className="text-sm text-muted-foreground">reps</span>
              </div>
            )}
            
            {movement.tracking_type === 'bodyweight' && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-foreground">{set.reps}</span>
                <span className="text-sm text-muted-foreground">reps</span>
              </div>
            )}
            
            {movement.tracking_type === 'duration' && set.duration && (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-foreground">{formatDuration(set.duration)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDuplicate}
              size="sm"
              className="bg-green-500 hover:bg-green-600 h-9"
            >
              <Copy className="w-4 h-4 mr-1" />
              Duplicate
            </Button>
            
            <Drawer open={isEditing} onOpenChange={handleDrawerOpenChange}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Edit Set</DrawerTitle>
                  <DrawerDescription>
                    Modify the values for this set from {new Date(set.created_at).toLocaleDateString()} at {new Date(set.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </DrawerDescription>
                </DrawerHeader>
                
                <div className="px-4 pb-4 space-y-6">
                  {movement.tracking_type === 'weight' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-weight">Weight</Label>
                        <Input
                          id="edit-weight"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="text-center text-lg"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-reps">Reps</Label>
                        <Input
                          id="edit-reps"
                          type="number"
                          value={reps}
                          onChange={(e) => setReps(e.target.value)}
                          className="text-center text-lg"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                  
                  {movement.tracking_type === 'bodyweight' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-reps">Reps</Label>
                      <Input
                        id="edit-reps"
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        className="text-center text-lg"
                        min="0"
                      />
                    </div>
                  )}
                  
                  {movement.tracking_type === 'duration' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-duration">Duration (seconds)</Label>
                      <Input
                        id="edit-duration"
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="text-center text-lg"
                        min="0"
                      />
                    </div>
                  )}
                </div>
                
                <DrawerFooter>
                  <Button
                    onClick={handleSave}
                    disabled={!isValidEdit()}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Save Changes
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
              onClick={() => onDelete(set.id)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500 h-9 w-9"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
