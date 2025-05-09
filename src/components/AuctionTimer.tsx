
import React, { useState, useEffect } from 'react';

interface AuctionTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ durationSeconds, onTimeUp, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(timer);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onTimeUp]);

  // Reset timer when duration changes (e.g., new player or bid)
  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on time left
  const getTimerColor = (): string => {
    if (timeLeft <= 5) return 'text-cricket-red';
    if (timeLeft <= 15) return 'text-cricket-gold';
    return 'text-cricket-green';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium">Time Remaining</div>
      <div className={`text-4xl font-bold font-mono ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getTimerColor().replace('text-', 'bg-')}`}
          style={{ width: `${(timeLeft / durationSeconds) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AuctionTimer;
