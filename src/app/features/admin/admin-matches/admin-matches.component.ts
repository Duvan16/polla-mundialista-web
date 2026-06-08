import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminService } from '../../../core/services/admin.service';
import { MatchWithPredictionDto } from '../../../core/models';
import { extractApiError } from '../../../core/utils/api-error';

@Component({
  selector: 'app-confirm-result-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'admin.confirm.title' | translate }}</h2>
    <mat-dialog-content>
      <p class="teams">
        {{ data.homeTeam }}
        <span class="vs">{{ 'common.vs' | translate }}</span>
        {{ data.awayTeam }}
      </p>
      <p class="score">{{ data.homeGoals }}&ensp;–&ensp;{{ data.awayGoals }}</p>
      <p class="warning">{{ 'admin.confirm.warning' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'admin.confirm.cancel' | translate }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ 'admin.confirm.save' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .teams { font-size: 1rem; font-weight: 600; margin-bottom: var(--sp-1); color: var(--c-text); }
    .vs    { color: var(--c-text-muted); font-size: .8rem; margin: 0 var(--sp-2); }
    .score {
      font-family: var(--f-display);
      font-size: 2.4rem;
      font-weight: 800;
      text-align: center;
      color: var(--c-primary);
      margin: var(--sp-3) 0 var(--sp-2);
      letter-spacing: 2px;
    }
    .warning { font-size: var(--fs-sm); color: var(--c-text-muted); margin-top: var(--sp-2); }
  `],
})
export class ConfirmResultDialogComponent {
  data = inject(MAT_DIALOG_DATA) as {
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
  };
}

type GoalForm = FormGroup<{
  home: FormControl<number | null>;
  away: FormControl<number | null>;
}>;

@Component({
  selector: 'app-admin-matches',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    DatePipe,
    TranslateModule,
  ],
  template: `
    <div class="page-container">
      <header class="admin-header">
        <h2 class="page-title">{{ 'admin.title' | translate }}</h2>
        <span class="admin-badge">Admin</span>
      </header>

      @if (loading()) {
        <div class="center" role="status">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (error()) {
        <div class="state-row error-state" role="alert">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
          <button mat-stroked-button (click)="loadMatches()">{{ 'admin.retry' | translate }}</button>
        </div>
      } @else if (matches().length === 0) {
        <p class="empty">{{ 'admin.empty' | translate }}</p>
      } @else {
        @for (group of groupNames(); track group) {
          <section class="group-section" [attr.aria-label]="'Group ' + group">
            <div class="group-header">
              <span class="group-label">{{ group }}</span>
            </div>

            @for (match of groupedMatches()[group]; track match.matchId) {
              <mat-card class="match-card" [class.is-finished]="match.isFinished">
                <mat-card-content>

                  <div class="match-header">
                    <div class="teams">
                      <span class="team-badge" aria-hidden="true">{{ match.homeTeam.slice(0,3).toUpperCase() }}</span>
                      <span class="team">{{ match.homeTeam }}</span>
                      <span class="vs" aria-hidden="true">{{ 'common.vs' | translate }}</span>
                      <span class="team">{{ match.awayTeam }}</span>
                      <span class="team-badge" aria-hidden="true">{{ match.awayTeam.slice(0,3).toUpperCase() }}</span>
                    </div>
                    <div class="match-meta">
                      <span class="match-date">{{ match.matchDate | date:'MMM d · HH:mm' }}</span>
                      @if (match.isFinished) {
                        <span class="chip chip-success finished-chip">
                          <mat-icon class="chip-icon" aria-hidden="true">check_circle</mat-icon>
                          {{ 'admin.finished' | translate }}
                        </span>
                      }
                    </div>
                  </div>

                  @if (match.isFinished) {
                    <div class="result-display">
                      <div class="result-score-box">
                        <span class="result-label">{{ 'admin.finalScore' | translate }}</span>
                        <span class="result-value">
                          {{ match.actualHomeGoals }}&ensp;–&ensp;{{ match.actualAwayGoals }}
                        </span>
                      </div>
                      <div class="result-form">
                        <form [formGroup]="matchForms[match.matchId]"
                              (ngSubmit)="confirmAndSave(match)">
                          <mat-form-field appearance="outline" class="score-field">
                            <mat-label>{{ 'admin.homeLabel' | translate }}</mat-label>
                            <input matInput type="number" min="0" formControlName="home" />
                          </mat-form-field>
                          <span class="form-dash" aria-hidden="true">–</span>
                          <mat-form-field appearance="outline" class="score-field">
                            <mat-label>{{ 'admin.awayLabel' | translate }}</mat-label>
                            <input matInput type="number" min="0" formControlName="away" />
                          </mat-form-field>
                          <button mat-stroked-button color="warn" type="submit"
                            [disabled]="saving()[match.matchId] || matchForms[match.matchId].invalid">
                            @if (saving()[match.matchId]) { <mat-spinner diameter="16" /> }
                            @else { {{ 'admin.updateResult' | translate }} }
                          </button>
                        </form>
                        @if (saveError()[match.matchId]) {
                          <div class="inline-error" role="alert">
                            <mat-icon>warning</mat-icon>
                            {{ saveError()[match.matchId] }}
                          </div>
                        }
                      </div>
                    </div>
                  } @else {
                    <div class="pending-row">
                      <form class="result-form" [formGroup]="matchForms[match.matchId]"
                            (ngSubmit)="confirmAndSave(match)">
                        <mat-form-field appearance="outline" class="score-field">
                          <mat-label>{{ 'admin.homeGoals' | translate }}</mat-label>
                          <input matInput type="number" min="0" formControlName="home" />
                        </mat-form-field>
                        <span class="form-dash" aria-hidden="true">–</span>
                        <mat-form-field appearance="outline" class="score-field">
                          <mat-label>{{ 'admin.awayGoals' | translate }}</mat-label>
                          <input matInput type="number" min="0" formControlName="away" />
                        </mat-form-field>
                        <button mat-flat-button color="primary" type="submit"
                          class="save-btn"
                          [disabled]="saving()[match.matchId] || matchForms[match.matchId].invalid">
                          @if (saving()[match.matchId]) { <mat-spinner diameter="18" /> }
                          @else { {{ 'admin.saveResult' | translate }} }
                        </button>
                      </form>
                      @if (saveError()[match.matchId]) {
                        <div class="inline-error" role="alert">
                          <mat-icon>warning</mat-icon>
                          {{ saveError()[match.matchId] }}
                        </div>
                      }
                    </div>
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
    /* ── Admin header ── */
    .admin-header {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-bottom: var(--sp-6);
    }

    .admin-header .page-title { margin: 0; }

    .admin-badge {
      font-family: var(--f-display);
      font-size: var(--fs-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px var(--sp-3);
      background: rgba(230,81,0,.12);
      color: var(--c-warn-text);
      border-radius: var(--r-full);
      border: 1px solid rgba(230,81,0,.25);
    }

    /* Groups */
    .group-section { margin-bottom: var(--sp-8); }
    .group-header  { margin-bottom: var(--sp-3); }

    /* Match card */
    .match-card {
      margin-bottom: var(--sp-3);
      transition: box-shadow var(--trans-m);
    }
    .match-card:hover { box-shadow: var(--sh-lg) !important; }
    .match-card.is-finished { border-left: 3px solid var(--c-success) !important; }

    /* Match header */
    .match-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: var(--sp-4); flex-wrap: wrap; gap: var(--sp-2);
    }

    .teams { display: flex; align-items: center; gap: var(--sp-2); }
    .team  { font-weight: 600; font-size: var(--fs-base); color: var(--c-text); }
    .vs    { font-size: var(--fs-xs); font-weight: 700; text-transform: uppercase;
             letter-spacing: 1px; color: var(--c-text-muted); }

    .match-meta { display: flex; align-items: center; gap: var(--sp-2); }
    .match-date { font-size: var(--fs-sm); color: var(--c-text-muted); }

    .chip-icon { font-size: 13px; width: 13px; height: 13px; }

    /* Finished display */
    .result-display {
      display: flex; align-items: flex-start;
      gap: var(--sp-6); flex-wrap: wrap;
      padding-top: var(--sp-3);
      border-top: 1px solid var(--c-border);
    }

    .result-score-box {
      display: flex; flex-direction: column; gap: 3px;
      min-width: 110px;
      background: var(--c-success-bg);
      border-radius: var(--r-md);
      padding: var(--sp-3) var(--sp-5);
      text-align: center;
      border: 1px solid rgba(26,138,71,.18);
    }

    .result-label {
      font-size: var(--fs-xs);
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--c-success);
      font-weight: 600;
    }

    .result-value {
      font-family: var(--f-display);
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--c-success);
      line-height: 1.1;
      letter-spacing: 2px;
    }

    /* Forms */
    .result-form {
      display: flex; align-items: center;
      gap: var(--sp-3); flex-wrap: wrap; flex: 1;
    }

    .pending-row { display: flex; flex-direction: column; gap: var(--sp-2); }

    .score-field { width: 92px; }
    .form-dash   { font-size: 1.3rem; color: var(--c-border-s); }

    .save-btn {
      font-family: var(--f-display) !important;
      font-weight: 700 !important;
      letter-spacing: .8px !important;
      height: 40px !important;
    }

    /* Inline error */
    .inline-error {
      display: flex; align-items: center; gap: var(--sp-2);
      color: var(--c-error);
      font-size: var(--fs-sm);
      padding-top: var(--sp-1);
    }
    .inline-error mat-icon { font-size: 15px; width: 15px; height: 15px; }

    /* States */
    .center { display: flex; justify-content: center; padding: var(--sp-16) var(--sp-6); }

    .state-row {
      display: flex; align-items: center; gap: var(--sp-3);
      padding: var(--sp-4) 0;
    }
    .error-state { color: var(--c-error); }

    .empty { color: var(--c-text-muted); padding: var(--sp-6) 0; }

    @media (max-width: 480px) {
      .result-display { flex-direction: column; }
      .result-form { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AdminMatchesComponent implements OnInit {
  private adminSvc = inject(AdminService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly matches = signal<MatchWithPredictionDto[]>([]);
  readonly saving = signal<Record<string, boolean>>({});
  readonly saveError = signal<Record<string, string | null>>({});

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
    this.loadMatches();
  }

  loadMatches(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminSvc.getMatches().subscribe({
      next: data => {
        this.buildForms(data);
        this.matches.set(data);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(extractApiError(err, this.translate.instant('admin.errorLoad')));
        this.loading.set(false);
      },
    });
  }

  confirmAndSave(match: MatchWithPredictionDto): void {
    const form = this.matchForms[match.matchId];
    if (!form || form.invalid) return;

    const { home, away } = form.getRawValue();
    if (home === null || away === null) {
      this.saveError.update(e => ({
        ...e,
        [match.matchId]: this.translate.instant('admin.goalsRequired'),
      }));
      return;
    }

    const ref = this.dialog.open(ConfirmResultDialogComponent, {
      data: { homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeGoals: home, awayGoals: away },
      width: '360px',
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.doSave(match, home, away);
    });
  }

  private doSave(match: MatchWithPredictionDto, home: number, away: number): void {
    this.saving.update(s => ({ ...s, [match.matchId]: true }));
    this.saveError.update(e => ({ ...e, [match.matchId]: null }));

    this.adminSvc.setMatchResult(match.matchId, { homeGoals: home, awayGoals: away }).subscribe({
      next: () => {
        this.saving.update(s => ({ ...s, [match.matchId]: false }));
        this.matches.update(ms =>
          ms.map(m =>
            m.matchId === match.matchId
              ? { ...m, isFinished: true, actualHomeGoals: home, actualAwayGoals: away }
              : m
          )
        );
        this.snackBar.open(this.translate.instant('admin.resultSaved'), undefined, { duration: 2500 });
      },
      error: err => {
        this.saving.update(s => ({ ...s, [match.matchId]: false }));
        this.saveError.update(e => ({
          ...e,
          [match.matchId]: extractApiError(err, this.translate.instant('admin.resultError')),
        }));
      },
    });
  }

  private buildForms(matches: MatchWithPredictionDto[]): void {
    for (const m of matches) {
      this.matchForms[m.matchId] = this.fb.group({
        home: this.fb.control<number | null>(
          m.actualHomeGoals ?? null,
          [Validators.required, Validators.min(0)],
        ),
        away: this.fb.control<number | null>(
          m.actualAwayGoals ?? null,
          [Validators.required, Validators.min(0)],
        ),
      }) as GoalForm;
    }
  }
}
