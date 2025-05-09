
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '../context/AuthContext';
import PlayerCard, { Player } from '../components/PlayerCard';
import { Plus, Edit, Timer, Settings } from 'lucide-react';

const AdminPanel = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock player data
  const [players, setPlayers] = useState<Player[]>([
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
  ]);

  // New player form state
  const [newPlayer, setNewPlayer] = useState<Partial<Player>>({
    name: '',
    age: 25,
    role: 'Batsman',
    country: 'India',
    basePrice: 100000,
    stats: {
      matches: 0,
      runs: 0,
      battingAverage: 0,
      wickets: 0,
      bowlingAverage: 0,
      economy: 0,
    }
  });

  // Auction control state
  const [auctionStatus, setAuctionStatus] = useState<'waiting' | 'in-progress' | 'paused' | 'completed'>('waiting');
  const [auctionSettings, setAuctionSettings] = useState({
    bidTimeSeconds: 30,
    minBidIncrement: 10000,
    maxTeams: 8,
    startingBudget: 1000000,
  });

  // Redirects
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to access the admin panel",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Handlers for player form
  const handleNewPlayerChange = (field: string, value: any) => {
    if (field.startsWith('stats.')) {
      const statField = field.split('.')[1];
      setNewPlayer({
        ...newPlayer,
        stats: {
          ...newPlayer.stats,
          [statField]: value
        }
      });
    } else {
      setNewPlayer({
        ...newPlayer,
        [field]: value
      });
    }
  };

  const handleAddPlayer = () => {
    // Validate form
    if (!newPlayer.name || !newPlayer.role || !newPlayer.country) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Create new player
    const playerToAdd: Player = {
      id: Date.now().toString(),
      name: newPlayer.name || '',
      age: newPlayer.age || 25,
      role: newPlayer.role || 'Batsman',
      country: newPlayer.country || '',
      battingStyle: newPlayer.battingStyle,
      bowlingStyle: newPlayer.bowlingStyle,
      stats: {
        matches: newPlayer.stats?.matches || 0,
        runs: newPlayer.stats?.runs || 0,
        battingAverage: newPlayer.stats?.battingAverage || 0,
        wickets: newPlayer.stats?.wickets || 0,
        bowlingAverage: newPlayer.stats?.bowlingAverage || 0,
        economy: newPlayer.stats?.economy || 0,
      },
      basePrice: newPlayer.basePrice || 100000,
    };

    // Add to players list
    setPlayers([...players, playerToAdd]);

    // Reset form
    setNewPlayer({
      name: '',
      age: 25,
      role: 'Batsman',
      country: 'India',
      basePrice: 100000,
      stats: {
        matches: 0,
        runs: 0,
        battingAverage: 0,
        wickets: 0,
        bowlingAverage: 0,
        economy: 0,
      }
    });

    toast({
      title: "Player Added",
      description: `${playerToAdd.name} has been added to the player catalog`
    });
  };

  // Handlers for auction controls
  const handleAuctionControl = (status: 'waiting' | 'in-progress' | 'paused' | 'completed') => {
    setAuctionStatus(status);
    
    const statusMessages = {
      'waiting': 'Auction is now in waiting state',
      'in-progress': 'Auction has started',
      'paused': 'Auction is now paused',
      'completed': 'Auction has been marked as completed'
    };
    
    toast({
      title: "Auction Status Updated",
      description: statusMessages[status]
    });
  };

  const handleSettingChange = (setting: string, value: number) => {
    setAuctionSettings({
      ...auctionSettings,
      [setting]: value
    });
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="cricket-container py-8">
      <h1 className="text-3xl font-bold text-cricket-blue mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="players">Player Management</TabsTrigger>
          <TabsTrigger value="auction">Auction Control</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Player Management Tab */}
        <TabsContent value="players">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add New Player */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus size={20} className="mr-2" />
                    Add New Player
                  </CardTitle>
                  <CardDescription>Add a new player to the auction catalog</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        value={newPlayer.name}
                        onChange={(e) => handleNewPlayerChange('name', e.target.value)}
                        placeholder="Player Name"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input 
                          id="age" 
                          type="number" 
                          value={newPlayer.age}
                          onChange={(e) => handleNewPlayerChange('age', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input 
                          id="country" 
                          value={newPlayer.country}
                          onChange={(e) => handleNewPlayerChange('country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select 
                        value={newPlayer.role} 
                        onValueChange={(value) => handleNewPlayerChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Batsman">Batsman</SelectItem>
                          <SelectItem value="Bowler">Bowler</SelectItem>
                          <SelectItem value="All-Rounder">All-Rounder</SelectItem>
                          <SelectItem value="Wicket-Keeper">Wicket-Keeper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Base Price</Label>
                        <Input 
                          id="basePrice" 
                          type="number"
                          value={newPlayer.basePrice}
                          onChange={(e) => handleNewPlayerChange('basePrice', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="matches">Matches</Label>
                        <Input 
                          id="matches" 
                          type="number"
                          value={newPlayer.stats?.matches}
                          onChange={(e) => handleNewPlayerChange('stats.matches', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    
                    {(newPlayer.role === 'Batsman' || newPlayer.role === 'All-Rounder' || newPlayer.role === 'Wicket-Keeper') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="runs">Runs</Label>
                          <Input 
                            id="runs" 
                            type="number"
                            value={newPlayer.stats?.runs}
                            onChange={(e) => handleNewPlayerChange('stats.runs', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="battingAvg">Batting Avg</Label>
                          <Input 
                            id="battingAvg" 
                            type="number"
                            step="0.01"
                            value={newPlayer.stats?.battingAverage}
                            onChange={(e) => handleNewPlayerChange('stats.battingAverage', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                    
                    {(newPlayer.role === 'Bowler' || newPlayer.role === 'All-Rounder') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wickets">Wickets</Label>
                          <Input 
                            id="wickets" 
                            type="number"
                            value={newPlayer.stats?.wickets}
                            onChange={(e) => handleNewPlayerChange('stats.wickets', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bowlingAvg">Bowling Avg</Label>
                          <Input 
                            id="bowlingAvg" 
                            type="number"
                            step="0.01"
                            value={newPlayer.stats?.bowlingAverage}
                            onChange={(e) => handleNewPlayerChange('stats.bowlingAverage', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      type="button" 
                      className="w-full bg-cricket-blue hover:bg-cricket-lightBlue"
                      onClick={handleAddPlayer}
                    >
                      Add Player
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Player List */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Player Catalog</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map(player => (
                  <div key={player.id} className="relative">
                    <PlayerCard player={player} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 bg-white"
                      onClick={() => toast({
                        title: "Feature Coming Soon",
                        description: "Player editing will be available in a future update"
                      })}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                ))}
                {players.length === 0 && (
                  <div className="col-span-2 text-center p-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">No players in the catalog yet. Add your first player.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Auction Control Tab */}
        <TabsContent value="auction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer size={20} className="mr-2" />
                Auction Control Panel
              </CardTitle>
              <CardDescription>Manage the live auction process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status Display */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Current Status:</span>
                    <span className={`font-bold ${
                      auctionStatus === 'in-progress' ? 'text-cricket-green' :
                      auctionStatus === 'paused' ? 'text-cricket-gold' :
                      auctionStatus === 'completed' ? 'text-cricket-red' :
                      'text-gray-500'
                    }`}>
                      {auctionStatus === 'waiting' ? 'Waiting to Start' :
                      auctionStatus === 'in-progress' ? 'In Progress' :
                      auctionStatus === 'paused' ? 'Paused' :
                      'Completed'}
                    </span>
                  </div>
                </div>
                
                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className={`${auctionStatus === 'in-progress' ? 'bg-gray-400 cursor-not-allowed' : 'bg-cricket-green'}`}
                    disabled={auctionStatus === 'in-progress'}
                    onClick={() => handleAuctionControl('in-progress')}
                  >
                    Start Auction
                  </Button>
                  <Button 
                    className={`${auctionStatus !== 'in-progress' ? 'bg-gray-400 cursor-not-allowed' : 'bg-cricket-gold'}`}
                    disabled={auctionStatus !== 'in-progress'}
                    onClick={() => handleAuctionControl('paused')}
                  >
                    Pause Auction
                  </Button>
                  <Button 
                    className={`${auctionStatus === 'completed' ? 'bg-gray-400 cursor-not-allowed' : 'bg-cricket-blue'}`}
                    disabled={auctionStatus === 'completed'}
                    onClick={() => handleAuctionControl('waiting')}
                  >
                    Reset to Waiting
                  </Button>
                  <Button 
                    className="bg-cricket-red hover:bg-opacity-90"
                    onClick={() => handleAuctionControl('completed')}
                  >
                    End Auction
                  </Button>
                </div>
                
                {/* Current Player (simplified) */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Current Auction</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Player:</span>
                      <span>Virat Kohli</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Bid:</span>
                      <span className="font-bold">₹ 350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Highest Bidder:</span>
                      <span>Super Kings</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Time Remaining:</span>
                      <span>00:15</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-cricket-gold"
                      onClick={() => toast({
                        title: "Control Feature",
                        description: "This feature will allow you to skip to the next player"
                      })}
                    >
                      Next Player
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast({
                        title: "Control Feature", 
                        description: "This feature will allow you to add 30 seconds to the timer"
                      })}
                    >
                      Add 30s
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings size={20} className="mr-2" />
                Auction Settings
              </CardTitle>
              <CardDescription>Configure auction parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bidTime">Bid Time (seconds)</Label>
                    <Input 
                      id="bidTime" 
                      type="number" 
                      value={auctionSettings.bidTimeSeconds}
                      onChange={(e) => handleSettingChange('bidTimeSeconds', parseInt(e.target.value))}
                      min={5}
                      max={60}
                    />
                    <p className="text-xs text-gray-500">Time allowed for bidding on each player (5-60 seconds)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minBid">Minimum Bid Increment</Label>
                    <Input 
                      id="minBid" 
                      type="number" 
                      value={auctionSettings.minBidIncrement}
                      onChange={(e) => handleSettingChange('minBidIncrement', parseInt(e.target.value))}
                      min={1000}
                      step={1000}
                    />
                    <p className="text-xs text-gray-500">Minimum amount that must be added to the current bid</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxTeams">Maximum Teams</Label>
                    <Input 
                      id="maxTeams" 
                      type="number" 
                      value={auctionSettings.maxTeams}
                      onChange={(e) => handleSettingChange('maxTeams', parseInt(e.target.value))}
                      min={2}
                      max={20}
                    />
                    <p className="text-xs text-gray-500">Maximum number of teams allowed in the auction</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startingBudget">Starting Team Budget</Label>
                    <Input 
                      id="startingBudget" 
                      type="number" 
                      value={auctionSettings.startingBudget}
                      onChange={(e) => handleSettingChange('startingBudget', parseInt(e.target.value))}
                      min={100000}
                      step={100000}
                    />
                    <p className="text-xs text-gray-500">Budget allocated to each team at the start</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-cricket-blue hover:bg-cricket-lightBlue"
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your auction settings have been updated"
                    });
                  }}
                >
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
