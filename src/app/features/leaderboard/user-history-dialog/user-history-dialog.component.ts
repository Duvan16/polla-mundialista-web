import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { UserHistoryItemDto } from '../../../core/models';

export interface HistoryDialogData {
  userId: string;
  displayName: string;
}

@Component({
  selector: 'app-user-history-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    TranslateModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">person</mat-icon>
      {{ data.displayName }}{{ 'leaderboard.history.titleSuffix' | translate }}
    </h2>

    <mat-dialog-content>
      @if (loading()) {
        <div class="center">
          <mat-spinner diameter="48" />
          <p class="loading-text">{{ 'leaderboard.history.loadingText' | translate }}</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
        </div>
      } @else if (history().length === 0) {
        <div class="empty-state">
          <mat-icon>sports_soccer</mat-icon>
          <p>{{ 'leaderboard.history.empty' | translate }}</p>
        </div>
      } @else {
        <table mat-table [dataSource]="history()" class="history-table">
          <ng-container matColumnDef="match">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.matchCol' | translate }}</th>
            <td mat-cell *matCellDef="let h">
              <span class="match-label">{{ h.homeTeam }} vs {{ h.awayTeam }}</span>
              <span class="match-date">{{ h.matchDate | date:'MMM d' }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="prediction">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.predictionCol' | translate }}</th>
            <td mat-cell *matCellDef="let h" class="score-cell">
              {{ h.predictedHomeGoals }} – {{ h.predictedAwayGoals }}
            </td>
          </ng-container>

          <ng-container matColumnDef="result">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.resultCol' | translate }}</th>
            <td mat-cell *matCellDef="let h" class="score-cell">
              @if (h.isFinished) {
                {{ h.actualHomeGoals }} – {{ h.actualAwayGoals }}
              } @else {
                <span class="pending">{{ 'leaderboard.history.pending' | translate }}</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="points">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.ptsCol' | translate }}</th>
            <td mat-cell *matCellDef="let h">
              @if (h.pointsAwarded != null) {
                <span class="points-chip" [class.exact]="isExact(h)" [class.partial]="isPartial(h)">
                  {{ h.pointsAwarded }}
                </span>
              } @else {
                <span class="pending">—</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="summary-row">
          <span class="summary-label">{{ 'leaderboard.history.totalPoints' | translate }}</span>
          <span class="summary-value">{{ totalPoints() }}</span>
          <span class="summary-label ml">{{ 'leaderboard.history.exactHits' | translate }}</span>
          <span class="summary-value">{{ exactHits() }}</span>
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'leaderboard.history.close' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .title-icon { color: #3f51b5; }

    mat-dialog-content {
      min-width: 520px;
      max-height: 480px;
      padding: 0 24px;
    }

    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      gap: 16px;
    }
    .loading-text { color: #666; margin: 0; }

    .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 0;
      color: #888;
    }
    .error-state mat-icon, .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .error-state { color: #c62828; }

    .history-table {
      width: 100%;
      margin-top: 8px;
    }

    .match-label { display: block; font-weight: 500; }
    .match-date { display: block; font-size: 12px; color: #888; }

    .score-cell { font-family: monospace; font-size: 15px; font-weight: 600; }

    .pending { color: #aaa; font-size: 13px; }

    .points-chip {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 13px;
      background: #e0e0e0;
      color: #333;
    }
    .points-chip.exact { background: #c8e6c9; color: #1b5e20; }
    .points-chip.partial { background: #fff9c4; color: #f57f17; }

    .summary-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 0 4px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
    .summary-label { color: #666; font-size: 14px; }
    .summary-value { font-weight: 700; font-size: 16px; color: #3f51b5; }
    .ml { margin-left: 24px; }
  `],
})
export class UserHistoryDialogComponent implements OnInit {
  readonly data = inject<HistoryDialogData>(MAT_DIALOG_DATA);
  private svc = inject(LeaderboardService);
  private translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly history = signal<UserHistoryItemDto[]>([]);

  readonly columns = ['match', 'prediction', 'result', 'points'];

  readonly totalPoints = () =>
    this.history().reduce((sum, h) => sum + (h.pointsAwarded ?? 0), 0);

  readonly exactHits = () =>
    this.history().filter(h => this.isExact(h)).length;

  ngOnInit(): void {
    this.svc.getUserHistory(this.data.userId).subscribe({
      next: data => { this.history.set(data); this.loading.set(false); },
      error: () => {
        this.error.set(this.translate.instant('leaderboard.history.errorLoad'));
        this.loading.set(false);
      },
    });
  }

  isExact(h: UserHistoryItemDto): boolean {
    return h.isFinished &&
      h.actualHomeGoals === h.predictedHomeGoals &&
      h.actualAwayGoals === h.predictedAwayGoals;
  }

  isPartial(h: UserHistoryItemDto): boolean {
    return h.isFinished && (h.pointsAwarded ?? 0) > 0 && !this.isExact(h);
  }
}
