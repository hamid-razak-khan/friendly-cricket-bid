
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from "socket.io-client";
import { useAuth } from './AuthContext';
import { useToast } from "@/components/ui/use-toast";

// For now, we'll use a mock socket connection
// In production, you would connect to your actual server
const SOCKET_URL = 'http://localhost:5000';
const USE_MOCK_SOCKET = true; // Set to true to use mock socket by default

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  reconnect: () => void;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  reconnect: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [useMockSocket, setUseMockSocket] = useState(USE_MOCK_SOCKET);

  const connectSocket = () => {
    if (!isAuthenticated || !user) return;

    // Disconnect any existing socket
    if (socket) {
      socket.disconnect();
    }

    // Use mock socket if real connection fails or mock mode is enabled
    if (useMockSocket) {
      console.log("Using mock socket connection");
      const mockSocket = createMockSocket();
      setSocket(mockSocket as unknown as Socket);
      setIsConnected(true);
      toast({
        title: "Simulated Connection",
        description: "Using simulated auction mode (no server required)."
      });
      return;
    }

    // Create a new socket connection
    const socketConnection = io(SOCKET_URL, {
      auth: {
        userId: user.id,
        teamName: user.teamName
      }
    });

    socketConnection.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      toast({
        title: "Connected to auction",
        description: "You're now connected to the live auction."
      });
    });

    socketConnection.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketConnection.on('connect_error', (err) => {
      console.error('Connection error:', err);
      
      // After repeated attempts, switch to mock socket
      setConnectionAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          // Switch to mock socket mode after 2 attempts
          setUseMockSocket(true);
          toast({
            title: "Simulated Mode Activated",
            description: "Using simulated auction mode (no server required)."
          });
        } else {
          toast({
            title: "Connection error",
            description: "Failed to connect to the auction server. Trying simulated mode.",
            variant: "destructive"
          });
        }
        return newCount;
      });
    });

    setSocket(socketConnection);
  };

  const reconnect = () => {
    // Reset connection attempts and try again
    setConnectionAttempts(0);
    setUseMockSocket(false);
    
    if (socket) {
      socket.disconnect();
    }
    connectSocket();
  };

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated, user?.id]);

  const value = {
    socket,
    isConnected,
    reconnect
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

// Mock socket for demo purposes (simulates real socket behavior)
export const createMockSocket = () => {
  const events: Record<string, Array<(data: any) => void>> = {};
  
  return {
    on: (event: string, callback: (data: any) => void) => {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
      return {
        off: () => {
          if (events[event]) {
            events[event] = events[event].filter(cb => cb !== callback);
          }
        }
      };
    },
    emit: (event: string, data: any) => {
      setTimeout(() => {
        if (events[event]) {
          events[event].forEach(callback => callback(data));
        }
      }, 100);
    },
    off: (event: string, callback?: (data: any) => void) => {
      if (!callback) {
        delete events[event];
      } else if (events[event]) {
        events[event] = events[event].filter(cb => cb !== callback);
      }
    },
    disconnect: () => {
      // Mock disconnect
    },
    id: 'mock-socket-id',
    connected: true
  };
};
