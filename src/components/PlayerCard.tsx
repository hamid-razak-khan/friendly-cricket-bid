
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type Player = {
  id: string;
  name: string;
  age: number;
  role: string;
  battingStyle?: string;
  bowlingStyle?: string;
  country: string;
  stats: {
    matches: number;
    runs?: number;
    battingAverage?: number;
    wickets?: number;
    bowlingAverage?: number;
    economy?: number;
  };
  basePrice: number;
  imageUrl?: string;
};

interface PlayerCardProps {
  player: Player;
  inAuction?: boolean;
  currentBid?: number;
  highestBidder?: string;
  onBid?: () => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  inAuction = false,
  currentBid,
  highestBidder,
  onBid
}) => {
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isBatsman = player.role.toLowerCase().includes('bat');
  const isBowler = player.role.toLowerCase().includes('bowl');
  const isAllRounder = player.role.toLowerCase().includes('all');

  return (
    <Card className={`card-hover ${inAuction ? 'auction-active' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-cricket-blue">{player.name}</CardTitle>
          <Badge variant={
            isBatsman ? "default" : 
            isBowler ? "secondary" : 
            isAllRounder ? "outline" : "default"
          }>
            {player.role}
          </Badge>
        </div>
        <div className="text-sm text-gray-500 flex justify-between">
          <span>{player.country}</span>
          <span>{player.age} years</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium">Matches</p>
            <p>{player.stats.matches}</p>
          </div>
          
          {isBatsman || isAllRounder ? (
            <>
              <div>
                <p className="font-medium">Runs</p>
                <p>{player.stats.runs}</p>
              </div>
              <div>
                <p className="font-medium">Batting Avg</p>
                <p>{player.stats.battingAverage}</p>
              </div>
              {player.battingStyle && (
                <div>
                  <p className="font-medium">Batting Style</p>
                  <p>{player.battingStyle}</p>
                </div>
              )}
            </>
          ) : null}
          
          {isBowler || isAllRounder ? (
            <>
              <div>
                <p className="font-medium">Wickets</p>
                <p>{player.stats.wickets}</p>
              </div>
              <div>
                <p className="font-medium">Bowling Avg</p>
                <p>{player.stats.bowlingAverage}</p>
              </div>
              {player.bowlingStyle && (
                <div>
                  <p className="font-medium">Bowling Style</p>
                  <p>{player.bowlingStyle}</p>
                </div>
              )}
            </>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch pt-0">
        <div className="flex justify-between items-center w-full mb-2">
          <span className="text-sm font-medium">Base Price:</span>
          <span className="font-bold text-cricket-blue">{formatCurrency(player.basePrice)}</span>
        </div>
        
        {inAuction && (
          <>
            <div className={`flex justify-between items-center w-full mb-4 ${currentBid ? 'highest-bid p-2 rounded-md' : ''}`}>
              <span className="text-sm font-medium">Current Bid:</span>
              <span className="font-bold">
                {currentBid ? formatCurrency(currentBid) : 'No bids yet'}
              </span>
            </div>
            {highestBidder && (
              <div className="flex justify-between items-center w-full mb-4">
                <span className="text-sm font-medium">Highest Bidder:</span>
                <span className="font-medium">{highestBidder}</span>
              </div>
            )}
            {onBid && (
              <button 
                onClick={onBid}
                className="w-full py-2 rounded-md bid-button"
              >
                Place Bid
              </button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlayerCard;
