import { Badge } from "@/components/ui/badge";
import {
  getExperienceLevelVariant,
  getTrackingTypeIcon,
} from "@/lib/utils/typeHelpers";
import type { MovementTemplate, UserMovement } from "@/models/types";
import { Check } from "lucide-react";
import { Typography } from "./Typography";

interface MovementListItemProps {
  movement: UserMovement | MovementTemplate;
  isSelected: boolean;
  isSaving: boolean;
  onToggle: () => void;
}

export default function MovementListItem({
  movement,
  isSelected,
  isSaving,
  onToggle,
}: MovementListItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
        isSaving
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:bg-accent/50"
      } ${
        isSelected
          ? "bg-white dark:bg-white border-primary/50"
          : "border-border hover:border-accent-foreground/20"
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={isSelected ? "text-gray-900" : ""}>
              {getTrackingTypeIcon(movement.tracking_type, 16)}
            </div>
            <Typography
              variant="caption"
              className={`font-medium text-sm truncate ${
                isSelected ? "text-gray-900" : ""
              }`}
            >
              {movement.name}
            </Typography>
          </div>
          <Typography
            variant="footnote"
            className={`text-xs ${
              isSelected ? "text-gray-600" : "text-muted-foreground"
            }`}
          >
            {movement.muscle_groups?.join(", ") || "Unknown"}
          </Typography>
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-3">
        {!isSelected && (
          <Badge
            variant={getExperienceLevelVariant(movement.experience_level)}
            className="text-xs"
          >
            {movement.experience_level}
          </Badge>
        )}
        {isSelected && <Check className="w-5 h-5 text-green-600" />}
      </div>
    </div>
  );
}
