import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MatchWithPredictionDto,
  PredictionResultDto,
  CreatePredictionDto,
  PredictionResponseDto,
} from '../models';

/** Handles prediction CRUD for the current user. */
@Injectable({ providedIn: 'root' })
export class PredictionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/predictions`;

  /**
   * Returns all 12 upcoming matches with the current user's existing prediction
   * prefilled on each entry (myPredictedHomeGoals / myPredictedAwayGoals).
   * Observable<MatchWithPredictionDto[]>.
   */
  getUpcoming(): Observable<MatchWithPredictionDto[]> {
    return this.http.get<MatchWithPredictionDto[]>(`${this.base}/upcoming`);
  }

  /** Returns all submitted predictions for the current user with results and points. Observable<PredictionResultDto[]>. */
  getMine(): Observable<PredictionResultDto[]> {
    return this.http.get<PredictionResultDto[]>(`${this.base}/mine`);
  }

  /** Creates or replaces the current user's prediction for a match. Observable<PredictionResponseDto>. */
  savePrediction(dto: CreatePredictionDto): Observable<PredictionResponseDto> {
    return this.http.post<PredictionResponseDto>(this.base, dto);
  }
}
