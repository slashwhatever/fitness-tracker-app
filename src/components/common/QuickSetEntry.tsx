'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No movement selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Log - {movement.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Weight tracking */}
          {(movement.tracking_type === 'weight' || movement.tracking_type === 'bodyweight') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reps">Reps</Label>
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
                />
              </div>
              {movement.tracking_type === 'weight' && (
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
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
                  />
                </div>
              )}
            </div>
          )}

          {/* Duration tracking */}
          {movement.tracking_type === 'duration' && (
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
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
              />
            </div>
          )}

          {/* Distance tracking */}
          {movement.tracking_type === 'distance' && (
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
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
              />
            </div>
          )}

          {/* Reps only */}
          {movement.tracking_type === 'reps_only' && (
            <div>
              <Label htmlFor="reps">Reps</Label>
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
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={setData.notes || ''}
              onChange={(e) => setSetData(prev => ({ 
                ...prev, 
                notes: e.target.value || null 
              }))}
              placeholder="How did it feel?"
              rows={2}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLogging}
            className="w-full flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLogging ? 'Logging...' : 'Log Set'}</span>
          </Button>
        </form>

        {lastSet && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Previous Set:</p>
            <p className="text-sm text-muted-foreground">
              {lastSet.reps && `${lastSet.reps} reps`}
              {lastSet.weight && ` × ${lastSet.weight} lbs`}
              {lastSet.duration && `${lastSet.duration}s`}
              {lastSet.distance && `${lastSet.distance} mi`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}