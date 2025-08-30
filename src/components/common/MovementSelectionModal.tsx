'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multiselect';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { movementLibrary, muscleGroups, trackingTypes } from '@/data/movementLibrary';
import { formatTrackingType, getExperienceLevelVariant, getTrackingTypeIcon } from '@/lib/utils/typeHelpers';
import { MovementTemplate, TrackingType, UserMovement } from '@/models/types';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';

interface MovementSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMovementsSelected: (movements: UserMovement[]) => void;
}

const MovementListItem = ({ movement, selected, onToggle }: { 
  movement: MovementTemplate; 
  selected: boolean; 
  onToggle: () => void;
}) => {

  return (
    <div 
      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
        selected ? 'bg-primary/10 border-primary' : 'border-border hover:border-accent-foreground/20'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
          selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
        }`}>
          {selected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTrackingTypeIcon(movement.tracking_type)}</span>
            <h3 className="font-medium text-sm truncate">{movement.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{movement.muscle_groups.join(', ')}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-shrink-0">
        <Badge variant={getExperienceLevelVariant(movement.experience_level)} className="text-xs">
          {movement.experience_level}
        </Badge>
      </div>
    </div>
  );
};

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
  const [customMuscleGroups, setCustomMuscleGroups] = useState<string[]>([]);
  const [customTrackingType, setCustomTrackingType] = useState<TrackingType>('weight');

  const filteredMovements = useMemo(() => {
    return movementLibrary.filter((movement) =>
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.muscle_groups.some(group => group.toLowerCase().includes(searchTerm.toLowerCase()))
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
      muscle_groups: template.muscle_groups,
      tracking_type: template.tracking_type,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    onMovementsSelected(userMovements);
    handleClose();
  };

  const handleCreateCustomMovement = () => {
    if (!customName.trim() || customMuscleGroups.length === 0) return;

    const customMovement: UserMovement = {
      id: crypto.randomUUID(),
      user_id: 'user', // TODO: Get actual user ID
      template_id: null,
      name: customName.trim(),
      muscle_groups: customMuscleGroups,
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
    setCustomMuscleGroups([]);
    setCustomTrackingType('weight');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[85vh] w-[90vw] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Add Movements to Workout</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select exercises from the library to add to your workout
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'library' | 'custom')} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mb-4">
            <TabsTrigger value="library">Movement Library</TabsTrigger>
            <TabsTrigger value="custom">Create Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Search Bar */}
            <div className="flex-shrink-0">
              <Input
                type="text"
                placeholder="Search movements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Movement List */}
            <ScrollArea className="h-72 -mr-4 pr-4">
              <div className="space-y-2 pb-4">
                {filteredMovements.map((movement) => (
                  <MovementListItem
                    key={movement.id}
                    movement={movement}
                    selected={selectedMovements.has(movement.id)}
                    onToggle={() => handleMovementToggle(movement.id)}
                  />
                ))}
              </div>
              
              {filteredMovements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No movements found matching your search.</p>
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
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

          <TabsContent value="custom" className="flex-1 flex flex-col space-y-6 min-h-0">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md space-y-6">
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
                  <Label htmlFor="muscle-groups">Muscle Groups *</Label>
                  <MultiSelect
                    options={Array.from(muscleGroups).map(group => ({ value: group, label: group }))}
                    selected={customMuscleGroups}
                    onChange={setCustomMuscleGroups}
                    placeholder="Select muscle groups..."
                    emptyText="No muscle groups found."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tracking-type">Tracking Type *</Label>
                  <Select value={customTrackingType} onValueChange={(value) => setCustomTrackingType(value as TrackingType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trackingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatTrackingType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t bg-background">
              <div className="text-sm text-muted-foreground">
                Create a custom movement
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCustomMovement}
                  disabled={!customName.trim() || customMuscleGroups.length === 0}
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

