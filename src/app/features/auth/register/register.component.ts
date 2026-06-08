import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService, AppLang } from '../../../core/services/language.service';
import { extractApiError } from '../../../core/utils/api-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="auth-page">
      <!-- Top bar: back link + lang switcher -->
      <div class="auth-topbar">
        <a routerLink="/landing" class="back-link">{{ 'auth.register.backToHome' | translate }}</a>
        <div class="lang-toggle" role="group" aria-label="Language / Idioma">
          <button
            class="lang-btn"
            [class.lang-btn--active]="currentLang() === 'es'"
            (click)="setLang('es')" lang="es"
            [attr.aria-pressed]="currentLang() === 'es'">
            {{ 'common.langEs' | translate }}
          </button>
          <span class="lang-sep" aria-hidden="true">/</span>
          <button
            class="lang-btn"
            [class.lang-btn--active]="currentLang() === 'en'"
            (click)="setLang('en')" lang="en"
            [attr.aria-pressed]="currentLang() === 'en'">
            {{ 'common.langEn' | translate }}
          </button>
        </div>
      </div>

      <div class="auth-center">
        <!-- Brand -->
        <div class="auth-brand">
          <svg class="brand-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#F5A623" stroke-width="1.5" opacity=".35"/>
            <circle cx="16" cy="16" r="14" fill="none" stroke="#F5A623" stroke-width="1.5" stroke-dasharray="4 2.5"/>
            <polygon points="16,8 20,12 19,18 13,18 12,12" fill="#F5A623" opacity=".95"/>
            <polygon points="16,4 18,7 16,10 14,7"   fill="#F5A623" opacity=".7"/>
            <polygon points="24,11 27,14 24,17 21,14" fill="#F5A623" opacity=".7"/>
            <polygon points="24,19 27,20 25,24 22,22" fill="#F5A623" opacity=".7"/>
            <polygon points="8,11 11,14 8,17 5,14"   fill="#F5A623" opacity=".7"/>
            <polygon points="8,19 10,22 8,25 5,20"   fill="#F5A623" opacity=".7"/>
            <polygon points="16,28 18,25 16,22 14,25" fill="#F5A623" opacity=".7"/>
          </svg>
          <span class="brand-name">{{ 'common.appTitle' | translate }}</span>
        </div>

        <!-- Card -->
        <mat-card class="auth-card anim-scale">
          <div class="card-header">
            <h1 class="card-title">{{ 'auth.register.title' | translate }}</h1>
            <p class="card-subtitle">{{ 'auth.register.subtitle' | translate }}</p>
          </div>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.displayNameLabel' | translate }}</mat-label>
                <input matInput formControlName="displayName" autocomplete="name" />
                @if (form.get('displayName')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.displayNameRequired' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.emailLabel' | translate }}</mat-label>
                <input matInput formControlName="email" type="email" autocomplete="email" />
                @if (form.get('email')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.emailRequired' | translate }}</mat-error>
                } @else if (form.get('email')?.hasError('email')) {
                  <mat-error>{{ 'auth.validation.emailInvalid' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.passwordLabel' | translate }}</mat-label>
                <input matInput formControlName="password" type="password" autocomplete="new-password" />
                @if (form.get('password')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.passwordRequired' | translate }}</mat-error>
                } @else if (form.get('password')?.hasError('minlength')) {
                  <mat-error>{{ 'auth.validation.passwordMinLength' | translate }}</mat-error>
                }
              </mat-form-field>

              @if (error()) {
                <p class="error-message" role="alert">{{ error() }}</p>
              }

              <button mat-raised-button color="primary"
                class="full-width submit-btn" type="submit"
                [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ 'auth.register.submitBtn' | translate }}
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <a routerLink="/auth/login">{{ 'auth.register.loginLink' | translate }}</a>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #071A3D;
      background-image:
        url('/assets/bg-pattern.svg'),
        linear-gradient(160deg, #071A3D 0%, #0D2B5E 55%, #071A3D 100%);
      background-size: 200px 200px, 100% 100%;
      color: var(--c-on-primary);
    }

    .auth-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-5) var(--sp-8);
      flex-shrink: 0;
    }

    .back-link {
      font-family: var(--f-body);
      font-size: var(--fs-sm);
      font-weight: 500;
      color: rgba(255,255,255,.45);
      text-decoration: none;
      letter-spacing: .3px;
      transition: color var(--trans-f);
    }

    .back-link:hover { color: rgba(255,255,255,.8); text-decoration: none; }

    .lang-toggle {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.14);
      border-radius: var(--r-full);
      padding: 5px var(--sp-3);
    }

    .lang-btn {
      font-family: var(--f-display);
      font-size: .78rem;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,.45);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: var(--r-xs);
      transition: color var(--trans-f);
      line-height: 1;
    }

    .lang-btn:hover { color: rgba(255,255,255,.8); }
    .lang-btn--active { color: var(--c-accent) !important; }
    .lang-btn:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }
    .lang-sep { color: rgba(255,255,255,.2); font-size: .7rem; user-select: none; }

    .auth-center {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--sp-6) var(--sp-4) var(--sp-12);
    }

    .auth-brand {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-bottom: var(--sp-7);
    }

    .brand-icon { width: 36px; height: 36px; flex-shrink: 0; }

    .brand-name {
      font-family: var(--f-display);
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #fff;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--c-surface) !important;
      border: 1px solid rgba(255,255,255,.08) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,.5), 0 4px 16px rgba(0,0,0,.3) !important;
      border-radius: var(--r-lg) !important;
    }

    .card-header {
      padding: var(--sp-6) var(--sp-6) var(--sp-4);
      border-bottom: 1px solid var(--c-border);
      margin-bottom: var(--sp-4);
    }

    .card-title {
      font-family: var(--f-display);
      font-size: 1.65rem;
      font-weight: 800;
      letter-spacing: -.3px;
      color: var(--c-text);
      margin: 0 0 var(--sp-2);
    }

    .card-subtitle {
      font-size: var(--fs-sm);
      color: var(--c-text-muted);
      margin: 0;
      line-height: 1.5;
    }

    mat-card-content { padding: 0 var(--sp-6) var(--sp-2) !important; }

    .full-width { width: 100%; margin-bottom: var(--sp-3); }

    .submit-btn {
      margin-top: var(--sp-2);
      height: 46px;
      font-family: var(--f-display) !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      letter-spacing: 1px !important;
    }

    .error-message {
      color: var(--c-error);
      font-size: var(--fs-sm);
      margin-bottom: var(--sp-3);
      padding: var(--sp-2) var(--sp-3);
      background: var(--c-error-bg);
      border-radius: var(--r-sm);
      border-left: 3px solid var(--c-error);
    }

    mat-card-actions {
      padding: var(--sp-2) var(--sp-6) var(--sp-5) !important;
    }

    mat-card-actions a {
      color: var(--c-accent-d);
      font-size: var(--fs-sm);
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .auth-topbar { padding: var(--sp-4) var(--sp-4); }
      .brand-name  { font-size: 1.3rem; }
    }
  `],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private langSvc = inject(LanguageService);
  private titleSvc = inject(Title);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentLang = this.langSvc.currentLang;

  form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.translate.onLangChange
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncTitle());
  }

  ngOnInit(): void {
    this.syncTitle();
  }

  setLang(lang: AppLang): void {
    this.langSvc.setLang(lang);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/matches']),
      error: (err) => {
        this.error.set(extractApiError(err, this.translate.instant('auth.register.errorFallback')));
        this.loading.set(false);
      },
    });
  }

  private syncTitle(): void {
    this.titleSvc.setTitle(this.translate.instant('auth.register.pageTitle'));
  }
}
