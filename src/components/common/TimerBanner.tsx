'use client';

import { Button } from '@/components/ui/button';
import { useTimer } from '@/contexts/TimerContext';
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

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
    formatTime
  } = useTimer();

  if (!isActive) return null;

  return (
    <div 
      className={`relative w-full px-4 py-2 transition-colors duration-300 ${
        isComplete ? 'bg-green-600 text-white' : 
        isWarning ? 'bg-yellow-500 text-black' : 
        'bg-primary text-primary-foreground'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Time remaining - left aligned */}
        <div className="flex items-center gap-2">
          <span className={`font-mono text-lg font-bold ${isPaused ? 'opacity-60' : ''}`}>
            {formatTime(Math.max(0, timeLeft))}
          </span>
          {isPaused && (
            <span className="text-xs opacity-80">PAUSED</span>
          )}
          {isComplete && (
            <span className="text-sm font-medium">REST COMPLETE!</span>
          )}
        </div>

        {/* Action buttons - right aligned */}
        <div className="flex items-center gap-1">
          {!isComplete && (
            <>
              <Button
                onClick={isPaused ? resumeTimer : pauseTimer}
                variant="ghost"
                size="sm"
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
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            onClick={skipTimer}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/20 text-inherit"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar as bottom border */}
      <div 
        className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${
          isComplete ? 'bg-green-300' : 
          isWarning ? 'bg-yellow-300' : 
          'bg-blue-500'
        }`}
        style={{ width: `${Math.min(100, progressPercentage)}%` }}
      />
    </div>
  );
}