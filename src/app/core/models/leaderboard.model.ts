export interface LeaderboardEntryDto {
  rank: number;
  displayName: string;
  totalPoints: number;
  exactHits: number;
}

export interface UserHistoryItemDto {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  isFinished: boolean;
  pointsAwarded?: number;
}
