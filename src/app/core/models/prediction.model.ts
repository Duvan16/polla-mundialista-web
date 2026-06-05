export interface PredictionResultDto {
  predictionId: string;
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

export interface CreatePredictionDto {
  matchId: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}

export interface PredictionResponseDto {
  predictionId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}
