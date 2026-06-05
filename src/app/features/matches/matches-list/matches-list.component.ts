import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { PredictionsService } from '../../../core/services/predictions.service';
import { MatchWithPredictionDto } from '../../../core/models';

type GroupedMatches = Record<string, MatchWithPredictionDto[]>;

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    DatePipe,
  ],
  template: `
    <h2>Upcoming Matches</h2>

    @if (loading()) {
      <div class="center"><mat-spinner /></div>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (matches().length === 0) {
      <p class="empty">No upcoming matches.</p>
    } @else {
      @for (group of groupNames(); track group) {
        <h3 class="group-label">Group {{ group }}</h3>
        @for (match of groupedMatches()[group]; track match.matchId) {
          <mat-card class="match-card">
            <mat-card-content>
              <div class="match-row">
                <span class="team">{{ match.homeTeam }}</span>
                <span class="vs">vs</span>
                <span class="team">{{ match.awayTeam }}</span>
                <span class="date">{{ match.matchDate | date:'MMM d, HH:mm' }}</span>
              </div>
              <div class="prediction-row">
                <mat-form-field appearance="outline" class="score-field">
                  <mat-label>Home</mat-label>
                  <input matInput type="number" min="0"
                    [value]="match.myPredictedHomeGoals ?? ''"
                    (change)="onGoalChange(match.matchId, 'home', $event)" />
                </mat-form-field>
                <span class="dash">—</span>
                <mat-form-field appearance="outline" class="score-field">
                  <mat-label>Away</mat-label>
                  <input matInput type="number" min="0"
                    [value]="match.myPredictedAwayGoals ?? ''"
                    (change)="onGoalChange(match.matchId, 'away', $event)" />
                </mat-form-field>
                <button mat-flat-button color="primary"
                  [disabled]="saving()[match.matchId]"
                  (click)="savePrediction(match.matchId)">
                  @if (saving()[match.matchId]) {
                    <mat-spinner diameter="16" />
                  } @else {
                    Save
                  }
                </button>
                @if (saved()[match.matchId]) {
                  <mat-chip color="accent">Saved!</mat-chip>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    }
  `,
  styles: [`
    h2 { margin-bottom: 16px; }
    .group-label { margin: 20px 0 8px; color: #555; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    .match-card { margin-bottom: 12px; }
    .match-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .team { font-weight: 500; font-size: 1rem; min-width: 120px; }
    .vs { color: #999; font-size: 0.85rem; }
    .date { margin-left: auto; color: #777; font-size: 0.85rem; }
    .prediction-row { display: flex; align-items: center; gap: 12px; }
    .score-field { width: 80px; }
    .dash { font-size: 1.2rem; color: #666; }
    .center { display: flex; justify-content: center; padding: 40px; }
    .error { color: red; }
    .empty { color: #777; }
  `],
})
export class MatchesListComponent implements OnInit {
  private svc = inject(PredictionsService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly matches = signal<MatchWithPredictionDto[]>([]);
  readonly saving = signal<Record<string, boolean>>({});
  readonly saved = signal<Record<string, boolean>>({});

  readonly groupedMatches = signal<GroupedMatches>({});
  readonly groupNames = signal<string[]>([]);

  private pendingGoals: Record<string, { home?: number; away?: number }> = {};

  ngOnInit(): void {
    this.svc.getUpcoming().subscribe({
      next: data => {
        this.matches.set(data);
        this.buildGroups(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load matches.');
        this.loading.set(false);
      },
    });
  }

  onGoalChange(matchId: string, side: 'home' | 'away', event: Event): void {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    if (!this.pendingGoals[matchId]) this.pendingGoals[matchId] = {};
    this.pendingGoals[matchId][side] = isNaN(val) ? undefined : val;
  }

  savePrediction(matchId: string): void {
    const pending = this.pendingGoals[matchId] ?? {};
    const match = this.matches().find(m => m.matchId === matchId);
    const home = pending.home ?? match?.myPredictedHomeGoals ?? 0;
    const away = pending.away ?? match?.myPredictedAwayGoals ?? 0;

    this.saving.update(s => ({ ...s, [matchId]: true }));

    this.svc.savePrediction({ matchId, predictedHomeGoals: home, predictedAwayGoals: away }).subscribe({
      next: () => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
        this.saved.update(s => ({ ...s, [matchId]: true }));
        setTimeout(() => this.saved.update(s => ({ ...s, [matchId]: false })), 2000);
      },
      error: () => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
      },
    });
  }

  private buildGroups(matches: MatchWithPredictionDto[]): void {
    const grouped: GroupedMatches = {};
    for (const m of matches) {
      if (!grouped[m.groupName]) grouped[m.groupName] = [];
      grouped[m.groupName].push(m);
    }
    this.groupedMatches.set(grouped);
    this.groupNames.set(Object.keys(grouped).sort());
  }
}
