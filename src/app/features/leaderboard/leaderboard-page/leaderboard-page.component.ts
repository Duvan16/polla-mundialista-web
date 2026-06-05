import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LeaderboardEntryDto, UserHistoryItemDto } from '../../../core/models';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
  ],
  template: `
    <h2>Leaderboard</h2>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="entries()" class="full-width">
          <ng-container matColumnDef="rank">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let row">{{ row.rank }}</td>
          </ng-container>
          <ng-container matColumnDef="displayName">
            <th mat-header-cell *matHeaderCellDef>Player</th>
            <td mat-cell *matCellDef="let row">{{ row.displayName }}</td>
          </ng-container>
          <ng-container matColumnDef="totalPoints">
            <th mat-header-cell *matHeaderCellDef>Points</th>
            <td mat-cell *matCellDef="let row">{{ row.totalPoints }}</td>
          </ng-container>
          <ng-container matColumnDef="exactHits">
            <th mat-header-cell *matHeaderCellDef>Exact</th>
            <td mat-cell *matCellDef="let row">{{ row.exactHits }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button (click)="loadHistory(row)">
                <mat-icon>history</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"
            [class.current-user-row]="row.displayName === currentUserName()">
          </tr>
        </table>
      </mat-card>

      @if (selectedUser()) {
        <h3 class="history-title">{{ selectedUser() }}'s Predictions</h3>
        @if (historyLoading()) {
          <div class="center"><mat-spinner /></div>
        } @else if (historyError()) {
          <p class="error">{{ historyError() }}</p>
        } @else {
          <mat-card>
            <table mat-table [dataSource]="history()" class="full-width">
              <ng-container matColumnDef="match">
                <th mat-header-cell *matHeaderCellDef>Match</th>
                <td mat-cell *matCellDef="let h">{{ h.homeTeam }} vs {{ h.awayTeam }}</td>
              </ng-container>
              <ng-container matColumnDef="prediction">
                <th mat-header-cell *matHeaderCellDef>Prediction</th>
                <td mat-cell *matCellDef="let h">{{ h.predictedHomeGoals }} – {{ h.predictedAwayGoals }}</td>
              </ng-container>
              <ng-container matColumnDef="result">
                <th mat-header-cell *matHeaderCellDef>Result</th>
                <td mat-cell *matCellDef="let h">
                  @if (h.isFinished) {
                    {{ h.actualHomeGoals }} – {{ h.actualAwayGoals }}
                  } @else {
                    —
                  }
                </td>
              </ng-container>
              <ng-container matColumnDef="points">
                <th mat-header-cell *matHeaderCellDef>Pts</th>
                <td mat-cell *matCellDef="let h">{{ h.pointsAwarded ?? '—' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: historyColumns"></tr>
            </table>
          </mat-card>
        }
      }
    }
  `,
  styles: [`
    h2 { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .error { color: red; }
    .current-user-row { background: #e8f4fd; font-weight: 600; }
    .history-title { margin: 24px 0 12px; }
  `],
})
export class LeaderboardPageComponent implements OnInit {
  private svc = inject(LeaderboardService);
  private auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly entries = signal<LeaderboardEntryDto[]>([]);

  readonly selectedUser = signal<string | null>(null);
  readonly selectedUserId = signal<string | null>(null);
  readonly historyLoading = signal(false);
  readonly historyError = signal<string | null>(null);
  readonly history = signal<UserHistoryItemDto[]>([]);

  readonly currentUserName = computed(() => this.auth.user()?.displayName ?? '');

  readonly columns = ['rank', 'displayName', 'totalPoints', 'exactHits', 'actions'];
  readonly historyColumns = ['match', 'prediction', 'result', 'points'];

  ngOnInit(): void {
    this.svc.getLeaderboard().subscribe({
      next: data => { this.entries.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load leaderboard.'); this.loading.set(false); },
    });
  }

  loadHistory(entry: LeaderboardEntryDto & { userId?: string }): void {
    const userId = entry.userId ?? entry.displayName;
    this.selectedUser.set(entry.displayName);
    this.historyLoading.set(true);
    this.historyError.set(null);

    this.svc.getUserHistory(userId).subscribe({
      next: data => { this.history.set(data); this.historyLoading.set(false); },
      error: () => { this.historyError.set('History not found.'); this.historyLoading.set(false); },
    });
  }
}
