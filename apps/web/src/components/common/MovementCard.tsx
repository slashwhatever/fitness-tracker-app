"use client";

import { useTrackingTypes } from "@/hooks/useTrackingTypes";
import {
  getExperienceLevelVariant,
  getTrackingTypeIcon,
} from "@/lib/utils/typeHelpers";
import { MovementTemplate } from "@/models/types";
import { Badge } from "@components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@components/ui/card";

interface MovementCardProps {
  movement: MovementTemplate;
  onClick?: (movement: MovementTemplate) => void;
  selected?: boolean;
}

export default function MovementCard({
  movement,
  onClick,
  selected,
}: MovementCardProps) {
  const { data: trackingTypes = [] } = useTrackingTypes();

  // Find the display name for the tracking type
  const trackingType = trackingTypes.find(
    (tt) => tt.name === movement.tracking_type
  );
  const trackingTypeDisplayName =
    trackingType?.display_name || movement.tracking_type;

  const handleClick = () => {
    if (onClick) {
      onClick(movement);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md py-0 ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              {getTrackingTypeIcon(movement.tracking_type, 18)} {movement.name}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Focus: {movement.muscle_groups?.join(", ") || "Unknown"}
            </CardDescription>
            <CardDescription className="text-muted-foreground text-sm">
              Tracking: {trackingTypeDisplayName}
            </CardDescription>
          </div>
          <Badge
            variant={getExperienceLevelVariant(movement.experience_level)}
            className="flex-shrink-0"
          >
            {movement.experience_level}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
