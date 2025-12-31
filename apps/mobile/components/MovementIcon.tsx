import { useThemeColors } from "@hooks/useThemeColors";
import {
  Dumbbell,
  PersonStanding,
  Ruler,
  Tally5,
  Timer,
} from "lucide-react-native";

interface MovementIconProps {
  trackingType?: string;
  size?: number;
  color?: string;
}

export function MovementIcon({
  trackingType,
  size = 20,
  color,
}: MovementIconProps) {
  const colors = useThemeColors();
  const iconColor = color || colors.tint;

  const getIcon = () => {
    switch (trackingType) {
      case "duration":
        return <Timer size={size} color={iconColor} />;
      case "reps":
        return <Tally5 size={size} color={iconColor} />;
      case "distance":
        return <Ruler size={size} color={iconColor} />;
      case "bodyweight":
        return <PersonStanding size={size} color={iconColor} />;
      case "weight":
        return <Dumbbell size={size} color={iconColor} />;
      default:
        return <Dumbbell size={size} color={iconColor} />;
    }
  };

  return getIcon();
}
