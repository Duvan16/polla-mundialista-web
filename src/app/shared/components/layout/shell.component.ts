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
    <mat-toolbar color="primary">
      <span class="app-title">{{ 'common.appTitle' | translate }}</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/matches" routerLinkActive="active-link">{{ 'nav.matches' | translate }}</a>
      <a mat-button routerLink="/leaderboard" routerLinkActive="active-link">{{ 'nav.leaderboard' | translate }}</a>
      @if (isAdmin()) {
        <a mat-button routerLink="/admin" routerLinkActive="active-link">{{ 'nav.admin' | translate }}</a>
      }

      <button mat-button [matMenuTriggerFor]="langMenu" class="lang-btn">
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
          <span class="avatar">{{ initials() }}</span>
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
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .spacer { flex: 1 1 auto; }
    .app-title { font-weight: 600; letter-spacing: 0.5px; }
    .main-content { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .active-link { background: rgba(255,255,255,0.15); border-radius: 4px; }
    .lang-btn { font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-left: 4px; }
    .lang-btn mat-icon { font-size: 16px; width: 16px; height: 16px; vertical-align: middle; }
    .active-lang { font-weight: 700; background: rgba(0,0,0,0.06); }
    .avatar-btn { margin-left: 8px; }
    .avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      color: #fff; font-size: 13px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .menu-header { display: flex; flex-direction: column; padding: 12px 16px; cursor: default; line-height: 1.4; }
    .menu-name { font-weight: 600; font-size: 14px; }
    .menu-email { font-size: 12px; color: #888; margin-top: 2px; }
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
