import { Timer, Trash } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

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
        <TouchableOpacity
          className="p-2 bg-red-500 rounded-full"
          onPress={handlePress}
        >
          <Timer size={size} color="#ffffff" />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        className="flex-row items-center p-4 bg-red-500 rounded-xl gap-4"
        onPress={handlePress}
      >
        <Timer size={size} color="#ffffff" />
        <Text className="text-white font-medium text-lg flex-1">
          {confirmTitle} ({timeLeft})
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === "icon") {
    return (
      <TouchableOpacity className="p-2" onPress={handlePress}>
        <Trash size={size} color="#ef4444" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-red-500/10 rounded-xl gap-4"
      onPress={handlePress}
    >
      <Trash size={size} color="#ef4444" />
      <Text className="text-red-500 font-medium text-lg flex-1">{title}</Text>
    </TouchableOpacity>
  );
}
