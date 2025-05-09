
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from "@/components/ui/use-toast";
import { Card } from '@/components/ui/card';

interface BidInterfaceProps {
  currentBid: number;
  minIncrement: number;
  onPlaceBid: (amount: number) => void;
  disabled?: boolean;
  teamBudget: number;
  playerId: string;
}

const BidInterface: React.FC<BidInterfaceProps> = ({ 
  currentBid, 
  minIncrement, 
  onPlaceBid,
  disabled = false,
  teamBudget,
  playerId
}) => {
  const [customBid, setCustomBid] = useState<number | ''>('');
  const { toast } = useToast();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  // Calculate next standard bid amounts
  const nextBid = currentBid + minIncrement;
  const nextPlus = currentBid + (minIncrement * 2);
  const nextBig = currentBid + (minIncrement * 5);

  // Effect to listen for remote bids
  useEffect(() => {
    if (socket && playerId) {
      const handleRemoteBid = (bidData: { amount: number; teamName: string }) => {
        // If someone else placed a bid, we'll get notified here
        if (bidData.teamName !== user?.teamName) {
          toast({
            title: "New bid placed!",
            description: `${bidData.teamName} bid ${formatCurrency(bidData.amount)}`,
          });
        }
      };

      socket.on(`bid-placed-${playerId}`, handleRemoteBid);
      
      return () => {
        socket.off(`bid-placed-${playerId}`);
      };
    }
  }, [socket, playerId, user?.teamName]);

  const handleBid = (amount: number) => {
    if (amount > teamBudget) {
      toast({
        title: "Insufficient Budget",
        description: "You don't have enough budget for this bid",
        variant: "destructive"
      });
      return;
    }
    
    // Emit bid to server if connected
    if (socket && isConnected && user?.teamName && playerId) {
      socket.emit('place-bid', {
        playerId,
        amount,
        teamName: user.teamName
      });
    }
    
    onPlaceBid(amount);
  };

  const handleCustomBid = () => {
    if (customBid === '' || isNaN(Number(customBid))) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const bidAmount = Number(customBid);
    
    if (bidAmount <= currentBid) {
      toast({
        title: "Bid Too Low",
        description: `Your bid must be higher than the current bid (${currentBid})`,
        variant: "destructive"
      });
      return;
    }

    handleBid(bidAmount);
    setCustomBid('');
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleBid(nextBid)}
            className="flex-1 bg-cricket-green hover:bg-opacity-90"
            disabled={disabled || nextBid > teamBudget}
          >
            {formatCurrency(nextBid)}
          </Button>
          <Button 
            onClick={() => handleBid(nextPlus)}
            className="flex-1 bg-cricket-green hover:bg-opacity-90"
            disabled={disabled || nextPlus > teamBudget}
          >
            {formatCurrency(nextPlus)}
          </Button>
          <Button 
            onClick={() => handleBid(nextBig)}
            className="flex-1 bg-cricket-green hover:bg-opacity-90"
            disabled={disabled || nextBig > teamBudget}
          >
            {formatCurrency(nextBig)}
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <div className="flex-1">
            <Label htmlFor="customBid" className="sr-only">Custom Bid</Label>
            <Input
              id="customBid"
              type="number"
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Enter amount"
              min={currentBid + 1}
              className="w-full"
              disabled={disabled}
            />
          </div>
          <Button 
            onClick={handleCustomBid}
            className="bg-cricket-blue hover:bg-cricket-lightBlue"
            disabled={disabled || customBid === '' || Number(customBid) > teamBudget}
          >
            Place Custom Bid
          </Button>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Current Bid: <span className="font-semibold">{formatCurrency(currentBid)}</span></span>
          <span>Min Increment: <span className="font-semibold">{formatCurrency(minIncrement)}</span></span>
        </div>
        
        {!isConnected && (
          <div className="text-xs text-amber-600 mt-1 text-center">
            Using offline mode - some features may be limited
          </div>
        )}
      </div>
    </Card>
  );
};

export default BidInterface;
