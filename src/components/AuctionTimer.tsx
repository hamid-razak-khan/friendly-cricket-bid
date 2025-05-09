
import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

interface AuctionTimerProps {
  durationSeconds: number;
  onTimeUp: () => void;
  isRunning: boolean;
  playerId?: string; // Optional player ID for server sync
}

const AuctionTimer: React.FC<AuctionTimerProps> = ({ 
  durationSeconds, 
  onTimeUp, 
  isRunning,
  playerId
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    // Listen for server timer updates if connected
    if (isConnected && socket && playerId) {
      socket.on(`timer-update-${playerId}`, (serverTimeLeft: number) => {
        if (isMounted) {
          setTimeLeft(serverTimeLeft);
        }
      });

      socket.on(`timer-complete-${playerId}`, () => {
        if (isMounted) {
          setTimeLeft(0);
          onTimeUp();
        }
      });
    }

    // Local timer as fallback or if not connected to server
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
      isMounted = false;
      if (timer) clearInterval(timer);
      if (socket && playerId) {
        socket.off(`timer-update-${playerId}`);
        socket.off(`timer-complete-${playerId}`);
      }
    };
  }, [isRunning, timeLeft, onTimeUp, socket, isConnected, playerId]);

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

  const getProgressColor = (): string => {
    if (timeLeft <= 5) return 'bg-cricket-red';
    if (timeLeft <= 15) return 'bg-cricket-gold';
    return 'bg-cricket-green';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium">Time Remaining</div>
      <div className={`text-4xl font-bold font-mono ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getProgressColor()}`}
          style={{ width: `${(timeLeft / durationSeconds) * 100}%` }}
        ></div>
      </div>
      
      {!isConnected && (
        <div className="text-xs text-gray-500 mt-1">
          Using local timer (server disconnected)
        </div>
      )}
    </div>
  );
};

export default AuctionTimer;
