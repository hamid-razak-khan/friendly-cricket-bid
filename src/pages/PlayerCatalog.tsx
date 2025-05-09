
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import PlayerCard, { Player } from '../components/PlayerCard';
import { Search } from 'lucide-react';

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
  {
    id: '4',
    name: 'Kane Williamson',
    age: 31,
    role: 'Batsman',
    battingStyle: 'Right-handed',
    country: 'New Zealand',
    stats: {
      matches: 200,
      runs: 9000,
      battingAverage: 52.3,
      wickets: 10,
      bowlingAverage: 38.5,
    },
    basePrice: 170000,
  },
  {
    id: '5',
    name: 'Kagiso Rabada',
    age: 27,
    role: 'Bowler',
    bowlingStyle: 'Right-arm fast',
    country: 'South Africa',
    stats: {
      matches: 110,
      runs: 300,
      battingAverage: 9.5,
      wickets: 220,
      bowlingAverage: 22.5,
      economy: 7.2,
    },
    basePrice: 160000,
  },
  {
    id: '6',
    name: 'Shakib Al Hasan',
    age: 34,
    role: 'All-Rounder',
    battingStyle: 'Left-handed',
    bowlingStyle: 'Left-arm orthodox',
    country: 'Bangladesh',
    stats: {
      matches: 220,
      runs: 6500,
      battingAverage: 37.8,
      wickets: 280,
      bowlingAverage: 28.4,
      economy: 5.6,
    },
    basePrice: 150000,
  },
];

const PlayerCatalog = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter players based on search term and active tab
  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          player.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          player.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'batsmen') return matchesSearch && player.role.toLowerCase().includes('bat');
    if (activeTab === 'bowlers') return matchesSearch && player.role.toLowerCase().includes('bowl');
    if (activeTab === 'all-rounders') return matchesSearch && player.role.toLowerCase().includes('all');
    
    return matchesSearch;
  });

  return (
    <div className="cricket-container py-8">
      <h1 className="text-3xl font-bold text-cricket-blue mb-6">Player Catalog</h1>
      
      {/* Search and Filter */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by name, role, or country"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Players</TabsTrigger>
            <TabsTrigger value="batsmen">Batsmen</TabsTrigger>
            <TabsTrigger value="bowlers">Bowlers</TabsTrigger>
            <TabsTrigger value="all-rounders">All-Rounders</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Player Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredPlayers.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600">No players found matching your search.</p>
        </div>
      )}
      
      {/* CTA for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 bg-cricket-blue text-white p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-3">Ready to build your dream team?</h2>
          <p className="mb-4">Login or register to participate in the upcoming player auctions.</p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-cricket-blue">
              <a href="/login">Login</a>
            </Button>
            <Button className="bg-cricket-green text-white hover:bg-opacity-90">
              <a href="/register">Register</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCatalog;
