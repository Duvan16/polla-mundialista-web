import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LeaderboardEntryDto } from '../../../core/models';
import {
  UserHistoryDialogComponent,
  HistoryDialogData,
} from '../user-history-dialog/user-history-dialog.component';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TranslateModule,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-text">
          <h2 class="page-title">{{ 'leaderboard.title' | translate }}</h2>
          <p class="subtitle">{{ 'leaderboard.subtitle' | translate }}</p>
        </div>
        <div class="trophy-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 30 C14 30 10 20 10 12 L38 12 C38 20 34 30 24 30Z" fill="currentColor" opacity=".9"/>
            <path d="M10 12 L6 12 C6 20 10 24 14 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M38 12 L42 12 C42 20 38 24 34 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <rect x="20" y="30" width="8" height="6" fill="currentColor" opacity=".7"/>
            <rect x="16" y="36" width="16" height="3" rx="1.5" fill="currentColor" opacity=".8"/>
            <circle cx="24" cy="20" r="3" fill="white" opacity=".4"/>
          </svg>
        </div>
      </header>

      @if (loading()) {
        <mat-card class="table-card">
          <div class="skeleton-header" aria-hidden="true">
            @for (col of skeletonCols; track col) {
              <div class="skeleton-cell" [style.width]="col"></div>
            }
          </div>
          @for (row of skeletonRows; track row) {
            <div class="skeleton-row" aria-hidden="true">
              <div class="skeleton-bar rank-bar"></div>
              <div class="skeleton-bar name-bar"></div>
              <div class="skeleton-bar pts-bar"></div>
              <div class="skeleton-bar exact-bar"></div>
              <div class="skeleton-bar action-bar"></div>
            </div>
          }
        </mat-card>
      } @else if (error()) {
        <div class="state-box error-box" role="alert">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-stroked-button (click)="reload()">{{ 'leaderboard.retry' | translate }}</button>
        </div>
      } @else if (entries().length === 0) {
        <div class="state-box empty-box">
          <mat-icon>emoji_events</mat-icon>
          <p>{{ 'leaderboard.empty' | translate }}</p>
          <p class="hint">{{ 'leaderboard.emptyHint' | translate }}</p>
        </div>
      } @else {
        <mat-card class="table-card">
          <table mat-table [dataSource]="entries()" class="leaderboard-table" aria-label="Leaderboard">

            <ng-container matColumnDef="rank">
              <th mat-header-cell *matHeaderCellDef class="rank-col">{{ 'leaderboard.rankCol' | translate }}</th>
              <td mat-cell *matCellDef="let row" class="rank-col">
                @if (row.rank === 1) {
                  <span class="podium-badge gold" [title]="'leaderboard.medal.first' | translate" aria-label="1st place">🥇</span>
                } @else if (row.rank === 2) {
                  <span class="podium-badge silver" [title]="'leaderboard.medal.second' | translate" aria-label="2nd place">🥈</span>
                } @else if (row.rank === 3) {
                  <span class="podium-badge bronze" [title]="'leaderboard.medal.third' | translate" aria-label="3rd place">🥉</span>
                } @else {
                  <span class="rank-num">{{ row.rank }}</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="displayName">
              <th mat-header-cell *matHeaderCellDef>{{ 'leaderboard.playerCol' | translate }}</th>
              <td mat-cell *matCellDef="let row">
                <span class="player-name">{{ row.displayName }}</span>
                @if (row.displayName === currentUserName()) {
                  <span class="you-badge">{{ 'leaderboard.you' | translate }}</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="totalPoints">
              <th mat-header-cell *matHeaderCellDef class="num-col">{{ 'leaderboard.pointsCol' | translate }}</th>
              <td mat-cell *matCellDef="let row" class="num-col points-val">{{ row.totalPoints }}</td>
            </ng-container>

            <ng-container matColumnDef="exactHits">
              <th mat-header-cell *matHeaderCellDef class="num-col">{{ 'leaderboard.exactCol' | translate }}</th>
              <td mat-cell *matCellDef="let row" class="num-col exact-val">{{ row.exactHits }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                @if (row.userId === currentUserId()) {
                  <button mat-icon-button
                    class="history-btn"
                    [attr.aria-label]="'leaderboard.viewHistory' | translate"
                    (click)="openHistory($event, row)">
                    <mat-icon>bar_chart</mat-icon>
                  </button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"
              class="data-row"
              [class.current-user-row]="row.displayName === currentUserName()"
              [class.top-row]="row.rank <= 3"
              [class.rank-1-row]="row.rank === 1"
              [class.rank-2-row]="row.rank === 2"
              [class.rank-3-row]="row.rank === 3"
              [class.clickable-row]="row.userId === currentUserId()"
              (click)="openHistory($event, row)">
            </tr>
          </table>
        </mat-card>

        <p class="table-footer">{{ footerText() }}</p>
      }
    </div>
  `,
  styles: [`
    /* ── Page header ── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--sp-6);
      gap: var(--sp-4);
    }

    .header-text .page-title { margin-bottom: var(--sp-1); }

    .subtitle { margin: 0; color: var(--c-text-muted); font-size: var(--fs-sm); }

    .trophy-icon {
      width: 52px; height: 52px;
      flex-shrink: 0;
      color: var(--c-accent);
      opacity: .85;
    }

    /* ── Table card ── */
    .table-card { padding: 0 !important; overflow: hidden; }
    .leaderboard-table { width: 100%; }

    .rank-col  { width: 60px; text-align: center !important; }
    .num-col   { width: 84px; text-align: center !important; }

    /* Podium badges */
    .podium-badge { font-size: 1.5rem; line-height: 1; display: inline-block; }

    .rank-num { color: var(--c-text-muted); font-size: var(--fs-sm); font-weight: 600; }

    /* Player name */
    .player-name { font-weight: 600; font-size: var(--fs-base); color: var(--c-text); }

    .you-badge {
      display: inline-block;
      margin-left: var(--sp-2);
      padding: 1px 9px;
      background: var(--c-primary);
      color: var(--c-on-primary);
      border-radius: var(--r-full);
      font-family: var(--f-display);
      font-size: .65rem;
      font-weight: 700;
      letter-spacing: .8px;
      text-transform: uppercase;
      vertical-align: middle;
    }

    /* Points & exact */
    .points-val {
      font-family: var(--f-display) !important;
      font-weight: 800 !important;
      font-size: 1.1rem !important;
      color: var(--c-primary) !important;
    }

    .exact-val { color: var(--c-text-2) !important; font-weight: 500 !important; }

    /* Rows */
    .data-row { cursor: default; transition: background var(--trans-f); }
    .data-row:hover { background: var(--c-surface-2) !important; }
    .clickable-row { cursor: pointer; }

    .current-user-row { background: rgba(13,43,94,.06) !important; }
    .current-user-row:hover { background: rgba(13,43,94,.10) !important; }

    /* Podium row accents */
    .rank-1-row td:first-child { border-left: 3px solid #F5A623 !important; }
    .rank-2-row td:first-child { border-left: 3px solid #94A3B8 !important; }
    .rank-3-row td:first-child { border-left: 3px solid #CD7F32 !important; }

    .top-row .player-name { font-weight: 700; }
    .rank-1-row .points-val { color: #D48C17 !important; }

    /* History button */
    .history-btn { color: var(--c-text-muted) !important; }
    .history-btn:hover { color: var(--c-primary) !important; }

    /* Skeleton loader */
    .skeleton-header {
      display: flex; align-items: center; gap: var(--sp-4);
      padding: var(--sp-4) var(--sp-6);
      border-bottom: 1px solid var(--c-border);
    }
    .skeleton-cell { height: 13px; border-radius: var(--r-xs); background: var(--c-surface-2); }
    .skeleton-row  {
      display: flex; align-items: center; gap: var(--sp-4);
      padding: var(--sp-4) var(--sp-6);
      border-bottom: 1px solid var(--c-border);
    }
    .skeleton-bar {
      height: 16px;
      border-radius: var(--r-xs);
      background: linear-gradient(90deg,
        var(--c-surface-2) 25%,
        var(--c-border) 50%,
        var(--c-surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .rank-bar   { width: 28px; flex-shrink: 0; }
    .name-bar   { width: 140px; }
    .pts-bar    { width: 56px; }
    .exact-bar  { width: 48px; }
    .action-bar { width: 32px; border-radius: 50%; }

    /* State boxes */
    .state-box {
      display: flex; flex-direction: column;
      align-items: center; gap: var(--sp-3);
      padding: var(--sp-16) var(--sp-6);
      text-align: center;
    }
    .state-box mat-icon { font-size: 52px; width: 52px; height: 52px; }
    .state-box p { margin: 0; }

    .error-box { color: var(--c-error); }
    .error-box mat-icon { color: var(--c-error); }

    .empty-box { color: var(--c-text-muted); }
    .empty-box mat-icon { color: var(--c-border-s); }
    .hint { font-size: var(--fs-xs); color: var(--c-text-muted); }

    /* Footer */
    .table-footer {
      margin: var(--sp-3) 0 0;
      text-align: right;
      font-size: var(--fs-xs);
      color: var(--c-text-muted);
    }

    @media (max-width: 480px) {
      .trophy-icon { display: none; }
    }
  `],
})
export class LeaderboardPageComponent implements OnInit {
  private svc = inject(LeaderboardService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly entries = signal<LeaderboardEntryDto[]>([]);

  readonly currentUserName = computed(() => this.auth.user()?.displayName ?? '');
  readonly currentUserId = computed(() => this.auth.user()?.userId ?? '');

  readonly footerText = computed(() => {
    const count = this.entries().length;
    const key = count === 1 ? 'leaderboard.footerOne' : 'leaderboard.footerMany';
    return this.translate.instant(key, { count });
  });

  readonly columns = ['rank', 'displayName', 'totalPoints', 'exactHits', 'actions'];
  readonly skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly skeletonCols = ['40px', '160px', '70px', '60px', '40px'];

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.fetchLeaderboard();
  }

  openHistory(event: Event, entry: LeaderboardEntryDto): void {
    if (entry.userId !== this.currentUserId()) return;
    event.stopPropagation();
    const data: HistoryDialogData = {
      userId: entry.userId,
      displayName: entry.displayName,
    };
    this.dialog.open(UserHistoryDialogComponent, {
      data,
      width: '620px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
    });
  }

  private fetchLeaderboard(): void {
    this.svc.getLeaderboard().subscribe({
      next: data => { this.entries.set(data); this.loading.set(false); },
      error: () => {
        this.error.set(this.translate.instant('leaderboard.errorLoad'));
        this.loading.set(false);
      },
    });
  }
}
