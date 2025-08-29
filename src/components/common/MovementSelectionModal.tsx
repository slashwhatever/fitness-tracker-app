'use client';

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
  const [customTrackingType, setCustomTrackingType] = useState<'weight' | 'bodyweight' | 'timed'>('weight');

  const filteredMovements = useMemo(() => {
    return movementLibrary.filter((movement) =>
      movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
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
      userId: 'user', // TODO: Get actual user ID
      templateId: template.id,
      name: template.name,
      muscleGroup: template.muscleGroup,
      trackingType: template.trackingType,
    }));

    onMovementsSelected(userMovements);
    handleClose();
  };

  const handleCreateCustomMovement = () => {
    if (!customName.trim() || !customMuscleGroup) return;

    const customMovement: UserMovement = {
      id: crypto.randomUUID(),
      userId: 'user', // TODO: Get actual user ID
      templateId: null, // Indicates custom movement
      name: customName.trim(),
      muscleGroup: customMuscleGroup,
      trackingType: customTrackingType,
    };

    onMovementsSelected([customMovement]);
    handleClose();
  };

  const handleClose = () => {
    setActiveTab('library');
    setSearchTerm('');
    setSelectedMovements(new Set());
    setCustomName('');
    setCustomMuscleGroup('');
    setCustomTrackingType('weight');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Movements to Workout</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select exercises from the library to add to your workout
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'library'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Movement Library
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Custom
            </button>
          </nav>
        </div>

        {/* Search - Only show for library tab */}
        {activeTab === 'library' && (
          <div className="p-6 border-b">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movements..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'library' ? (
            <>
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
                  <p className="text-gray-500">No movements found matching your search.</p>
                </div>
              )}
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Create Custom Movement</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Movement Name *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g., Bulgarian Split Squats"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Muscle Group *
                  </label>
                  <select
                    value={customMuscleGroup}
                    onChange={(e) => setCustomMuscleGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select muscle group</option>
                    {muscleGroups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Type *
                  </label>
                  <select
                    value={customTrackingType}
                    onChange={(e) => setCustomTrackingType(e.target.value as 'weight' | 'bodyweight' | 'timed')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {trackingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          {activeTab === 'library' ? (
            <>
              <div className="text-sm text-gray-600">
                {selectedMovements.size} movement{selectedMovements.size !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMovements}
                  disabled={selectedMovements.size === 0}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add {selectedMovements.size} Movement{selectedMovements.size !== 1 ? 's' : ''}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                Create a custom movement
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomMovement}
                  disabled={!customName.trim() || !customMuscleGroup}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Movement
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

