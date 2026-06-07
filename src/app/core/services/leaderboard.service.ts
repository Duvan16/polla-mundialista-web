import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntryDto, UserHistoryItemDto } from '../models';

/** Fetches leaderboard rankings and per-user prediction history. */
@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/leaderboard`;

  /** Returns all participants sorted by total points (tiebreaker: exact hits). Observable<LeaderboardEntryDto[]>. */
  getLeaderboard(): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(this.base);
  }

  /** Returns the full prediction history for a specific user. Observable<UserHistoryItemDto[]>. */
  getUserHistory(userId: string): Observable<UserHistoryItemDto[]> {
    return this.http.get<UserHistoryItemDto[]>(`${this.base}/users/${userId}/history`);
  }
}
