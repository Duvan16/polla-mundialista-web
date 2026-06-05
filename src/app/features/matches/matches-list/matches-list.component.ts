import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { PredictionsService } from '../../../core/services/predictions.service';
import { MatchWithPredictionDto } from '../../../core/models';
import { extractApiError } from '../../../core/utils/api-error';

type GoalForm = FormGroup<{
  home: FormControl<number | null>;
  away: FormControl<number | null>;
}>;

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
    MatIconModule,
    DatePipe,
  ],
  template: `
    <div class="page-container">
      <h2 class="page-title">My Predictions</h2>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else if (error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      } @else if (matches().length === 0) {
        <p class="empty">No matches available.</p>
      } @else {
        @for (group of groupNames(); track group) {
          <section class="group-section">
            <div class="group-header">
              <span class="group-label">Group {{ group }}</span>
            </div>
            @for (match of groupedMatches()[group]; track match.matchId) {
              <mat-card class="match-card" [class.is-finished]="match.isFinished">
                <mat-card-content>
                  <div class="match-header">
                    <div class="teams">
                      <span class="team">{{ match.homeTeam }}</span>
                      <span class="vs">vs</span>
                      <span class="team">{{ match.awayTeam }}</span>
                    </div>
                    <div class="meta">
                      <span class="date">{{ match.matchDate | date:'MMM d · HH:mm' }}</span>
                      @if (match.isFinished) {
                        <span class="status-chip">Finished</span>
                      }
                    </div>
                  </div>

                  @if (match.isFinished) {
                    <div class="finished-row">
                      <div class="score-block">
                        <span class="score-label">Your Prediction</span>
                        <span class="score-value">
                          {{ match.myPredictedHomeGoals ?? '—' }} – {{ match.myPredictedAwayGoals ?? '—' }}
                        </span>
                      </div>
                      <div class="score-block">
                        <span class="score-label">Result</span>
                        <span class="score-value actual">
                          {{ match.actualHomeGoals ?? '?' }} – {{ match.actualAwayGoals ?? '?' }}
                        </span>
                      </div>
                      <div class="points-block" [class.points-positive]="(match.pointsAwarded ?? 0) > 0">
                        <span class="points-value">{{ match.pointsAwarded ?? 0 }}</span>
                        <span class="points-unit">pts</span>
                      </div>
                    </div>
                  } @else {
                    <form class="prediction-form"
                      [formGroup]="matchForms[match.matchId]"
                      (ngSubmit)="savePrediction(match.matchId)">
                      <mat-form-field appearance="outline" class="score-field">
                        <mat-label>Home</mat-label>
                        <input matInput type="number" min="0" formControlName="home" />
                      </mat-form-field>
                      <span class="form-dash">–</span>
                      <mat-form-field appearance="outline" class="score-field">
                        <mat-label>Away</mat-label>
                        <input matInput type="number" min="0" formControlName="away" />
                      </mat-form-field>
                      <button mat-flat-button color="primary" type="submit"
                        [disabled]="saving()[match.matchId]">
                        @if (saving()[match.matchId]) {
                          <mat-spinner diameter="18" />
                        } @else {
                          Save
                        }
                      </button>
                    </form>
                  }
                </mat-card-content>
              </mat-card>
            }
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 720px; margin: 0 auto; padding: 24px 16px; }
    .page-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 24px; }

    .group-section { margin-bottom: 32px; }
    .group-header { margin-bottom: 12px; }
    .group-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #888;
      padding: 3px 10px; background: #f0f0f0; border-radius: 4px;
    }

    .match-card { margin-bottom: 10px; }
    .match-card.is-finished { opacity: 0.88; }

    .match-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
    }
    .teams { display: flex; align-items: center; gap: 10px; }
    .team { font-weight: 500; font-size: 0.95rem; }
    .vs { font-size: 0.78rem; color: #bbb; }
    .meta { display: flex; align-items: center; gap: 8px; }
    .date { font-size: 0.8rem; color: #999; }
    .status-chip {
      font-size: 0.68rem; font-weight: 600; padding: 2px 8px;
      border-radius: 10px; background: #e8f5e9; color: #2e7d32;
    }

    .prediction-form { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .score-field { width: 80px; }
    .form-dash { font-size: 1.2rem; color: #ccc; }

    .finished-row { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
    .score-block { display: flex; flex-direction: column; gap: 2px; min-width: 80px; }
    .score-label {
      font-size: 0.68rem; text-transform: uppercase;
      letter-spacing: 0.5px; color: #bbb;
    }
    .score-value { font-size: 1.05rem; font-weight: 600; color: #555; }
    .score-value.actual { color: #1565c0; }

    .points-block {
      margin-left: auto; display: flex; flex-direction: column; align-items: center;
      background: #f5f5f5; border-radius: 8px; padding: 8px 18px; min-width: 64px;
    }
    .points-block.points-positive { background: #e8f5e9; }
    .points-value { font-size: 1.5rem; font-weight: 700; color: #aaa; line-height: 1; }
    .points-block.points-positive .points-value { color: #2e7d32; }
    .points-unit { font-size: 0.68rem; color: #bbb; text-transform: uppercase; margin-top: 2px; }

    .center { display: flex; justify-content: center; padding: 60px; }
    .error-state {
      display: flex; align-items: center; gap: 8px;
      color: #c62828; padding: 16px 0;
    }
    .empty { color: #aaa; padding: 24px 0; }
  `],
})
export class MatchesListComponent implements OnInit {
  private svc = inject(PredictionsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly matches = signal<MatchWithPredictionDto[]>([]);
  readonly saving = signal<Record<string, boolean>>({});

  readonly groupedMatches = computed(() => {
    const grouped: Record<string, MatchWithPredictionDto[]> = {};
    for (const m of this.matches()) {
      if (!grouped[m.groupName]) grouped[m.groupName] = [];
      grouped[m.groupName].push(m);
    }
    return grouped;
  });

  readonly groupNames = computed(() => Object.keys(this.groupedMatches()).sort());

  matchForms: Record<string, GoalForm> = {};

  ngOnInit(): void {
    this.svc.getUpcoming().subscribe({
      next: data => {
        this.buildForms(data);
        this.matches.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(extractApiError(err, 'Failed to load matches.'));
        this.loading.set(false);
      },
    });
  }

  savePrediction(matchId: string): void {
    const form = this.matchForms[matchId];
    if (!form || form.invalid) return;

    const { home, away } = form.getRawValue();

    this.saving.update(s => ({ ...s, [matchId]: true }));

    this.svc.savePrediction({
      matchId,
      predictedHomeGoals: home ?? 0,
      predictedAwayGoals: away ?? 0,
    }).subscribe({
      next: () => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
        this.snackBar.open('Prediction saved!', undefined, { duration: 2500 });
        this.matches.update(ms =>
          ms.map(m =>
            m.matchId === matchId
              ? { ...m, myPredictedHomeGoals: home ?? 0, myPredictedAwayGoals: away ?? 0 }
              : m
          )
        );
      },
      error: err => {
        this.saving.update(s => ({ ...s, [matchId]: false }));
        this.snackBar.open(
          extractApiError(err, 'Failed to save prediction.'),
          'Dismiss',
          { duration: 4000 },
        );
      },
    });
  }

  private buildForms(matches: MatchWithPredictionDto[]): void {
    for (const m of matches) {
      this.matchForms[m.matchId] = this.fb.group({
        home: this.fb.control<number | null>(
          m.myPredictedHomeGoals ?? null,
          [Validators.min(0)],
        ),
        away: this.fb.control<number | null>(
          m.myPredictedAwayGoals ?? null,
          [Validators.min(0)],
        ),
      }) as GoalForm;
    }
  }
}
