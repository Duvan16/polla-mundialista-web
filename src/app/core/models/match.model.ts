export interface MatchWithPredictionDto {
  matchId: string;
  groupName: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  myPredictedHomeGoals?: number;
  myPredictedAwayGoals?: number;
}
