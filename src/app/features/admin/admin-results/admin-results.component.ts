import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService } from '../../../core/services/admin.service';
import { PredictionsService } from '../../../core/services/predictions.service';
import { MatchWithPredictionDto } from '../../../core/models';

@Component({
  selector: 'app-admin-results',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  template: `
    <h2>Set Match Results</h2>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (matches().length === 0) {
      <p class="empty">No matches available.</p>
    } @else {
      @for (match of matches(); track match.matchId) {
        <mat-card class="match-card">
          <mat-card-content>
            <div class="match-header">
              <span class="team">{{ match.homeTeam }}</span>
              <span class="vs">vs</span>
              <span class="team">{{ match.awayTeam }}</span>
              <mat-chip>{{ match.groupName }}</mat-chip>
            </div>
            <div class="result-row">
              <mat-form-field appearance="outline" class="score-field">
                <mat-label>Home Goals</mat-label>
                <input matInput type="number" min="0"
                  (change)="onGoalChange(match.matchId, 'home', $event)" />
              </mat-form-field>
              <span class="dash">—</span>
              <mat-form-field appearance="outline" class="score-field">
                <mat-label>Away Goals</mat-label>
                <input matInput type="number" min="0"
                  (change)="onGoalChange(match.matchId, 'away', $event)" />
              </mat-form-field>
              <button mat-flat-button color="warn"
                [disabled]="saving()[match.matchId]"
                (click)="setResult(match.matchId)">
                @if (saving()[match.matchId]) {
                  <mat-spinner diameter="16" />
                } @else {
                  Set Result
                }
              </button>
              @if (saved()[match.matchId]) {
                <mat-chip color="accent">Saved!</mat-chip>
              }
              @if (saveError()[match.matchId]) {
                <span class="error">{{ saveError()[match.matchId] }}</span>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    }
  `,
  styles: [`
    h2 { margin-bottom: 16px; }
    .match-card { margin-bottom: 12px; }
    .match-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .team { font-weight: 500; font-size: 1rem; }
    .vs { color: #999; }
    .result-row { display: flex; align-items: center; gap: 12px; }
    .score-field { width: 100px; }
    .dash { font-size: 1.2rem; color: #666; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .error { color: red; font-size: 0.85rem; }
    .empty { color: #777; }
  `],
})
export class AdminResultsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private predSvc = inject(PredictionsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly matches = signal<MatchWithPredictionDto[]>([]);
  readonly saving = signal<Record<string, boolean>>({});
  readonly saved = signal<Record<string, boolean>>({});
  readonly saveError = signal<Record<string, string>>({});

  private pendingGoals: Record<string, { home?: number; away?: number }> = {};

  ngOnInit(): void {
    this.predSvc.getUpcoming().subscribe({
      next: data => { this.matches.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load matches.'); this.loading.set(false); },
    });
  }

  onGoalChange(matchId: string, side: 'home' | 'away', event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!this.pendingGoals[matchId]) this.pendingGoals[matchId] = {};
    this.pendingGoals[matchId][side] = isNaN(val) ? undefined : val;
  }

  setResult(matchId: string): void {
    const g = this.pendingGoals[matchId] ?? {};
    if (g.home === undefined || g.away === undefined) {
      this.saveError.update(e => ({ ...e, [matchId]: 'Both goals are required.' }));
      return;
    }
    this.saving.update(s => ({ ...s, [matchId]: true }));
    this.saveError.update(e => ({ ...e, [matchId]: '' }));

    this.adminSvc.setMatchResult(matchId, { homeGoals: g.home!, awayGoals: g.away! }).subscribe({
      next: () => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
        this.saved.update(s => ({ ...s, [matchId]: true }));
        setTimeout(() => this.saved.update(s => ({ ...s, [matchId]: false })), 2000);
      },
      error: (err) => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
        this.saveError.update(e => ({
          ...e,
          [matchId]: err?.error?.error ?? 'Failed to set result.',
        }));
      },
    });
  }
}
