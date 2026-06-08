import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService, AppLang } from '../../../core/services/language.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TranslateModule,
  ],
  template: `
    <mat-toolbar color="primary" role="banner">
      <span class="app-title">
        <svg class="app-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".6"/>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12 2 L12 22 M2 12 L22 12" stroke="currentColor" stroke-width=".8" opacity=".4"/>
          <polygon points="12,6 15,10 14,14 10,14 9,10" fill="currentColor" opacity=".85"/>
          <polygon points="12,3 14,5 12,7 10,5"   fill="currentColor" opacity=".6"/>
          <polygon points="19,9 21,11 19,13 17,11" fill="currentColor" opacity=".6"/>
          <polygon points="19,15 21,15 20,18 17,17" fill="currentColor" opacity=".6"/>
          <polygon points="5,9 7,11 5,13 3,11"   fill="currentColor" opacity=".6"/>
          <polygon points="5,15 7,17 6,20 3,15"  fill="currentColor" opacity=".6"/>
          <polygon points="12,21 14,19 12,17 10,19" fill="currentColor" opacity=".6"/>
        </svg>
        {{ 'common.appTitle' | translate }}
      </span>

      <span class="spacer"></span>

      <nav class="main-nav" aria-label="Main navigation">
        <a mat-button class="nav-link" routerLink="/matches"     routerLinkActive="active-link">{{ 'nav.matches'     | translate }}</a>
        <a mat-button class="nav-link" routerLink="/leaderboard" routerLinkActive="active-link">{{ 'nav.leaderboard' | translate }}</a>
        @if (isAdmin()) {
          <a mat-button class="nav-link" routerLink="/admin" routerLinkActive="active-link">{{ 'nav.admin' | translate }}</a>
        }
      </nav>

      <button mat-button class="lang-btn" [matMenuTriggerFor]="langMenu">
        {{ currentLang() === 'es' ? ('common.langEs' | translate) : ('common.langEn' | translate) }}
        <mat-icon>expand_more</mat-icon>
      </button>
      <mat-menu #langMenu="matMenu">
        <button mat-menu-item (click)="setLang('es')" [class.active-lang]="currentLang() === 'es'">
          {{ 'common.langEs' | translate }} — Español
        </button>
        <button mat-menu-item (click)="setLang('en')" [class.active-lang]="currentLang() === 'en'">
          {{ 'common.langEn' | translate }} — English
        </button>
      </mat-menu>

      @if (user()) {
        <button mat-icon-button [matMenuTriggerFor]="userMenu" class="avatar-btn"
          [attr.aria-label]="'nav.userMenuLabel' | translate">
          <span class="avatar" aria-hidden="true">{{ initials() }}</span>
        </button>
        <mat-menu #userMenu="matMenu" xPosition="before">
          <div class="menu-header" mat-menu-item disabled>
            <span class="menu-name">{{ user()!.displayName }}</span>
            <span class="menu-email">{{ user()!.email }}</span>
          </div>
          <mat-divider />
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>{{ 'nav.signOut' | translate }}</span>
          </button>
        </mat-menu>
      }
    </mat-toolbar>

    <div class="nav-accent-bar" aria-hidden="true"></div>

    <main class="main-content" id="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    /* ── Toolbar ── */
    .spacer { flex: 1 1 auto; }

    .app-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: var(--f-display);
      font-size: 1.35rem;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #fff;
      white-space: nowrap;
    }

    .app-logo {
      width: 26px;
      height: 26px;
      color: var(--c-accent);
      flex-shrink: 0;
    }

    /* ── Nav links ── */
    .main-nav { display: flex; align-items: center; }

    .nav-link {
      font-family: var(--f-body) !important;
      font-size: .83rem !important;
      font-weight: 500 !important;
      letter-spacing: .4px !important;
      color: rgba(255,255,255,.78) !important;
      border-radius: var(--r-sm) !important;
      transition: color var(--trans-f), background var(--trans-f) !important;
    }

    .nav-link:hover {
      color: #fff !important;
      background: rgba(255,255,255,.1) !important;
    }

    .nav-link.active-link {
      color: var(--c-accent) !important;
      background: rgba(245,166,35,.14) !important;
      font-weight: 600 !important;
    }

    /* ── Lang ── */
    .lang-btn {
      font-size: .78rem !important;
      font-weight: 600 !important;
      letter-spacing: .3px !important;
      color: rgba(255,255,255,.65) !important;
      margin-left: var(--sp-1) !important;
    }
    .lang-btn mat-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; }
    .active-lang { font-weight: 700 !important; color: var(--c-accent) !important; }

    /* ── Avatar ── */
    .avatar-btn { margin-left: var(--sp-2) !important; }
    .avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      background: rgba(245,166,35,.22);
      border: 1.5px solid rgba(245,166,35,.55);
      color: var(--c-accent);
      font-family: var(--f-display);
      font-size: .8rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }

    /* ── User menu ── */
    .menu-header {
      display: flex; flex-direction: column;
      padding: var(--sp-3) var(--sp-4);
      cursor: default; line-height: 1.4;
    }
    .menu-name  { font-weight: 600; font-size: .875rem; color: var(--c-text); }
    .menu-email { font-size: .75rem; color: var(--c-text-muted); margin-top: 2px; }

    /* ── Gold accent bar ── */
    .nav-accent-bar {
      height: 3px;
      background: linear-gradient(90deg,
        transparent 0%,
        var(--c-accent) 20%,
        var(--c-accent-h) 50%,
        var(--c-accent) 80%,
        transparent 100%);
      opacity: .85;
    }

    /* ── Main content ── */
    .main-content {
      padding: var(--sp-6);
      max-width: var(--content-max);
      margin: 0 auto;
    }

    @media (max-width: 640px) {
      .app-title { font-size: 1rem; letter-spacing: 1px; }
      .main-nav { display: none; }
      .main-content { padding: var(--sp-4) var(--sp-3); }
    }
  `],
})
export class ShellComponent {
  private auth = inject(AuthService);
  private langSvc = inject(LanguageService);

  readonly isAdmin = this.auth.isAdmin;
  readonly user = this.auth.user;
  readonly currentLang = this.langSvc.currentLang;

  readonly initials = computed(() => {
    const name = this.user()?.displayName ?? '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  });

  setLang(lang: AppLang): void {
    this.langSvc.setLang(lang);
  }

  logout(): void {
    this.auth.logout();
  }
}
