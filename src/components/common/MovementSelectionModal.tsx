'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { movementLibrary, muscleGroups, trackingTypes } from '@/data/movementLibrary';
import { UserMovement } from '@/models/types';
import { useMemo, useState } from 'react';
import MovementCard from './MovementCard';

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementsSelected: (movements: UserMovement[]) => void;
}

export default function MovementSelectionModal({
  isOpen,
  onClose,
  onMovementsSelected,
}: MovementSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovements, setSelectedMovements] = useState<Set<string>>(new Set());
  
  // Custom movement form state
  const [customName, setCustomName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');
  const [customTrackingType, setCustomTrackingType] = useState<'weight' | 'bodyweight' | 'duration'>('weight');

  const filteredMovements = useMemo(() => {
    return movementLibrary.filter((movement) =>
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleMovementToggle = (movementId: string) => {
    const newSelected = new Set(selectedMovements);
    if (newSelected.has(movementId)) {
      newSelected.delete(movementId);
    } else {
      newSelected.add(movementId);
    }
    setSelectedMovements(newSelected);
  };

  const handleAddMovements = () => {
    const selectedMovementTemplates = movementLibrary.filter(m => selectedMovements.has(m.id));
    const userMovements: UserMovement[] = selectedMovementTemplates.map(template => ({
      id: crypto.randomUUID(),
      user_id: 'user', // TODO: Get actual user ID
      template_id: template.id,
      name: template.name,
      muscle_group: template.muscle_group,
      tracking_type: template.tracking_type,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    onMovementsSelected(userMovements);
    handleClose();
  };

  const handleCreateCustomMovement = () => {
    if (!customName.trim() || !customMuscleGroup) return;

    const customMovement: UserMovement = {
      id: crypto.randomUUID(),
      user_id: 'user', // TODO: Get actual user ID
      template_id: null,
      name: customName.trim(),
      muscle_group: customMuscleGroup,
      tracking_type: customTrackingType,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onMovementsSelected([customMovement]);
    handleClose();
  };

  const handleClose = () => {
    setSelectedMovements(new Set());
    setSearchTerm('');
    setCustomName('');
    setCustomMuscleGroup('');
    setCustomTrackingType('weight');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Movements to Workout</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select exercises from the library to add to your workout
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'library' | 'custom')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Movement Library</TabsTrigger>
            <TabsTrigger value="custom">Create Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col space-y-4">
            <Input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMovements.map((movement) => (
                  <div key={movement.id} onClick={() => handleMovementToggle(movement.id)}>
                    <MovementCard
                      movement={movement}
                      selected={selectedMovements.has(movement.id)}
                    />
                  </div>
                ))}
              </div>
              
              {filteredMovements.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No movements found matching your search.</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {selectedMovements.size} movement{selectedMovements.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMovements}
                  disabled={selectedMovements.size === 0}
                >
                  Add {selectedMovements.size} Movement{selectedMovements.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 flex flex-col space-y-4">
            <div className="flex-1">
              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="movement-name">Movement Name *</Label>
                  <Input
                    id="movement-name"
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Bulgarian Split Squats"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscle-group">Muscle Group *</Label>
                  <Select value={customMuscleGroup} onValueChange={setCustomMuscleGroup}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking-type">Tracking Type *</Label>
                  <Select value={customTrackingType} onValueChange={(value) => setCustomTrackingType(value as 'weight' | 'bodyweight' | 'duration')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trackingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Create a custom movement
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomMovement}
                  disabled={!customName.trim() || !customMuscleGroup}
                >
                  Create Movement
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

