"use client";

import { Button } from "@/components/ui/button";
import { useTimer } from "@/contexts/TimerContext";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/useUserProfile";
import { Pause, Pin, PinOff, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimerBanner() {
  const {
    isActive,
    timeLeft,
    isPaused,
    isComplete,
    isWarning,
    progressPercentage,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    formatTime,
  } = useTimer();

  const { data: userProfile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const [isPinned, setIsPinned] = useState(true); // Default to true for SSR consistency

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile?.timer_pin_enabled !== undefined) {
      setIsPinned(userProfile.timer_pin_enabled);
    }
  }, [userProfile?.timer_pin_enabled]);

  // Handle pin toggle
  const handlePinToggle = async () => {
    const newPinState = !isPinned;
    setIsPinned(newPinState); // Optimistic update

    try {
      await updateProfileMutation.mutateAsync({
        timer_pin_enabled: newPinState,
      });
    } catch (error) {
      // Revert on error
      setIsPinned(!newPinState);
      console.error("Failed to update pin setting:", error);
    }
  };

  if (!isActive) return null;

  return (
    <div
      className={`relative w-full px-4 py-2 transition-colors duration-300 border-0 outline-none ${
        isComplete
          ? "bg-green-600 text-white"
          : isWarning
          ? "bg-yellow-500 text-black"
          : "bg-primary text-primary-foreground"
      } ${isPinned ? "sticky top-0 z-[60] shadow-sm" : ""}`}
    >
      <div className="flex items-center justify-between">
        {/* Time remaining - left aligned */}
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-lg font-bold ${
              isPaused ? "opacity-60" : ""
            }`}
          >
            {formatTime(Math.max(0, timeLeft))}
          </span>
          {isPaused && <span className="text-xs opacity-80">PAUSED</span>}
          {isComplete && (
            <span className="text-sm font-medium">REST COMPLETE!</span>
          )}
        </div>

        {/* Action buttons - right aligned */}
        <div className="flex items-center gap-1">
          <Button
            onClick={handlePinToggle}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
            title={isPinned ? "Unpin timer" : "Pin timer to top"}
          >
            {isPinned ? (
              <Pin className="h-4 w-4 text-green-500" />
            ) : (
              <PinOff className="h-4 w-4" />
            )}
          </Button>
          {!isComplete && (
            <>
              <Button
                onClick={isPaused ? resumeTimer : pauseTimer}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={resetTimer}
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}

          <Button
            onClick={skipTimer}
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar as bottom border */}
      <div
        className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${
          isComplete
            ? "bg-green-300"
            : isWarning
            ? "bg-yellow-300"
            : "bg-blue-500"
        }`}
        style={{ width: `${Math.min(100, progressPercentage)}%` }}
      />
    </div>
  );
}
