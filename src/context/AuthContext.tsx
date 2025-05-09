
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

// Define types
type User = {
  id: string;
  username: string;
  teamName: string | null;
  isAdmin: boolean;
  budget: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  registerTeam: (teamName: string) => Promise<void>;
};

// Mock API (in a real app, these would be API calls)
const mockLogin = async (username: string, password: string): Promise<User> => {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        resolve({
          id: '1',
          username: 'admin',
          teamName: 'Admin Team',
          isAdmin: true,
          budget: 1000000
        });
      } else if (username && password) {
        resolve({
          id: '2',
          username: username,
          teamName: null,
          isAdmin: false,
          budget: 1000000
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};

const mockRegister = async (username: string, password: string): Promise<User> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        username,
        teamName: null,
        isAdmin: false,
        budget: 1000000
      });
    }, 1000);
  });
};

const mockRegisterTeam = async (teamName: string): Promise<boolean> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1000);
  });
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('cricketAuctionUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('cricketAuctionUser');
      }
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('cricketAuctionUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('cricketAuctionUser');
    }
  }, [user]);

  const login = async (username: string, password: string) => {
    try {
      const loggedInUser = await mockLogin(username, password);
      setUser(loggedInUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const newUser = await mockRegister(username, password);
      setUser(newUser);
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Unable to create account",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const registerTeam = async (teamName: string) => {
    if (!user) throw new Error('User not logged in');
    
    try {
      const success = await mockRegisterTeam(teamName);
      if (success) {
        setUser({ ...user, teamName });
        toast({
          title: "Team registered",
          description: `Your team "${teamName}" has been registered`,
        });
      }
    } catch (error) {
      toast({
        title: "Team registration failed",
        description: "Unable to register team",
        variant: "destructive"
      });
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    register,
    logout,
    registerTeam,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
