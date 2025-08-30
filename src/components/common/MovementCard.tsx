'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getExperienceLevelVariant, getTrackingTypeIcon } from '@/lib/utils/typeHelpers';
import { MovementTemplate } from '@/models/types';

interface MovementCardProps {
  movement: MovementTemplate;
  onClick?: (movement: MovementTemplate) => void;
  selected?: boolean;
}

export default function MovementCard({ movement, onClick, selected }: MovementCardProps) {

  const handleClick = () => {
    if (onClick) {
      onClick(movement);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{movement.name}</h3>
            <p className="text-muted-foreground text-sm">{movement.muscle_groups.join(', ')}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTrackingTypeIcon(movement.tracking_type)}</span>
            <Badge variant={getExperienceLevelVariant(movement.experience_level)}>
              {movement.experience_level}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="capitalize">{movement.tracking_type} exercise</span>
          {selected && (
            <div className="text-primary">
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
      </CardContent>
    </Card>
  );
}
