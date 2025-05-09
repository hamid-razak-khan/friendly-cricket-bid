
import { Player } from "../components/PlayerCard";

export interface User {
  id: string;
  username: string;
  teamName?: string;
  isAdmin: boolean;
  budget: number;
  token?: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  players: Player[];
  budget: number;
  spentAmount: number;
}

export interface AuctionSettings {
  bidTimeSeconds: number;
  minBidIncrement: number;
  maxTeams: number;
  startingBudget: number;
}

export type AuctionStatus = 'waiting' | 'in-progress' | 'paused' | 'completed';
