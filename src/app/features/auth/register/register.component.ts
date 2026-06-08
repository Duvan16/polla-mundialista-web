import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="auth-page">
      <div class="auth-topbar">
        <a routerLink="/landing" class="back-link">
          <svg class="back-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8L10 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ 'auth.register.backToHome' | translate }}
        </a>
        <div class="lang-toggle" role="group" aria-label="Language / Idioma">
          <button class="lang-btn" [class.lang-btn--active]="currentLang() === 'es'"
            (click)="setLang('es')" lang="es" [attr.aria-pressed]="currentLang() === 'es'">
            {{ 'common.langEs' | translate }}
          </button>
          <span class="lang-sep" aria-hidden="true">/</span>
          <button class="lang-btn" [class.lang-btn--active]="currentLang() === 'en'"
            (click)="setLang('en')" lang="en" [attr.aria-pressed]="currentLang() === 'en'">
            {{ 'common.langEn' | translate }}
          </button>
        </div>
      </div>

      <div class="auth-center">
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

        <mat-card class="auth-card">
          <div class="card-accent-bar"></div>
          <div class="card-header">
            <h1 class="card-title">{{ 'auth.register.title' | translate }}</h1>
            <p class="card-subtitle">{{ 'auth.register.subtitle' | translate }}</p>
          </div>

          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.displayNameLabel' | translate }}</mat-label>
                <mat-icon matPrefix class="field-icon">person_outline</mat-icon>
                <input matInput formControlName="displayName" autocomplete="name" />
                @if (form.get('displayName')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.displayNameRequired' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.emailLabel' | translate }}</mat-label>
                <mat-icon matPrefix class="field-icon">mail_outline</mat-icon>
                <input matInput formControlName="email" type="email" autocomplete="email" />
                @if (form.get('email')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.emailRequired' | translate }}</mat-error>
                } @else if (form.get('email')?.hasError('email')) {
                  <mat-error>{{ 'auth.validation.emailInvalid' | translate }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ 'auth.register.passwordLabel' | translate }}</mat-label>
                <mat-icon matPrefix class="field-icon">lock_outline</mat-icon>
                <input matInput formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="new-password" />
                <button mat-icon-button matSuffix type="button"
                  (click)="showPassword.set(!showPassword())"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (form.get('password')?.hasError('required')) {
                  <mat-error>{{ 'auth.validation.passwordRequired' | translate }}</mat-error>
                } @else if (form.get('password')?.hasError('minlength')) {
                  <mat-error>{{ 'auth.validation.passwordMinLength' | translate }}</mat-error>
                }
                @if (!form.get('password')?.hasError('required')) {
                  <mat-hint>{{ 'auth.validation.passwordHint' | translate }}</mat-hint>
                }
              </mat-form-field>

              @if (error()) {
                <p class="error-message" role="alert">
                  <mat-icon class="error-icon">error_outline</mat-icon>
                  {{ error() }}
                </p>
              }

              <button mat-flat-button class="full-width submit-btn" type="submit" [disabled]="loading()">
                @if (loading()) {
                  <mat-spinner diameter="20" />
                } @else {
                  {{ 'auth.register.submitBtn' | translate }}
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions>
            <p class="switch-text">
              {{ 'auth.register.loginLink' | translate }}
              <a routerLink="/auth/login" class="switch-link">{{ 'auth.register.loginLinkAction' | translate }}</a>
            </p>
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
      background-color: #071A3D;
      background-image:
        linear-gradient(to bottom, rgba(7,26,61,.72) 0%, rgba(7,26,61,.58) 50%, rgba(7,26,61,.82) 100%),
        url('/assets/hero-banner.png');
      background-size: cover;
      background-position: center;
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
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--f-body);
      font-size: var(--fs-sm);
      font-weight: 500;
      color: rgba(255,255,255,.45);
      text-decoration: none;
      letter-spacing: .3px;
      transition: color var(--trans-f);
    }

    .back-link:hover { color: rgba(255,255,255,.85); }
    .back-arrow { width: 16px; height: 16px; flex-shrink: 0; }

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
      animation: authFadeUp .5s ease both;
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
      max-width: 440px;
      background: var(--c-surface) !important;
      border: 1px solid rgba(255,255,255,.1) !important;
      box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 4px 20px rgba(0,0,0,.35) !important;
      border-radius: var(--r-lg) !important;
      overflow: hidden !important;
      animation: authFadeUp .5s .1s ease both;
    }

    .card-accent-bar {
      height: 3px;
      background: linear-gradient(90deg, #C07010, #F5A623, #F0BB3A);
    }

    .card-header {
      padding: var(--sp-6) var(--sp-6) var(--sp-4);
      border-bottom: 1px solid var(--c-border);
      margin-bottom: var(--sp-5);
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
      color: var(--c-text-2);
      margin: 0;
      line-height: 1.5;
    }

    mat-card-content { padding: 0 var(--sp-6) var(--sp-2) !important; }

    .field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: var(--c-text-2);
      margin-right: 4px;
    }

    .full-width { width: 100%; margin-bottom: var(--sp-4); }

    .submit-btn {
      margin-top: var(--sp-1);
      height: 48px;
      background: var(--c-accent) !important;
      color: #071A3D !important;
      font-family: var(--f-display) !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      letter-spacing: 1.2px !important;
      border-radius: var(--r-sm) !important;
      transition: background .18s ease, box-shadow .18s ease, transform .18s ease !important;
    }

    .submit-btn:hover:not(:disabled) {
      background: #E09015 !important;
      box-shadow: 0 6px 20px rgba(245,166,35,.4) !important;
      transform: translateY(-1px);
    }

    .submit-btn:disabled { opacity: .6; }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      color: var(--c-error);
      font-size: var(--fs-sm);
      margin-bottom: var(--sp-4);
      padding: var(--sp-3) var(--sp-3);
      background: var(--c-error-bg);
      border-radius: var(--r-sm);
      border-left: 3px solid var(--c-error);
      line-height: 1.4;
    }

    .error-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }

    mat-card-actions {
      padding: var(--sp-3) var(--sp-6) var(--sp-6) !important;
      text-align: center;
    }

    .switch-text {
      font-size: var(--fs-sm);
      color: var(--c-text-2);
      margin: 0;
    }

    .switch-link {
      color: var(--c-accent-d);
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
      transition: color var(--trans-f);
    }

    .switch-link:hover { color: var(--c-accent); text-decoration: underline; }

    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 480px) {
      .auth-topbar { padding: var(--sp-4); }
      .brand-name  { font-size: 1.3rem; }
      .auth-card   { max-width: 100%; }
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
  readonly showPassword = signal(false);
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
