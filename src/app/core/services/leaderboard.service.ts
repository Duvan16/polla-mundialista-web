import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntryDto, UserHistoryItemDto } from '../models';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/leaderboard`;

  getLeaderboard(): Observable<LeaderboardEntryDto[]> {
    return this.http.get<LeaderboardEntryDto[]>(this.base);
  }

  getUserHistory(userId: string): Observable<UserHistoryItemDto[]> {
    return this.http.get<UserHistoryItemDto[]>(`${this.base}/users/${userId}/history`);
  }
}
