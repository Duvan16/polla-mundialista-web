/** One row in the leaderboard table, ranked by totalPoints (tiebreaker: exactHits). */
export interface LeaderboardEntryDto {
  userId: string;
  rank: number;
  displayName: string;
  totalPoints: number;
  /** Number of predictions where the exact score was guessed; used as tiebreaker. */
  exactHits: number;
}

/** One prediction entry in a user's history, shown in the UserHistoryDialogComponent. */
export interface UserHistoryItemDto {
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
  /** Points awarded for this prediction; absent until the match is finished. */
  pointsAwarded?: number;
}
