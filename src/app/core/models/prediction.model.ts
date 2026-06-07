/** A submitted prediction with the final result and points, returned by GET /predictions/mine. */
export interface PredictionResultDto {
  predictionId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  /** Absent until the match is finished. */
  actualHomeGoals?: number;
  /** Absent until the match is finished. */
  actualAwayGoals?: number;
  isFinished: boolean;
  /** Points earned; absent until the match is finished. */
  pointsAwarded?: number;
}

/** Payload for POST /predictions to create or replace a prediction. */
export interface CreatePredictionDto {
  matchId: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}

/** Server acknowledgement returned after a prediction is saved. */
export interface PredictionResponseDto {
  predictionId: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
}
