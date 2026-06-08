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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  template: `
    <div class="page-container mdc-fields">
      <header class="page-header">
        <h2 class="page-title">{{ 'matches.title' | translate }}</h2>
      </header>

      @if (loading()) {
        <div class="center" role="status" aria-live="polite">
          <mat-spinner diameter="40" aria-label="Loading matches"></mat-spinner>
        </div>
      } @else if (error()) {
        <div class="state-box error-state" role="alert">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      } @else if (matches().length === 0) {
        <div class="state-box empty-state">
          <mat-icon aria-hidden="true">sports_soccer</mat-icon>
          <p>{{ 'matches.empty' | translate }}</p>
        </div>
      } @else {
        @for (group of groupNames(); track group) {
          <section class="group-section" [attr.aria-label]="'Group ' + group">
            <div class="group-header">
              <span class="group-label">{{ ('common.groupPrefix' | translate) + ' ' + group.split(' ').pop() }}</span>
            </div>
            @for (match of groupedMatches()[group]; track match.matchId) {
              <mat-card class="match-card anim-fade-up" [class.is-finished]="match.isFinished">
                <mat-card-content>
                  <div class="match-header">
                    <div class="teams">
                      <span class="team-badge" aria-hidden="true">{{ match.homeTeam.slice(0,3).toUpperCase() }}</span>
                      <span class="team home-team">{{ match.homeTeam }}</span>
                      <span class="vs" aria-hidden="true">{{ 'common.vs' | translate }}</span>
                      <span class="team away-team">{{ match.awayTeam }}</span>
                      <span class="team-badge" aria-hidden="true">{{ match.awayTeam.slice(0,3).toUpperCase() }}</span>
                    </div>
                    <div class="match-meta">
                      <span class="match-date">{{ match.matchDate | date:'MMM d · HH:mm' }}</span>
                      @if (match.isFinished) {
                        <span class="chip chip-success">{{ 'matches.finished' | translate }}</span>
                      }
                    </div>
                  </div>

                  @if (match.isFinished) {
                    <div class="result-row">
                      <div class="score-block">
                        <span class="score-label">{{ 'matches.yourPrediction' | translate }}</span>
                        <span class="score-value score-mono">
                          {{ match.myPredictedHomeGoals ?? '—' }}&thinsp;–&thinsp;{{ match.myPredictedAwayGoals ?? '—' }}
                        </span>
                      </div>
                      <div class="score-block">
                        <span class="score-label">{{ 'matches.result' | translate }}</span>
                        <span class="score-value score-mono actual">
                          {{ match.actualHomeGoals ?? '?' }}&thinsp;–&thinsp;{{ match.actualAwayGoals ?? '?' }}
                        </span>
                      </div>
                      <div class="points-block" [class.points-positive]="(match.pointsAwarded ?? 0) > 0">
                        <span class="points-value score-mono">{{ match.pointsAwarded ?? 0 }}</span>
                        <span class="points-unit">{{ 'common.pts' | translate }}</span>
                      </div>
                    </div>
                  } @else {
                    <form class="prediction-form"
                      [formGroup]="matchForms[match.matchId]"
                      (ngSubmit)="savePrediction(match.matchId)">
                      <mat-form-field appearance="outline" class="score-field">
                        <mat-label>{{ 'matches.homeLabel' | translate }}</mat-label>
                        <input matInput type="number" min="0" formControlName="home"
                          [attr.aria-label]="match.homeTeam + ' goals'"/>
                      </mat-form-field>
                      <span class="form-dash" aria-hidden="true">–</span>
                      <mat-form-field appearance="outline" class="score-field">
                        <mat-label>{{ 'matches.awayLabel' | translate }}</mat-label>
                        <input matInput type="number" min="0" formControlName="away"
                          [attr.aria-label]="match.awayTeam + ' goals'"/>
                      </mat-form-field>
                      <button mat-flat-button type="submit"
                        class="save-btn"
                        [disabled]="saving()[match.matchId]">
                        @if (saving()[match.matchId]) {
                          <mat-spinner diameter="18" />
                        } @else {
                          {{ 'matches.saveBtn' | translate }}
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
    /* ── MDC outlined-field tokens (matches login/register) ── */
    .mdc-fields {
      --mdc-outlined-text-field-focus-label-text-color:  #F5A623;
      --mdc-outlined-text-field-hover-label-text-color:  var(--c-text-2);
      --mdc-outlined-text-field-caret-color:             #F5A623;
      --mdc-outlined-text-field-focus-outline-color:     #F5A623;
      --mdc-outlined-text-field-hover-outline-color:     var(--c-border-s);
      --mdc-outlined-text-field-container-shape:         10px;
      --mdc-outlined-text-field-input-text-size:         0.95rem;
      --mdc-outlined-text-field-label-text-size:         0.88rem;
      --mat-form-field-subscript-text-line-height:       1.4;
    }

    .page-header { margin-bottom: var(--sp-6); }

    /* Group */
    .group-section { margin-bottom: var(--sp-8); }
    .group-header  { margin-bottom: var(--sp-3); }

    /* Match card */
    .match-card { margin-bottom: var(--sp-3); transition: box-shadow var(--trans-m); }
    .match-card:hover { box-shadow: var(--sh-lg) !important; }
    .match-card.is-finished { opacity: .9; }

    /* Match header */
    .match-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--sp-4); flex-wrap: wrap; gap: var(--sp-2);
    }

    .teams {
      display: flex; align-items: center;
      gap: var(--sp-2); flex-wrap: nowrap;
    }

    .team {
      font-family: var(--f-body);
      font-weight: 600;
      font-size: var(--fs-base);
      color: var(--c-text);
      white-space: nowrap;
    }

    .vs {
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--c-text-muted);
      padding: 0 var(--sp-1);
    }

    .match-meta { display: flex; align-items: center; gap: var(--sp-2); }
    .match-date { font-size: var(--fs-sm); color: var(--c-text-muted); }

    /* Prediction form */
    .prediction-form {
      display: flex; align-items: center;
      gap: var(--sp-3); flex-wrap: wrap;
      padding-top: var(--sp-2);
    }
    .score-field { width: 106px; }
    .form-dash   { font-size: 1.3rem; color: var(--c-border-s); font-weight: 300; }

    .save-btn {
      font-family: var(--f-display) !important;
      font-weight: 700 !important;
      letter-spacing: .8px !important;
      height: 40px !important;
      background: #F5A623 !important;
      color: #071A3D !important;
      border-radius: 8px !important;
      transition: background .18s ease, box-shadow .18s ease, transform .12s ease !important;
    }

    .save-btn:hover:not(:disabled) {
      background: #E09015 !important;
      box-shadow: 0 4px 14px rgba(245,166,35,.35) !important;
      transform: translateY(-1px);
    }

    .save-btn:disabled { opacity: .6; }

    /* Finished result row */
    .result-row {
      display: flex; align-items: center;
      gap: var(--sp-8); flex-wrap: wrap;
      padding-top: var(--sp-2);
      border-top: 1px solid var(--c-border);
    }

    .score-block { display: flex; flex-direction: column; gap: 3px; min-width: 90px; }

    .score-label {
      font-size: var(--fs-xs);
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--c-text-muted);
      font-weight: 600;
    }

    .score-value {
      font-size: var(--fs-md);
      font-weight: 700;
      color: var(--c-text-2);
    }

    .score-value.actual { color: var(--c-primary); }

    .points-block {
      margin-left: auto;
      display: flex; flex-direction: column; align-items: center;
      background: var(--c-surface-2);
      border-radius: var(--r-md);
      padding: var(--sp-2) var(--sp-5);
      min-width: 72px;
      border: 1px solid var(--c-border);
      transition: background var(--trans-f);
    }

    .points-block.points-positive {
      background: var(--c-success-bg);
      border-color: rgba(26,138,71,.2);
    }

    .points-value {
      font-size: var(--fs-xl);
      font-weight: 800;
      color: var(--c-text-muted);
      line-height: 1;
    }

    .points-block.points-positive .points-value { color: var(--c-success); }

    .points-unit {
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--c-text-muted);
      margin-top: 2px;
    }

    /* States */
    .center { display: flex; justify-content: center; padding: var(--sp-16) var(--sp-6); }

    .state-box {
      display: flex; align-items: center; gap: var(--sp-3);
      padding: var(--sp-6) 0;
      font-size: var(--fs-base);
    }

    .error-state { color: var(--c-error); }
    .empty-state { color: var(--c-text-muted); flex-direction: column; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .4; }

    @media (max-width: 480px) {
      .teams { flex-wrap: wrap; }
      .result-row { gap: var(--sp-4); }
      .points-block { margin-left: 0; }
    }
  `],
})
export class MatchesListComponent implements OnInit {
  private svc = inject(PredictionsService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

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
        this.error.set(extractApiError(err, this.translate.instant('matches.errorLoad')));
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
        this.snackBar.open(this.translate.instant('matches.predictionSaved'), undefined, { duration: 2500 });
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
          extractApiError(err, this.translate.instant('matches.predictionError')),
          this.translate.instant('common.dismiss'),
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
