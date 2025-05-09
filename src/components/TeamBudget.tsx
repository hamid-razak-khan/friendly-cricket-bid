
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TeamBudgetProps {
  totalBudget: number;
  remainingBudget: number;
  spentBudget: number;
}

const TeamBudget: React.FC<TeamBudgetProps> = ({ totalBudget, remainingBudget, spentBudget }) => {
  // Calculate percentage of budget spent
  const spentPercentage = Math.round((spentBudget / totalBudget) * 100);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Determine budget status color
  const getBudgetColor = () => {
    if (remainingBudget <= totalBudget * 0.2) return 'text-cricket-red';
    if (remainingBudget <= totalBudget * 0.5) return 'text-cricket-gold';
    return 'text-cricket-green';
  };
  
  // Determine progress bar color
  const getProgressColor = () => {
    if (spentPercentage >= 80) return 'bg-cricket-red';
    if (spentPercentage >= 50) return 'bg-cricket-gold';
    return 'bg-cricket-green';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-cricket-blue">Team Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Total Budget:</span>
            <span className="font-semibold">{formatCurrency(totalBudget)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Spent:</span>
            <span className="font-semibold">{formatCurrency(spentBudget)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Remaining:</span>
            <span className={`font-bold ${getBudgetColor()}`}>
              {formatCurrency(remainingBudget)}
            </span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>Budget Used</span>
              <span>100%</span>
            </div>
            <Progress 
              value={spentPercentage} 
              className="h-2" 
              indicatorClassName={getProgressColor()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamBudget;
