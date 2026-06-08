import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService, AppLang } from '../../../core/services/language.service';
import { extractApiError } from '../../../core/utils/api-error';

function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value ?? '';
    const errors: ValidationErrors = {};
    if (v.length < 8)            errors['passwordMinLength'] = true;
    if (!/[A-Z]/.test(v))        errors['passwordUppercase'] = true;
    if (!/[a-z]/.test(v))        errors['passwordLowercase'] = true;
    if (!/[0-9]/.test(v))        errors['passwordDigit']     = true;
    if (!/[^A-Za-z0-9]/.test(v)) errors['passwordSpecial']   = true;
    return Object.keys(errors).length ? errors : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
  ],
  template: `
    <div class="auth-page">
      <!-- Left: stadium hero -->
      <aside class="auth-hero">
        <div class="hero-overlay"></div>
        <div class="hero-body">
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
          <div class="hero-rule"></div>
        </div>
      </aside>

      <!-- Right: form panel -->
      <main class="auth-panel">
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

        <div class="form-wrap">
          <div class="form-pip"></div>
          <h1 class="form-title">{{ 'auth.register.title' | translate }}</h1>
          <p class="form-subtitle">{{ 'auth.register.subtitle' | translate }}</p>

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
              }
            </mat-form-field>

            @if (showPasswordRules()) {
              <ul class="pwd-rules" aria-label="Password requirements">
                @for (rule of passwordRules(); track rule.key) {
                  <li class="pwd-rule" [class.pwd-rule--ok]="rule.ok" [class.pwd-rule--err]="!rule.ok && passwordTouched()">
                    <mat-icon class="pwd-rule-icon">{{ rule.ok ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                    {{ rule.label | translate }}
                  </li>
                }
              </ul>
            }

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

          <p class="switch-text">
            {{ 'auth.register.loginLink' | translate }}
            <a routerLink="/auth/login" class="switch-link">{{ 'auth.register.loginLinkAction' | translate }}</a>
          </p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      background: #0D1B2E;
      color: #fff;
    }

    /* ── Left: stadium hero ── */
    .auth-hero {
      flex: 0 0 52%;
      position: relative;
      background: url('/assets/hero-banner.png') center / cover no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(to right, rgba(7,26,61,.2) 0%, rgba(7,26,61,.6) 65%, #0D1B2E 100%),
        linear-gradient(to bottom, rgba(0,0,0,.35) 0%, transparent 30%, rgba(0,0,0,.45) 100%);
    }

    .hero-body {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 0 40px;
      animation: authFadeUp .6s ease both;
    }

    .brand-icon {
      width: 56px;
      height: 56px;
      flex-shrink: 0;
      filter: drop-shadow(0 0 24px rgba(245,166,35,.45));
    }

    .brand-name {
      font-family: var(--f-display);
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #fff;
      text-shadow: 0 2px 24px rgba(0,0,0,.65);
      white-space: nowrap;
    }

    .hero-rule {
      width: 56px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #F5A623 40%, #F5A623 60%, transparent);
      border-radius: 1px;
    }

    /* ── Right: form panel ── */
    .auth-panel {
      flex: 1;
      min-width: 0;
      background: #0D1B2E;
      display: flex;
      flex-direction: column;
      overflow-y: auto;

      --mdc-outlined-text-field-label-text-color: rgba(255,255,255,.45);
      --mdc-outlined-text-field-hover-label-text-color: rgba(255,255,255,.7);
      --mdc-outlined-text-field-focus-label-text-color: #F5A623;
      --mdc-outlined-text-field-disabled-label-text-color: rgba(255,255,255,.25);
      --mdc-outlined-text-field-input-text-color: rgba(255,255,255,.92);
      --mdc-outlined-text-field-input-text-placeholder-color: rgba(255,255,255,.25);
      --mdc-outlined-text-field-caret-color: #F5A623;
      --mdc-outlined-text-field-outline-color: rgba(255,255,255,.15);
      --mdc-outlined-text-field-hover-outline-color: rgba(255,255,255,.35);
      --mdc-outlined-text-field-focus-outline-color: #F5A623;
      --mdc-outlined-text-field-error-outline-color: #ff6b6b;
      --mdc-outlined-text-field-error-label-text-color: #ff6b6b;
      --mdc-outlined-text-field-error-focus-label-text-color: #ff6b6b;
      --mdc-outlined-text-field-error-hover-label-text-color: #ff6b6b;
      --mdc-outlined-text-field-container-shape: 10px;
      --mdc-outlined-text-field-input-text-size: 0.95rem;
      --mdc-outlined-text-field-label-text-size: 0.88rem;
      --mat-form-field-subscript-text-line-height: 1.4;
      --mat-form-field-error-text-color: #ff6b6b;
      --mat-form-field-hint-text-color: rgba(255,255,255,.38);
    }

    .auth-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 40px;
      flex-shrink: 0;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--f-body);
      font-size: .82rem;
      font-weight: 500;
      color: rgba(255,255,255,.38);
      text-decoration: none;
      letter-spacing: .3px;
      transition: color .18s ease;
    }

    .back-link:hover { color: rgba(255,255,255,.78); }
    .back-arrow { width: 16px; height: 16px; flex-shrink: 0; }

    .lang-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 100px;
      padding: 5px 12px;
    }

    .lang-btn {
      font-family: var(--f-display);
      font-size: .75rem;
      font-weight: 700;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,.38);
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color .18s ease;
      line-height: 1;
    }

    .lang-btn:hover { color: rgba(255,255,255,.75); }
    .lang-btn--active { color: #F5A623 !important; }
    .lang-btn:focus-visible { outline: 2px solid #F5A623; outline-offset: 2px; }
    .lang-sep { color: rgba(255,255,255,.18); font-size: .7rem; user-select: none; }

    .form-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 24px 48px 48px;
      max-width: 420px;
      width: 100%;
      margin: 0 auto;
      animation: authFadeUp .5s .12s ease both;
    }

    .form-pip {
      width: 32px;
      height: 3px;
      background: linear-gradient(90deg, #C07010, #F5A623);
      border-radius: 2px;
      margin-bottom: 14px;
    }

    .form-title {
      font-family: var(--f-display);
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -.3px;
      color: #fff;
      margin: 0 0 6px;
    }

    .form-subtitle {
      font-size: .875rem;
      color: rgba(255,255,255,.48);
      margin: 0 0 28px;
      line-height: 1.5;
    }

    .field-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: rgba(255,255,255,.35);
      margin-right: 4px;
      transition: color .18s ease;
    }

    .full-width { width: 100%; margin-bottom: 4px; }
    .full-width.mat-focused .field-icon { color: #F5A623; }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0D1B2E inset !important;
      -webkit-text-fill-color: rgba(255,255,255,.92) !important;
      caret-color: #F5A623;
      transition: background-color 9999s ease-in-out 0s;
    }

    .submit-btn {
      margin-top: 8px;
      height: 48px;
      background: #F5A623 !important;
      color: #071A3D !important;
      font-family: var(--f-display) !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      letter-spacing: 1.2px !important;
      border-radius: 8px !important;
      transition: background .18s ease, box-shadow .18s ease, transform .12s ease !important;
    }

    .submit-btn:hover:not(:disabled) {
      background: #E09015 !important;
      box-shadow: 0 6px 20px rgba(245,166,35,.35) !important;
      transform: translateY(-1px);
    }

    .submit-btn:disabled { opacity: .6; }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff8080;
      font-size: .85rem;
      margin-bottom: 12px;
      padding: 10px 12px;
      background: rgba(255,107,107,.08);
      border-radius: 8px;
      border-left: 3px solid #ff6b6b;
      line-height: 1.4;
    }

    .error-icon { font-size: 18px !important; width: 18px !important; height: 18px !important; flex-shrink: 0; }

    .switch-text {
      font-size: .85rem;
      color: rgba(255,255,255,.4);
      margin: 20px 0 0;
      text-align: center;
    }

    .switch-link {
      color: #F5A623;
      font-weight: 600;
      text-decoration: none;
      margin-left: 4px;
      transition: color .18s ease;
    }

    .switch-link:hover { color: #FFB83F; text-decoration: underline; }

    .pwd-rules {
      list-style: none;
      margin: -2px 0 12px;
      padding: 10px 14px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pwd-rule {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: .8rem;
      color: rgba(255,255,255,.4);
      transition: color .18s ease;
    }

    .pwd-rule--ok { color: #4caf82; }
    .pwd-rule--err { color: #ff6b6b; }

    .pwd-rule-icon {
      font-size: 15px !important;
      width: 15px !important;
      height: 15px !important;
      flex-shrink: 0;
    }

    @keyframes authFadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }

      .auth-hero {
        flex: 0 0 200px;
      }

      .hero-overlay {
        background: linear-gradient(to bottom, rgba(7,26,61,.3) 0%, #0D1B2E 100%);
      }

      .brand-icon { width: 40px; height: 40px; }
      .brand-name { font-size: 1.5rem; letter-spacing: 2px; }

      .auth-topbar { padding: 16px 20px; }
      .form-wrap { padding: 24px 20px 40px; }
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
    password:    ['', [Validators.required, strongPasswordValidator()]],
  });

  readonly passwordTouched = signal(false);

  private readonly passwordValue = toSignal(
    this.form.get('password')!.valueChanges,
    { initialValue: '' }
  );

  readonly showPasswordRules = computed(() =>
    (this.passwordValue()?.length ?? 0) > 0 || this.passwordTouched()
  );

  readonly passwordRules = computed(() => {
    const v = this.passwordValue() ?? '';
    return [
      { key: 'min',     ok: v.length >= 8,              label: 'auth.validation.passwordMinLength' },
      { key: 'upper',   ok: /[A-Z]/.test(v),            label: 'auth.validation.passwordUppercase' },
      { key: 'lower',   ok: /[a-z]/.test(v),            label: 'auth.validation.passwordLowercase' },
      { key: 'digit',   ok: /[0-9]/.test(v),            label: 'auth.validation.passwordDigit' },
      { key: 'special', ok: /[^A-Za-z0-9]/.test(v),    label: 'auth.validation.passwordSpecial' },
    ];
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
    this.passwordTouched.set(true);
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
