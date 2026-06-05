export interface MatchWithPredictionDto {
  matchId: string;
  groupName: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  myPredictedHomeGoals?: number;
  myPredictedAwayGoals?: number;
  isFinished?: boolean;
  actualHomeGoals?: number;
  actualAwayGoals?: number;
  pointsAwarded?: number;
}
