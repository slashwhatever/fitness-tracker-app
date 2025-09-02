'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
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
      <CardContent className="p-4 space-y-2">
        <CardTitle className="text-lg">{getTrackingTypeIcon(movement.tracking_type)} {movement.name}</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">{movement.muscle_groups?.join(', ') || 'Unknown'}</CardDescription>
        <CardDescription className="text-muted-foreground text-sm">
          {movement.tracking_type} exercise
        </CardDescription>
          <CardDescription className="text-muted-foreground text-sm">
            <Badge variant={getExperienceLevelVariant(movement.experience_level)}> 
            {movement.experience_level}
          </Badge>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
