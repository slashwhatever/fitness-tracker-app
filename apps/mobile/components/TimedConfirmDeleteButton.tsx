import { Timer, Trash } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

interface TimedConfirmDeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  confirmTitle?: string;
}

export function TimedConfirmDeleteButton({
  onConfirm,
  title = "Delete",
  confirmTitle = "Confirm Delete",
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
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 bg-red-500 rounded-xl gap-4"
        onPress={handlePress}
      >
        <Timer size={20} color="#ffffff" />
        <Text className="text-white font-medium text-lg flex-1">
          {confirmTitle} ({timeLeft})
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-red-500/10 rounded-xl gap-4"
      onPress={handlePress}
    >
      <Trash size={20} color="#ef4444" />
      <Text className="text-red-500 font-medium text-lg flex-1">{title}</Text>
    </TouchableOpacity>
  );
}
