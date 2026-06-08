import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    MatIconModule,
    TranslateModule,
  ],
  template: `
    <div class="page-container mdc-fields">
      <header class="page-header">
        <h2 class="page-title">{{ 'admin.title' | translate }}</h2>
      </header>

      @if (loading()) {
        <div class="center" role="status">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <div class="state-box error-state" role="alert">
          <mat-icon aria-hidden="true">error_outline</mat-icon>
          <span>{{ error() }}</span>
        </div>
      } @else if (matches().length === 0) {
        <div class="state-box empty-state">
          <mat-icon aria-hidden="true">sports_soccer</mat-icon>
          <p>{{ 'admin.empty' | translate }}</p>
        </div>
      } @else {
        @for (match of matches(); track match.matchId) {
          <mat-card class="match-card">
            <mat-card-content>
              <div class="match-header">
                <div class="teams">
                  <span class="team-badge" aria-hidden="true">{{ match.homeTeam.slice(0,3).toUpperCase() }}</span>
                  <span class="team">{{ match.homeTeam }}</span>
                  <span class="vs" aria-hidden="true">{{ 'common.vs' | translate }}</span>
                  <span class="team">{{ match.awayTeam }}</span>
                  <span class="team-badge" aria-hidden="true">{{ match.awayTeam.slice(0,3).toUpperCase() }}</span>
                </div>
                <span class="group-chip">{{ match.groupName }}</span>
              </div>

              <div class="result-row">
                <mat-form-field appearance="outline" class="score-field">
                  <mat-label>{{ 'admin.homeGoals' | translate }}</mat-label>
                  <input matInput type="number" min="0"
                    (change)="onGoalChange(match.matchId, 'home', $event)" />
                </mat-form-field>
                <span class="form-dash" aria-hidden="true">–</span>
                <mat-form-field appearance="outline" class="score-field">
                  <mat-label>{{ 'admin.awayGoals' | translate }}</mat-label>
                  <input matInput type="number" min="0"
                    (change)="onGoalChange(match.matchId, 'away', $event)" />
                </mat-form-field>
                <button mat-flat-button type="button" class="save-btn"
                  [disabled]="saving()[match.matchId]"
                  (click)="setResult(match.matchId)">
                  @if (saving()[match.matchId]) {
                    <mat-spinner diameter="18" />
                  } @else {
                    {{ 'admin.saveResult' | translate }}
                  }
                </button>
                @if (saved()[match.matchId]) {
                  <span class="saved-chip">
                    <mat-icon class="saved-icon">check_circle</mat-icon>
                    {{ 'admin.resultSaved' | translate }}
                  </span>
                }
                @if (saveError()[match.matchId]) {
                  <span class="inline-error">{{ saveError()[match.matchId] }}</span>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: [`
    /* ── MDC outlined-field tokens ── */
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

    .match-card { margin-bottom: var(--sp-3); transition: box-shadow var(--trans-m); }
    .match-card:hover { box-shadow: var(--sh-lg) !important; }

    .match-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--sp-4); flex-wrap: wrap; gap: var(--sp-2);
    }

    .teams { display: flex; align-items: center; gap: var(--sp-2); flex-wrap: nowrap; }
    .team  { font-weight: 600; font-size: var(--fs-base); color: var(--c-text); white-space: nowrap; }
    .vs    { font-size: var(--fs-xs); font-weight: 700; text-transform: uppercase;
             letter-spacing: 1px; color: var(--c-text-muted); padding: 0 var(--sp-1); }

    .group-chip {
      font-family: var(--f-display);
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px var(--sp-3);
      background: var(--c-primary-xl);
      color: var(--c-primary);
      border-radius: var(--r-full);
      border: 1px solid var(--c-border-s);
      white-space: nowrap;
    }

    .result-row {
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

    .saved-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: var(--fs-sm); font-weight: 600;
      color: var(--c-success);
      background: var(--c-success-bg);
      padding: 4px var(--sp-3);
      border-radius: var(--r-full);
    }
    .saved-icon { font-size: 14px; width: 14px; height: 14px; }

    .inline-error { color: var(--c-error); font-size: var(--fs-sm); }

    .center { display: flex; justify-content: center; padding: var(--sp-16) var(--sp-6); }

    .state-box {
      display: flex; align-items: center; gap: var(--sp-3);
      padding: var(--sp-6) 0; font-size: var(--fs-base);
    }
    .error-state { color: var(--c-error); }
    .empty-state { color: var(--c-text-muted); flex-direction: column; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: .4; }

    @media (max-width: 480px) {
      .teams { flex-wrap: wrap; }
      .result-row { gap: var(--sp-2); }
    }
  `],
})
export class AdminResultsComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private predSvc = inject(PredictionsService);
  private translate = inject(TranslateService);

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
      error: () => {
        this.error.set(this.translate.instant('admin.errorLoad'));
        this.loading.set(false);
      },
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
      this.saveError.update(e => ({ ...e, [matchId]: this.translate.instant('admin.goalsRequired') }));
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
          [matchId]: err?.error?.error ?? this.translate.instant('admin.resultError'),
        }));
      },
    });
  }
}
