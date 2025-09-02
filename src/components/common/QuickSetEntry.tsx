'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { QuickSetEntryProps, SetData } from '@/models/types';
import { Save } from 'lucide-react';
import { useState } from 'react';

export default function QuickSetEntry({ 
  movement, 
  lastSet, 
  onQuickLog 
}: QuickSetEntryProps) {
  const [setData, setSetData] = useState<SetData>({
    reps: lastSet?.reps || null,
    weight: lastSet?.weight || null,
    duration: lastSet?.duration || null,
    distance: lastSet?.distance || null,
    notes: '',
  });
  const [isLogging, setIsLogging] = useState(false);

  const isFormValid = (): boolean => {
    if (!movement) return false;
    
    switch (movement.tracking_type) {
      case 'weight':
      case 'bodyweight':
        return setData.reps !== null && setData.reps > 0;
      case 'duration':
        return setData.duration !== null && setData.duration > 0;
      case 'distance':
        return setData.distance !== null && setData.distance > 0;
      case 'reps_only':
        return setData.reps !== null && setData.reps > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);
    
    try {
      await onQuickLog(setData);
      // Reset form after successful logging
      setSetData({
        reps: setData.reps, // Keep same values for next set
        weight: setData.weight,
        duration: setData.duration,
        distance: setData.distance,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to log set:', error);
    } finally {
      setIsLogging(false);
    }
  };

  if (!movement) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border-dashed border text-center">
        <p className="text-muted-foreground text-sm">No movement selected</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 bg-card rounded-lg border">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Weight tracking */}
        {(movement.tracking_type === 'weight' || movement.tracking_type === 'bodyweight') && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reps" className="text-xs sm:text-sm">Reps</Label>
              <Input
                id="reps"
                type="number"
                value={setData.reps || ''}
                onChange={(e) => setSetData(prev => ({ 
                  ...prev, 
                  reps: e.target.value ? parseInt(e.target.value) : null 
                }))}
                placeholder="0"
                min="0"
                className="text-center"
              />
            </div>
            {movement.tracking_type === 'weight' && (
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs sm:text-sm">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.25"
                  value={setData.weight || ''}
                  onChange={(e) => setSetData(prev => ({ 
                    ...prev, 
                    weight: e.target.value ? parseFloat(e.target.value) : null 
                  }))}
                  placeholder="0"
                  min="0"
                  className="text-center"
                />
              </div>
            )}
          </div>
        )}

        {/* Duration tracking */}
        {movement.tracking_type === 'duration' && (
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-xs sm:text-sm">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              value={setData.duration || ''}
              onChange={(e) => setSetData(prev => ({ 
                ...prev, 
                duration: e.target.value ? parseInt(e.target.value) : null 
              }))}
              placeholder="0"
              min="0"
              className="text-center"
            />
          </div>
        )}

        {/* Distance tracking */}
        {movement.tracking_type === 'distance' && (
          <div className="space-y-2">
            <Label htmlFor="distance" className="text-xs sm:text-sm">Distance (miles)</Label>
            <Input
              id="distance"
              type="number"
              step="0.01"
              value={setData.distance || ''}
              onChange={(e) => setSetData(prev => ({ 
                ...prev, 
                distance: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="0"
              min="0"
              className="text-center"
            />
          </div>
        )}

        {/* Reps only */}
        {movement.tracking_type === 'reps_only' && (
          <div className="space-y-2">
            <Label htmlFor="reps" className="text-xs sm:text-sm">Reps</Label>
            <Input
              id="reps"
              type="number"
              value={setData.reps || ''}
              onChange={(e) => setSetData(prev => ({ 
                ...prev, 
                reps: e.target.value ? parseInt(e.target.value) : null 
              }))}
              placeholder="0"
              min="0"
              className="text-center"
            />
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs sm:text-sm">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={setData.notes || ''}
            onChange={(e) => setSetData(prev => ({ 
              ...prev, 
              notes: e.target.value || null 
            }))}
            placeholder="How did it feel?"
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLogging || !isFormValid()}
          className="w-full flex items-center justify-center space-x-2 h-9"
        >
          <Save className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-sm">{isLogging ? 'Logging...' : 'Log Set'}</span>
        </Button>
      </form>

      {lastSet && (
        <div className="mt-3 p-2 bg-muted/30 rounded-md">
          <p className="text-xs font-medium mb-1">Previous Set:</p>
          <p className="text-xs text-muted-foreground">
            {lastSet.reps && `${lastSet.reps} reps`}
            {lastSet.weight && ` × ${lastSet.weight} lbs`}
            {lastSet.duration && `${lastSet.duration}s`}
            {lastSet.distance && `${lastSet.distance} mi`}
          </p>
        </div>
      )}
    </div>
  );
}