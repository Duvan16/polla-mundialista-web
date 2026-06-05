import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
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
  ],
  template: `
    <div class="page-header">
      <h2>Leaderboard</h2>
      <p class="subtitle">Rankings by total points. Exact score predictions earn bonus points.</p>
    </div>

    @if (loading()) {
      <mat-card class="table-card">
        <div class="skeleton-header">
          @for (col of skeletonCols; track col) {
            <div class="skeleton-cell" [style.width]="col"></div>
          }
        </div>
        @for (row of skeletonRows; track row) {
          <div class="skeleton-row">
            <div class="skeleton-bar rank-bar"></div>
            <div class="skeleton-bar name-bar"></div>
            <div class="skeleton-bar pts-bar"></div>
            <div class="skeleton-bar exact-bar"></div>
            <div class="skeleton-bar action-bar"></div>
          </div>
        }
      </mat-card>
    } @else if (error()) {
      <div class="state-box error-box">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-stroked-button (click)="reload()">Retry</button>
      </div>
    } @else if (entries().length === 0) {
      <div class="state-box empty-box">
        <mat-icon>emoji_events</mat-icon>
        <p>No predictions have been made yet.</p>
        <p class="hint">Be the first to submit your predictions!</p>
      </div>
    } @else {
      <mat-card class="table-card">
        <table mat-table [dataSource]="entries()" class="leaderboard-table">

          <ng-container matColumnDef="rank">
            <th mat-header-cell *matHeaderCellDef class="rank-col">#</th>
            <td mat-cell *matCellDef="let row" class="rank-col">
              @if (row.rank === 1) {
                <span class="medal gold" title="1st place">🥇</span>
              } @else if (row.rank === 2) {
                <span class="medal silver" title="2nd place">🥈</span>
              } @else if (row.rank === 3) {
                <span class="medal bronze" title="3rd place">🥉</span>
              } @else {
                <span class="rank-num">{{ row.rank }}</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="displayName">
            <th mat-header-cell *matHeaderCellDef>Player</th>
            <td mat-cell *matCellDef="let row">
              <span class="player-name">{{ row.displayName }}</span>
              @if (row.displayName === currentUserName()) {
                <span class="you-badge">You</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="totalPoints">
            <th mat-header-cell *matHeaderCellDef class="num-col">Points</th>
            <td mat-cell *matCellDef="let row" class="num-col points-val">{{ row.totalPoints }}</td>
          </ng-container>

          <ng-container matColumnDef="exactHits">
            <th mat-header-cell *matHeaderCellDef class="num-col">Exact</th>
            <td mat-cell *matCellDef="let row" class="num-col">{{ row.exactHits }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              @if (row.userId === currentUserId()) {
                <button mat-icon-button
                  class="history-btn"
                  title="View my predictions"
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
            [class.clickable-row]="row.userId === currentUserId()"
            (click)="openHistory($event, row)">
          </tr>
        </table>
      </mat-card>

      <p class="table-footer">{{ entries().length }} participant{{ entries().length !== 1 ? 's' : '' }} · Click your own row to view your predictions</p>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h2 { margin: 0 0 4px; font-size: 28px; font-weight: 700; }
    .subtitle { margin: 0; color: #666; font-size: 14px; }

    .table-card { padding: 0; overflow: hidden; }

    .leaderboard-table { width: 100%; }

    .rank-col { width: 56px; text-align: center; }
    .num-col { width: 80px; text-align: center; }

    .medal { font-size: 22px; line-height: 1; }
    .rank-num { color: #666; font-size: 15px; font-weight: 500; }

    .player-name { font-weight: 500; }
    .you-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 1px 8px;
      background: #3f51b5;
      color: #fff;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      vertical-align: middle;
    }

    .points-val { font-weight: 700; font-size: 16px; color: #3f51b5; }

    .data-row {
      cursor: default;
      transition: background 0.15s;
    }
    .data-row:hover { background: #f5f5f5; }
    .clickable-row { cursor: pointer; }
    .current-user-row { background: #e8eaf6 !important; }
    .current-user-row:hover { background: #dde1f5 !important; }
    .top-row td:first-child { border-left: 3px solid #3f51b5; }

    .history-btn { color: #9e9e9e; }
    .history-btn:hover { color: #3f51b5; }

    /* Skeleton loading */
    .skeleton-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }
    .skeleton-cell {
      height: 14px;
      border-radius: 4px;
      background: #e0e0e0;
    }
    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 24px;
      border-bottom: 1px solid #f5f5f5;
    }
    .skeleton-bar {
      height: 16px;
      border-radius: 4px;
      background: linear-gradient(90deg, #eeeeee 25%, #e0e0e0 50%, #eeeeee 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .rank-bar { width: 28px; flex-shrink: 0; }
    .name-bar { width: 140px; }
    .pts-bar { width: 60px; }
    .exact-bar { width: 50px; }
    .action-bar { width: 36px; border-radius: 50%; }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* State boxes */
    .state-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 24px;
      text-align: center;
    }
    .state-box mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
    }
    .state-box p { margin: 0; }
    .error-box { color: #c62828; }
    .error-box mat-icon { color: #c62828; }
    .empty-box { color: #757575; }
    .empty-box mat-icon { color: #bdbdbd; }
    .hint { font-size: 13px; color: #aaa !important; }

    .table-footer {
      margin: 12px 0 0;
      text-align: right;
      font-size: 13px;
      color: #aaa;
    }
  `],
})
export class LeaderboardPageComponent implements OnInit {
  private svc = inject(LeaderboardService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly entries = signal<LeaderboardEntryDto[]>([]);

  readonly currentUserName = computed(() => this.auth.user()?.displayName ?? '');
  readonly currentUserId = computed(() => this.auth.user()?.userId ?? '');

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
      error: () => { this.error.set('Failed to load leaderboard. Please try again.'); this.loading.set(false); },
    });
  }
}
