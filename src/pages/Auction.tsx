
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '../context/AuthContext';
import PlayerCard, { Player } from '../components/PlayerCard';
import AuctionTimer from '../components/AuctionTimer';
import BidInterface from '../components/BidInterface';
import TeamBudget from '../components/TeamBudget';

// Mock player data
const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Virat Kohli',
    age: 33,
    role: 'Batsman',
    battingStyle: 'Right-handed',
    country: 'India',
    stats: {
      matches: 254,
      runs: 12169,
      battingAverage: 59.07,
      wickets: 4,
      bowlingAverage: 41.25,
    },
    basePrice: 200000,
  },
  {
    id: '2',
    name: 'Jasprit Bumrah',
    age: 28,
    role: 'Bowler',
    bowlingStyle: 'Right-arm fast',
    country: 'India',
    stats: {
      matches: 120,
      runs: 200,
      battingAverage: 8.0,
      wickets: 250,
      bowlingAverage: 20.25,
      economy: 6.7,
    },
    basePrice: 180000,
  },
  {
    id: '3',
    name: 'Ben Stokes',
    age: 30,
    role: 'All-Rounder',
    battingStyle: 'Left-handed',
    bowlingStyle: 'Right-arm fast-medium',
    country: 'England',
    stats: {
      matches: 150,
      runs: 4500,
      battingAverage: 38.9,
      wickets: 175,
      bowlingAverage: 30.25,
      economy: 5.8,
    },
    basePrice: 190000,
  },
  // More players...
];

// Types
type AuctionStatus = 'waiting' | 'in-progress' | 'paused' | 'completed';
type Bid = {
  teamName: string;
  amount: number;
  timestamp: Date;
};

const Auction = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus>('in-progress');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentBids, setCurrentBids] = useState<Bid[]>([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [remainingBudget, setRemainingBudget] = useState(user?.budget || 1000000);
  const [spentBudget, setSpentBudget] = useState(0);
  const [auctionHistory, setAuctionHistory] = useState<{playerId: string, winner: string, amount: number}[]>([]);

  // Current auction data
  const currentPlayer = mockPlayers[currentPlayerIndex];
  const currentBid = currentBids.length > 0 
    ? currentBids[currentBids.length - 1].amount 
    : currentPlayer.basePrice;
  const highestBidder = currentBids.length > 0 
    ? currentBids[currentBids.length - 1].teamName 
    : null;
  const minBidIncrement = Math.max(10000, Math.floor(currentBid * 0.05));

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the auction",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Check if user has a team
  useEffect(() => {
    if (isAuthenticated && !user?.teamName) {
      toast({
        title: "Team Required",
        description: "You need to register a team to participate in the auction",
      });
      navigate('/');
    }
  }, [user, isAuthenticated, navigate]);

  // Handle bid placement
  const handlePlaceBid = (amount: number) => {
    if (!user?.teamName) {
      toast({
        title: "Team Required",
        description: "You must register a team to place bids",
        variant: "destructive"
      });
      return;
    }

    if (amount > remainingBudget) {
      toast({
        title: "Insufficient Budget",
        description: "You don't have enough budget to place this bid",
        variant: "destructive"
      });
      return;
    }

    // Add new bid
    const newBid: Bid = {
      teamName: user.teamName,
      amount,
      timestamp: new Date()
    };
    
    setCurrentBids([...currentBids, newBid]);
    
    // Reset timer on new bid
    setTimerRunning(false);
    setTimeout(() => setTimerRunning(true), 100);
    
    toast({
      title: "Bid Placed",
      description: `You bid ${formatCurrency(amount)} on ${currentPlayer.name}`,
    });
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    if (currentBids.length === 0) {
      toast({
        title: "No Bids",
        description: `${currentPlayer.name} remains unsold`,
      });
    } else {
      const winningBid = currentBids[currentBids.length - 1];
      toast({
        title: "Sold!",
        description: `${currentPlayer.name} sold to ${winningBid.teamName} for ${formatCurrency(winningBid.amount)}`,
      });
      
      // Add to auction history
      setAuctionHistory([
        ...auctionHistory, 
        { 
          playerId: currentPlayer.id, 
          winner: winningBid.teamName, 
          amount: winningBid.amount 
        }
      ]);
      
      // Update budget if current user won
      if (winningBid.teamName === user?.teamName) {
        const newRemaining = remainingBudget - winningBid.amount;
        const newSpent = spentBudget + winningBid.amount;
        setRemainingBudget(newRemaining);
        setSpentBudget(newSpent);
      }
    }
    
    // Move to next player
    if (currentPlayerIndex < mockPlayers.length - 1) {
      setCurrentPlayerIndex(prevIndex => prevIndex + 1);
      setCurrentBids([]);
    } else {
      setAuctionStatus('completed');
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated || !user?.teamName) {
    return null; // Redirect handled in useEffect
  }

  // If auction is completed
  if (auctionStatus === 'completed') {
    return (
      <div className="cricket-container py-8">
        <h1 className="text-3xl font-bold text-cricket-blue mb-6">Auction Completed</h1>
        <div className="bg-cricket-green bg-opacity-10 p-6 rounded-lg text-center mb-8">
          <h2 className="text-2xl font-semibold text-cricket-green mb-3">All players have been auctioned!</h2>
          <p className="mb-4">Thank you for participating in the auction. You can view your team in the team management section.</p>
          <Button 
            className="bg-cricket-blue hover:bg-cricket-lightBlue"
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Your Auction Summary</h2>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Card className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-3">Remaining Budget</h3>
            <p className="text-3xl font-bold text-cricket-blue">{formatCurrency(remainingBudget)}</p>
          </Card>
          <Card className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-3">Players Acquired</h3>
            <p className="text-3xl font-bold text-cricket-blue">
              {auctionHistory.filter(item => item.winner === user?.teamName).length}
            </p>
          </Card>
          <Card className="flex-1 p-4">
            <h3 className="text-lg font-semibold mb-3">Total Spent</h3>
            <p className="text-3xl font-bold text-cricket-blue">{formatCurrency(spentBudget)}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="cricket-container py-8">
      <h1 className="text-3xl font-bold text-cricket-blue mb-6">Live Auction</h1>
      
      {/* Main auction area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Current player */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Current Player</h2>
            <PlayerCard 
              player={currentPlayer} 
              inAuction={true} 
              currentBid={currentBid}
              highestBidder={highestBidder || undefined}
            />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Auction Timer</h2>
            <Card className="p-4">
              <AuctionTimer 
                durationSeconds={30} 
                onTimeUp={handleTimerComplete} 
                isRunning={timerRunning && auctionStatus === 'in-progress'}
              />
            </Card>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Place Your Bid</h2>
            <BidInterface 
              currentBid={currentBid} 
              minIncrement={minBidIncrement}
              onPlaceBid={handlePlaceBid}
              disabled={auctionStatus !== 'in-progress' || highestBidder === user?.teamName}
              teamBudget={remainingBudget}
            />
          </div>
        </div>
        
        {/* Right column - Budget and bid history */}
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Your Budget</h2>
            <TeamBudget 
              totalBudget={user?.budget || 1000000} 
              remainingBudget={remainingBudget}
              spentBudget={spentBudget}
            />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Bid History</h2>
            <Card>
              <CardContent className="p-4">
                {currentBids.length > 0 ? (
                  <div className="space-y-2">
                    {currentBids.slice().reverse().map((bid, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                        <span className={`font-medium ${bid.teamName === user?.teamName ? 'text-cricket-blue' : ''}`}>
                          {bid.teamName}
                        </span>
                        <span className="font-semibold">{formatCurrency(bid.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Next players preview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Coming Up Next</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockPlayers.slice(currentPlayerIndex + 1, currentPlayerIndex + 5).map((player) => (
            <div key={player.id} className="opacity-70 hover:opacity-100 transition-opacity">
              <PlayerCard player={player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Auction;
