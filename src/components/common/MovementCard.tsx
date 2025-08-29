'use client';

import { MovementTemplate } from '@/models/types';

interface MovementCardProps {
  movement: MovementTemplate;
  onClick?: (movement: MovementTemplate) => void;
  selected?: boolean;
}

export default function MovementCard({ movement, onClick, selected }: MovementCardProps) {
  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrackingTypeIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return '🏋️';
      case 'bodyweight':
        return '💪';
      case 'timed':
        return '⏱️';
      default:
        return '📊';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(movement);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{movement.name}</h3>
          <p className="text-gray-600 text-sm">{movement.muscleGroup}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getTrackingTypeIcon(movement.trackingType)}</span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getExperienceLevelColor(
              movement.experienceLevel
            )}`}
          >
            {movement.experienceLevel}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="capitalize">{movement.trackingType} exercise</span>
        {selected && (
          <div className="text-blue-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
