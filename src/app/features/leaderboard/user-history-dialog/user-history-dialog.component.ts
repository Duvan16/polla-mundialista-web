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
      <mat-icon class="title-icon" aria-hidden="true">bar_chart</mat-icon>
      {{ data.displayName }}{{ 'leaderboard.history.titleSuffix' | translate }}
    </h2>

    <mat-dialog-content>
      @if (loading()) {
        <div class="center" role="status" aria-live="polite">
          <mat-spinner diameter="44" />
          <p class="loading-text">{{ 'leaderboard.history.loadingText' | translate }}</p>
        </div>
      } @else if (error()) {
        <div class="state-col error-state" role="alert">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
        </div>
      } @else if (history().length === 0) {
        <div class="state-col empty-state">
          <mat-icon>sports_soccer</mat-icon>
          <p>{{ 'leaderboard.history.empty' | translate }}</p>
        </div>
      } @else {
        <table mat-table [dataSource]="history()" class="history-table" aria-label="Prediction history">
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
              {{ h.predictedHomeGoals }}&thinsp;–&thinsp;{{ h.predictedAwayGoals }}
            </td>
          </ng-container>

          <ng-container matColumnDef="result">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.resultCol' | translate }}</th>
            <td mat-cell *matCellDef="let h" class="score-cell">
              @if (h.isFinished) {
                {{ h.actualHomeGoals }}&thinsp;–&thinsp;{{ h.actualAwayGoals }}
              } @else {
                <span class="pending">{{ 'leaderboard.history.pending' | translate }}</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="points">
            <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.history.ptsCol' | translate }}</th>
            <td mat-cell *matCellDef="let h">
              @if (h.pointsAwarded != null) {
                <span class="pts-chip" [class.exact]="isExact(h)" [class.partial]="isPartial(h)">
                  {{ h.pointsAwarded }}
                </span>
              } @else {
                <span class="pending">—</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
          <tr mat-row *matRowDef="let row; columns: columns" class="hist-row"></tr>
        </table>

        <div class="summary-row">
          <span class="summary-label">{{ 'leaderboard.history.totalPoints' | translate }}</span>
          <span class="summary-value">{{ totalPoints() }}</span>
          <span class="summary-label sep">{{ 'leaderboard.history.exactHits' | translate }}</span>
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
      gap: var(--sp-2);
      margin: 0;
      font-family: var(--f-display) !important;
      font-weight: 700 !important;
      font-size: 1.3rem !important;
      color: var(--c-text) !important;
    }

    .title-icon { color: var(--c-primary) !important; }

    mat-dialog-content {
      min-width: min(520px, 90vw);
      max-height: 480px;
      padding: 0 var(--sp-6);
    }

    /* States */
    .center {
      display: flex; flex-direction: column; align-items: center;
      padding: var(--sp-12) 0; gap: var(--sp-4);
    }
    .loading-text { color: var(--c-text-muted); margin: 0; font-size: var(--fs-sm); }

    .state-col {
      display: flex; flex-direction: column;
      align-items: center; gap: var(--sp-2);
      padding: var(--sp-12) 0; color: var(--c-text-muted);
    }
    .state-col mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .error-state { color: var(--c-error) !important; }

    /* Table */
    .history-table { width: 100%; margin-top: var(--sp-2); }

    .hist-row { transition: background var(--trans-f); }
    .hist-row:hover { background: var(--c-surface-2) !important; }

    .match-label { display: block; font-weight: 600; font-size: var(--fs-base); color: var(--c-text); }
    .match-date  { display: block; font-size: var(--fs-xs); color: var(--c-text-muted); margin-top: 2px; }

    .score-cell {
      font-family: var(--f-display) !important;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--c-text);
      letter-spacing: .5px;
    }

    .pending { color: var(--c-text-muted); font-size: var(--fs-sm); }

    /* Points chip */
    .pts-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
      padding: 2px var(--sp-3);
      border-radius: var(--r-full);
      font-family: var(--f-display);
      font-weight: 700;
      font-size: .85rem;
      background: var(--c-surface-2);
      color: var(--c-text-2);
      border: 1px solid var(--c-border);
    }

    .pts-chip.exact {
      background: var(--c-success-bg);
      color: var(--c-success);
      border-color: rgba(26,138,71,.2);
    }

    .pts-chip.partial {
      background: rgba(245,166,35,.12);
      color: var(--c-accent-d);
      border-color: rgba(245,166,35,.3);
    }

    /* Summary */
    .summary-row {
      display: flex; align-items: center; gap: var(--sp-2);
      padding: var(--sp-3) 0 var(--sp-1);
      border-top: 1px solid var(--c-border);
      margin-top: var(--sp-2);
      flex-wrap: wrap;
    }

    .summary-label { color: var(--c-text-muted); font-size: var(--fs-sm); }
    .sep { margin-left: var(--sp-5); }

    .summary-value {
      font-family: var(--f-display);
      font-weight: 700;
      font-size: 1.1rem;
      color: var(--c-primary);
    }
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
