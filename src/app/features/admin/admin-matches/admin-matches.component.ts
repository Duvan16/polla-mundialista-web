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
      <p class="teams">{{ data.homeTeam }} <span class="vs">{{ 'common.vs' | translate }}</span> {{ data.awayTeam }}</p>
      <p class="score">{{ data.homeGoals }} &ndash; {{ data.awayGoals }}</p>
      <p class="warning">{{ 'admin.confirm.warning' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'admin.confirm.cancel' | translate }}</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ 'admin.confirm.save' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .teams { font-size: 1rem; font-weight: 500; margin-bottom: 4px; }
    .vs { color: #bbb; font-size: 0.8rem; }
    .score { font-size: 2rem; font-weight: 700; text-align: center; color: #1565c0; margin: 8px 0 4px; }
    .warning { font-size: 0.78rem; color: #999; margin-top: 4px; }
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
      <h2 class="page-title">{{ 'admin.title' | translate }}</h2>

      @if (loading()) {
        <div class="center"><mat-spinner /></div>
      } @else if (error()) {
        <div class="error-state">
          <mat-icon>error_outline</mat-icon>
          <span>{{ error() }}</span>
          <button mat-stroked-button (click)="loadMatches()">{{ 'admin.retry' | translate }}</button>
        </div>
      } @else if (matches().length === 0) {
        <p class="empty">{{ 'admin.empty' | translate }}</p>
      } @else {
        @for (group of groupNames(); track group) {
          <section class="group-section">
            <div class="group-header">
              <span class="group-label">{{ group }}</span>
            </div>

            @for (match of groupedMatches()[group]; track match.matchId) {
              <mat-card class="match-card" [class.is-finished]="match.isFinished">
                <mat-card-content>

                  <div class="match-header">
                    <div class="teams">
                      <span class="team">{{ match.homeTeam }}</span>
                      <span class="vs">{{ 'common.vs' | translate }}</span>
                      <span class="team">{{ match.awayTeam }}</span>
                    </div>
                    <div class="meta">
                      <span class="date">{{ match.matchDate | date:'MMM d · HH:mm' }}</span>
                      @if (match.isFinished) {
                        <span class="finished-badge">
                          <mat-icon class="badge-icon">check_circle</mat-icon>
                          {{ 'admin.finished' | translate }}
                        </span>
                      }
                    </div>
                  </div>

                  @if (match.isFinished) {
                    <div class="result-display">
                      <div class="result-score">
                        <span class="result-label">{{ 'admin.finalScore' | translate }}</span>
                        <span class="result-value">
                          {{ match.actualHomeGoals }} &ndash; {{ match.actualAwayGoals }}
                        </span>
                      </div>
                      <div class="result-form">
                        <form [formGroup]="matchForms[match.matchId]"
                              (ngSubmit)="confirmAndSave(match)">
                          <mat-form-field appearance="outline" class="score-field">
                            <mat-label>{{ 'admin.homeLabel' | translate }}</mat-label>
                            <input matInput type="number" min="0" formControlName="home" />
                          </mat-form-field>
                          <span class="form-dash">&ndash;</span>
                          <mat-form-field appearance="outline" class="score-field">
                            <mat-label>{{ 'admin.awayLabel' | translate }}</mat-label>
                            <input matInput type="number" min="0" formControlName="away" />
                          </mat-form-field>
                          <button mat-stroked-button color="warn" type="submit"
                            [disabled]="saving()[match.matchId] || matchForms[match.matchId].invalid">
                            @if (saving()[match.matchId]) {
                              <mat-spinner diameter="16" />
                            } @else {
                              {{ 'admin.updateResult' | translate }}
                            }
                          </button>
                        </form>
                        @if (saveError()[match.matchId]) {
                          <div class="inline-error">
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
                        <span class="form-dash">&ndash;</span>
                        <mat-form-field appearance="outline" class="score-field">
                          <mat-label>{{ 'admin.awayGoals' | translate }}</mat-label>
                          <input matInput type="number" min="0" formControlName="away" />
                        </mat-form-field>
                        <button mat-flat-button color="primary" type="submit"
                          [disabled]="saving()[match.matchId] || matchForms[match.matchId].invalid">
                          @if (saving()[match.matchId]) {
                            <mat-spinner diameter="18" />
                          } @else {
                            {{ 'admin.saveResult' | translate }}
                          }
                        </button>
                      </form>
                      @if (saveError()[match.matchId]) {
                        <div class="inline-error">
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
    .page-container { max-width: 760px; margin: 0 auto; padding: 24px 16px; }
    .page-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 24px; }

    .group-section { margin-bottom: 32px; }
    .group-header { margin-bottom: 12px; }
    .group-label {
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.5px; color: #888;
      padding: 3px 10px; background: #f0f0f0; border-radius: 4px;
    }

    .match-card { margin-bottom: 10px; }
    .match-card.is-finished { border-left: 3px solid #2e7d32; }

    .match-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
    }
    .teams { display: flex; align-items: center; gap: 10px; }
    .team { font-weight: 500; font-size: 0.95rem; }
    .vs { font-size: 0.78rem; color: #bbb; }
    .meta { display: flex; align-items: center; gap: 8px; }
    .date { font-size: 0.8rem; color: #999; }

    .finished-badge {
      display: flex; align-items: center; gap: 4px;
      font-size: 0.72rem; font-weight: 600;
      color: #2e7d32; background: #e8f5e9;
      padding: 2px 8px; border-radius: 10px;
    }
    .badge-icon { font-size: 14px; width: 14px; height: 14px; }

    .result-display { display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap; }
    .result-score {
      display: flex; flex-direction: column; gap: 2px; min-width: 100px;
      background: #e8f5e9; border-radius: 8px; padding: 10px 20px; text-align: center;
    }
    .result-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.5px; color: #888; }
    .result-value { font-size: 1.6rem; font-weight: 700; color: #2e7d32; line-height: 1.2; }

    .result-form { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; flex: 1; }
    .pending-row { display: flex; flex-direction: column; gap: 8px; }
    .score-field { width: 90px; }
    .form-dash { font-size: 1.2rem; color: #ccc; }

    .inline-error {
      display: flex; align-items: center; gap: 6px;
      color: #c62828; font-size: 0.82rem; padding-top: 2px;
    }
    .inline-error mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .center { display: flex; justify-content: center; padding: 60px; }
    .error-state {
      display: flex; align-items: center; gap: 10px;
      color: #c62828; padding: 16px 0;
    }
    .empty { color: #aaa; padding: 24px 0; }
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
