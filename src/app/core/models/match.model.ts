/** A match returned by /predictions/upcoming and /admin/matches, with the current user's prediction embedded. */
export interface MatchWithPredictionDto {
  matchId: string;
  groupName: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  /** Absent when the current user has not submitted a prediction yet. */
  myPredictedHomeGoals?: number;
  /** Absent when the current user has not submitted a prediction yet. */
  myPredictedAwayGoals?: number;
  isFinished?: boolean;
  /** Absent until the match is finished and an admin has set the result. */
  actualHomeGoals?: number;
  /** Absent until the match is finished and an admin has set the result. */
  actualAwayGoals?: number;
  /** Points earned by the current user for this match; absent until the match is finished. */
  pointsAwarded?: number;
}
