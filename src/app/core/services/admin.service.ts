import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatchWithPredictionDto } from '../models';

interface SetResultDto {
  homeGoals: number;
  awayGoals: number;
}

/** Handles admin-only API calls for reading matches and recording final results. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  /** Returns all matches with their current result status. Observable<MatchWithPredictionDto[]>. */
  getMatches(): Observable<MatchWithPredictionDto[]> {
    return this.http.get<MatchWithPredictionDto[]>(`${this.base}/matches`);
  }

  /** Saves or updates the final score for a match. Observable<void>. */
  setMatchResult(matchId: string, dto: SetResultDto): Observable<void> {
    return this.http.put<void>(`${this.base}/matches/${matchId}/result`, dto);
  }
}
