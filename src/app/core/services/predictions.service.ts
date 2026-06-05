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

@Injectable({ providedIn: 'root' })
export class PredictionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/predictions`;

  getUpcoming(): Observable<MatchWithPredictionDto[]> {
    return this.http.get<MatchWithPredictionDto[]>(`${this.base}/upcoming`);
  }

  getMine(): Observable<PredictionResultDto[]> {
    return this.http.get<PredictionResultDto[]>(`${this.base}/mine`);
  }

  savePrediction(dto: CreatePredictionDto): Observable<PredictionResponseDto> {
    return this.http.post<PredictionResponseDto>(this.base, dto);
  }
}
