import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SetResultDto {
  homeGoals: number;
  awayGoals: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  setMatchResult(matchId: string, dto: SetResultDto): Observable<void> {
    return this.http.put<void>(`${this.base}/matches/${matchId}/result`, dto);
  }
}
