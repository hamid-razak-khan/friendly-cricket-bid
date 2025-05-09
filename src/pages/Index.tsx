
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { user, isAuthenticated, registerTeam } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name",
        variant: "destructive"
      });
      return;
    }

    setIsRegistering(true);
    try {
      await registerTeam(teamName);
    } catch (error) {
      console.error('Error registering team:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="cricket-container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-cricket-blue mb-4">
            Cricket Auction Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build your dream team with strategic bidding in this interactive cricket auction platform for friendly tournaments.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Feature Card 1 */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-cricket-blue">Player Catalog</CardTitle>
              <CardDescription>Browse through the available cricket talent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Explore detailed profiles of players, including their statistics, specialties, and base prices.
              </p>
              <Button 
                className="w-full bg-cricket-blue hover:bg-cricket-lightBlue"
                onClick={() => navigate('/players')}
              >
                View Players
              </Button>
            </CardContent>
          </Card>
          
          {/* Feature Card 2 */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-cricket-blue">Live Auction</CardTitle>
              <CardDescription>Participate in real-time bidding</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Join the auction room to bid on players in real-time with countdown timers and competitive bidding.
              </p>
              <Button 
                className="w-full bg-cricket-blue hover:bg-cricket-lightBlue"
                onClick={() => navigate('/auction')}
              >
                Enter Auction
              </Button>
            </CardContent>
          </Card>
          
          {/* Feature Card 3 */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-cricket-blue">Team Management</CardTitle>
              <CardDescription>Build and manage your cricket squad</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Monitor your budget, track acquired players, and build a balanced team within your budget constraints.
              </p>
              <Button 
                className="w-full bg-cricket-blue hover:bg-cricket-lightBlue"
                disabled={!isAuthenticated || !user?.teamName}
                onClick={() => toast({
                  title: "Coming Soon",
                  description: "Team management will be available soon!"
                })}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Registration Section */}
        {isAuthenticated && !user?.teamName && (
          <div className="max-w-md mx-auto my-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-cricket-blue">Register Your Team</CardTitle>
                <CardDescription>Create a team to participate in the auction</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterTeam} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="teamName" className="text-sm font-medium">
                      Team Name
                    </label>
                    <Input
                      id="teamName"
                      placeholder="Enter your team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-cricket-green hover:bg-opacity-90"
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Registering...' : 'Register Team'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="bg-cricket-blue text-white p-8 rounded-lg shadow-lg my-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Join the Cricket Auction Today</h2>
            <p className="mb-6">
              Register now to create your team and participate in exciting player auctions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-cricket-blue"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              <Button
                className="bg-cricket-green text-white hover:bg-opacity-90"
                onClick={() => navigate('/register')}
              >
                Register Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
