import { Button } from "@/components/Button";
import { useThemeColors } from "@hooks/useThemeColors";
import { Timer, Trash } from "lucide-react-native";
import { useEffect, useState } from "react";

interface TimedConfirmDeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  confirmTitle?: string;
  variant?: "default" | "icon";
  size?: number;
}

export function TimedConfirmDeleteButton({
  onConfirm,
  title = "Delete",
  confirmTitle = "Confirm Delete",
  variant = "default",
  size = 20,
}: TimedConfirmDeleteButtonProps) {
  const colors = useThemeColors();
  const [isConfirming, setIsConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isConfirming) {
      if (timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        // Time expired, revert state
        setIsConfirming(false);
        setTimeLeft(5);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConfirming, timeLeft]);

  const handlePress = () => {
    if (isConfirming) {
      onConfirm();
      setIsConfirming(false);
      setTimeLeft(5);
    } else {
      setIsConfirming(true);
      setTimeLeft(5);
    }
  };

  if (isConfirming) {
    if (variant === "icon") {
      return (
        <Button
          variant="destructive"
          size="lg"
          onPress={handlePress}
          className="flex-row items-center gap-2 justify-start"
          icon={<Timer size={size} color={colors.danger} />}
        >
          {confirmTitle} ({timeLeft})
        </Button>
      );
    }

    return (
      <Button
        variant="destructive"
        size="lg"
        onPress={handlePress}
        className="flex-row items-center gap-2 justify-start"
        icon={<Timer size={size} color={colors.danger} />}
      >
        {confirmTitle} ({timeLeft})
      </Button>
    );
  }

  if (variant === "icon") {
    return (
      <Button
        variant="destructive"
        size="lg"
        onPress={handlePress}
        className="flex-row items-center gap-2 justify-start"
        icon={<Trash size={size} color={colors.danger} />}
      >
        {title}
      </Button>
    );
  }

  return (
    <Button
      variant="destructive"
      size="lg"
      onPress={handlePress}
      className="flex-row items-center gap-2 justify-start"
      icon={<Trash size={size} color={colors.danger} />}
    >
      {title}
    </Button>
  );
}
