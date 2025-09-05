'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Movement, SetData, UserMovement } from '@/models/types';
import { Check, Minus, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

interface SetEntryFormProps {
  movement: UserMovement | Movement;
  initialData?: Partial<SetData>;
  onSave: (data: SetData) => Promise<void>;
  isLoading?: boolean;
  saveButtonText?: string;
}

export default function SetEntryForm({
  movement,
  initialData = {},
  onSave,
  isLoading = false,
  saveButtonText = "Save Set"
}: SetEntryFormProps) {
  const { data: userProfile } = useUserProfile();
  const [setData, setSetData] = useState<SetData>({
    reps: initialData.reps || null,
    weight: initialData.weight || null,
    duration: initialData.duration || null,
    distance: initialData.distance || null,
    notes: initialData.notes || '',
  });

  const weightUnit = userProfile?.weight_unit || 'lbs';
  const distanceUnit = userProfile?.distance_unit || 'miles';

  const getDistanceUnitAbbreviation = (unit: string) => {
    return unit === 'miles' ? 'mi' : 'km';
  };

  const adjustValue = (field: keyof SetData, delta: number) => {
    setSetData(prev => {
      const currentValue = prev[field] as number | null;
      const newValue = Math.max(0, (currentValue || 0) + delta);
      
      return {
        ...prev,
        [field]: newValue || null
      };
    });
  };

  const handleInputChange = useCallback((field: keyof SetData, value: string) => {
    setSetData(prev => ({
      ...prev,
      [field]: value === '' ? null : 
               field === 'notes' ? value : 
               field === 'reps' || field === 'duration' ? parseInt(value) || null :
               parseFloat(value) || null
    }));
  }, []);

  // Memoized event handlers to prevent input focus loss
  const handleRepsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('reps', e.target.value);
  }, [handleInputChange]);

  const handleWeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('weight', e.target.value);
  }, [handleInputChange]);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('duration', e.target.value);
  }, [handleInputChange]);

  const handleDistanceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('distance', e.target.value);
  }, [handleInputChange]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('notes', e.target.value);
  }, [handleInputChange]);

  // Focus handlers to select all text for easy overwriting
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  const isFormValid = (): boolean => {
    if (!movement) return false;
    
    switch (movement.tracking_type) {
      case 'weight':
      case 'bodyweight':
        return (setData.reps !== null && setData.reps > 0);
      case 'duration':
        return (setData.duration !== null && setData.duration > 0);
      case 'distance':
        return (setData.distance !== null && setData.distance > 0);
      case 'reps_only':
        return (setData.reps !== null && setData.reps > 0);
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      await onSave(setData);
    }
  };

  return (
    <div className="p-4 space-y-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reps and Weight Display */}
        {(movement.tracking_type === 'weight' || movement.tracking_type === 'bodyweight' || movement.tracking_type === 'reps_only') && (
          <div className="grid grid-cols-2 gap-4">
            {/* Reps */}
            <div className="space-y-3">
              <div className="text-center">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={setData.reps || ''}
                  onChange={handleRepsChange}
                  onFocus={handleFocus}
                  className="text-6xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  min="0"
                  placeholder="0"
                  style={{ 
                    fontSize: '4rem', 
                    lineHeight: '1',
                    border: 'none !important',
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }}
                />
                <div className="text-sm text-muted-foreground">rep{(setData.reps || 0) !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex justify-center items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue('reps', -1)}
                  className="h-12 w-12 rounded-full"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => adjustValue('reps', 1)}
                  className="h-12 w-12 rounded-full"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Weight (only for weight tracking) */}
            {movement.tracking_type === 'weight' && (
              <div className="space-y-3">
                <div className="text-center">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={setData.weight || ''}
                    onChange={handleWeightChange}
                    onFocus={handleFocus}
                    className="text-6xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 focus:outline-none focus:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    min="0"
                    step="any"
                    placeholder="0"
                    style={{ 
                    fontSize: '4rem', 
                    lineHeight: '1',
                    border: 'none !important',
                    outline: 'none !important',
                    boxShadow: 'none !important'
                  }}
                  />
                  <div className="text-sm text-muted-foreground">{weightUnit}</div>
                </div>
                <div className="flex justify-center items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustValue('weight', -1)}
                    className="h-12 w-12 rounded-full"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => adjustValue('weight', 1)}
                    className="h-12 w-12 rounded-full"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Duration Display */}
        {movement.tracking_type === 'duration' && (
          <div className="space-y-3">
            <div className="text-center">
              <Input
                type="number"
                inputMode="numeric"
                value={setData.duration || ''}
                onChange={handleDurationChange}
                onFocus={handleFocus}
                className="text-6xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                min="0"
                placeholder="0"
                style={{ fontSize: '4rem', lineHeight: '1' }}
              />
              <div className="text-sm text-muted-foreground">seconds</div>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue('duration', -5)}
                className="h-12 w-12 rounded-full"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue('duration', 5)}
                className="h-12 w-12 rounded-full"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Distance Display */}
        {movement.tracking_type === 'distance' && (
          <div className="space-y-3">
            <div className="text-center">
              <Input
                type="number"
                inputMode="decimal"
                value={setData.distance || ''}
                onChange={handleDistanceChange}
                onFocus={handleFocus}
                className="text-6xl font-light text-center bg-transparent border-none shadow-none focus:ring-0 focus:ring-offset-0 p-0 h-auto w-full [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                min="0"
                step="0.1"
                placeholder="0"
                style={{ fontSize: '4rem', lineHeight: '1' }}
              />
              <div className="text-sm text-muted-foreground">{getDistanceUnitAbbreviation(distanceUnit)}</div>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue('distance', -0.1)}
                className="h-12 w-12 rounded-full"
              >
                <Minus className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => adjustValue('distance', 0.1)}
                className="h-12 w-12 rounded-full"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-3">
          <Input
            type="text"
            value={setData.notes || ''}
            onChange={handleNotesChange}
            onFocus={handleFocus}
            placeholder="Add note"
            className="text-center text-lg bg-transparent border-0 border-b border-muted-foreground/30 rounded-none focus:border-primary focus:ring-0"
          />
        </div>

        {/* Save Button */}
          <Button
            type="submit"
            disabled={isLoading || !isFormValid()}
            className="w-full h-10 rounded-full bg-green-600 hover:bg-green-700 text-white text-base"
          >
            {isLoading ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="h-6 w-6 mr-2" />
                {saveButtonText}
              </>
            )}
          </Button>
      </form>
    </div>
  );
}