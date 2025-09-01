'use client';

import { useCallback, useEffect, useState } from 'react';

interface RestTimerProps {
  isActive: boolean;
  duration: number; // in seconds
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ isActive, duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const showNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Rest Complete!', {
        body: 'Time for your next set',
        icon: '/favicon.ico'
      });
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio notification not available:', error);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
      setHasNotified(false);
      setIsPaused(false);
      requestNotificationPermission();
    } else {
      // When timer becomes inactive, reset all state
      setTimeLeft(duration);
      setHasNotified(false);
      setIsPaused(false);
    }
  }, [isActive, duration, requestNotificationPermission]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    if (timeLeft <= 0) {
      if (!hasNotified) {
        showNotification();
        playNotificationSound();
        setHasNotified(true);
        onComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, isPaused, hasNotified, showNotification, playNotificationSound, onComplete]);

  const handleSkip = () => {
    setTimeLeft(0);
    onSkip();
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setHasNotified(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;
  const isComplete = timeLeft <= 0;
  const isWarning = timeLeft <= 10 && timeLeft > 0;

  if (!isActive) return null;

  return (
    <div className={`bg-slate-800 rounded-lg shadow-md p-6 border-2 transition-colors ${
      isComplete ? 'border-green-500 bg-green-900' : 
      isWarning ? 'border-yellow-500 bg-yellow-900' : 
      'border-blue-500'
    }`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">
          {isComplete ? 'Rest Complete!' : 'Rest Timer'}
        </h3>
        
        <div className={`text-6xl font-bold mb-4 ${
          isComplete ? 'text-green-600' : 
          isWarning ? 'text-yellow-600' : 
          'text-blue-600'
        }`}>
          {formatTime(Math.max(0, timeLeft))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isComplete ? 'bg-green-500' : 
              isWarning ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isComplete && (
            <>
              <button
                onClick={togglePause}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </>
          )}
          <button
            onClick={handleSkip}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isComplete ? 'Continue' : 'Skip'}
          </button>
        </div>

        {isPaused && (
          <p className="text-sm text-gray-600 mt-2">Timer is paused</p>
        )}
      </div>
    </div>
  );
}
