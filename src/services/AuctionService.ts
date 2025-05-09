
import { Player } from '../components/PlayerCard';
import { createMockSocket } from '../context/SocketContext';

export type AuctionStatus = 'waiting' | 'in-progress' | 'paused' | 'completed';

export type Bid = {
  teamName: string;
  amount: number;
  timestamp: Date;
  playerId: string;
};

export type AuctionResult = {
  playerId: string;
  winner: string;
  amount: number;
};

// This is a mock service that would normally connect to your backend
class AuctionService {
  private mockSocket: any;
  private _currentStatus: AuctionStatus = 'waiting';
  private _currentPlayerIndex = 0;
  private _players: Player[] = [];
  private _bids: Record<string, Bid[]> = {};
  private _auctionHistory: AuctionResult[] = [];
  private _listeners: Record<string, Array<(...args: any[]) => void>> = {};
  
  constructor() {
    this.mockSocket = createMockSocket();
    
    // Set up mock socket handlers
    this.mockSocket.on('place-bid', (data: { playerId: string, amount: number, teamName: string }) => {
      this.addBid(data.playerId, data.amount, data.teamName);
      
      // Emit the bid to all listeners
      this.mockSocket.emit(`bid-placed-${data.playerId}`, {
        amount: data.amount,
        teamName: data.teamName,
        timestamp: new Date()
      });
      
      // Reset timer on new bid
      this.mockSocket.emit(`timer-update-${data.playerId}`, 30);
    });
    
    // Initialize with some demo players
    this._players = [
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
      }
    ];
  }
  
  // Event emitter pattern
  on(event: string, callback: (...args: any[]) => void) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }
  
  off(event: string, callback: (...args: any[]) => void) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }
  
  emit(event: string, ...args: any[]) {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => callback(...args));
    }
  }
  
  // Getters
  get currentStatus(): AuctionStatus {
    return this._currentStatus;
  }
  
  get currentPlayer(): Player | null {
    return this._players[this._currentPlayerIndex] || null;
  }
  
  get players(): Player[] {
    return [...this._players];
  }
  
  get bids(): Record<string, Bid[]> {
    return { ...this._bids };
  }
  
  get auctionHistory(): AuctionResult[] {
    return [...this._auctionHistory];
  }
  
  // Methods for admin
  setAuctionStatus(status: AuctionStatus) {
    this._currentStatus = status;
    this.emit('status-change', status);
    return status;
  }
  
  addPlayer(player: Player) {
    this._players.push(player);
    this.emit('players-updated', this._players);
    return player;
  }
  
  updatePlayer(playerId: string, updates: Partial<Player>) {
    const index = this._players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      this._players[index] = { ...this._players[index], ...updates };
      this.emit('players-updated', this._players);
      return this._players[index];
    }
    return null;
  }
  
  removePlayer(playerId: string) {
    const index = this._players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      const removed = this._players.splice(index, 1)[0];
      this.emit('players-updated', this._players);
      return removed;
    }
    return null;
  }
  
  // Bidding methods
  addBid(playerId: string, amount: number, teamName: string) {
    if (!this._bids[playerId]) {
      this._bids[playerId] = [];
    }
    
    const newBid: Bid = {
      teamName,
      amount,
      timestamp: new Date(),
      playerId
    };
    
    this._bids[playerId].push(newBid);
    this.emit('bid-placed', newBid);
    return newBid;
  }
  
  getCurrentBids(playerId: string): Bid[] {
    return this._bids[playerId] || [];
  }
  
  getCurrentHighestBid(playerId: string): Bid | null {
    if (!this._bids[playerId] || this._bids[playerId].length === 0) {
      return null;
    }
    
    return this._bids[playerId][this._bids[playerId].length - 1];
  }
  
  // Auction flow methods
  moveToNextPlayer() {
    // Handle current player first
    const currentPlayer = this.currentPlayer;
    if (currentPlayer) {
      const highestBid = this.getCurrentHighestBid(currentPlayer.id);
      
      if (highestBid) {
        // Player sold
        this._auctionHistory.push({
          playerId: currentPlayer.id,
          winner: highestBid.teamName,
          amount: highestBid.amount
        });
        
        this.emit('player-sold', {
          player: currentPlayer,
          winner: highestBid.teamName,
          amount: highestBid.amount
        });
      } else {
        // Player unsold
        this.emit('player-unsold', currentPlayer);
      }
    }
    
    // Move to next player
    if (this._currentPlayerIndex < this._players.length - 1) {
      this._currentPlayerIndex++;
      this.emit('current-player-changed', this.currentPlayer);
      return this.currentPlayer;
    } else {
      // Auction completed
      this._currentStatus = 'completed';
      this.emit('status-change', 'completed');
      this.emit('auction-completed', this._auctionHistory);
      return null;
    }
  }
  
  resetAuction() {
    this._currentPlayerIndex = 0;
    this._bids = {};
    this._auctionHistory = [];
    this._currentStatus = 'waiting';
    this.emit('auction-reset');
    this.emit('status-change', 'waiting');
    this.emit('current-player-changed', this.currentPlayer);
    return true;
  }
}

// Singleton instance
export const auctionService = new AuctionService();
export default auctionService;
