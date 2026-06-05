import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/auth/auth.service';

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
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="app-title">Polla Mundialista</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/matches" routerLinkActive="active-link">Matches</a>
      <a mat-button routerLink="/leaderboard" routerLinkActive="active-link">Leaderboard</a>
      @if (isAdmin()) {
        <a mat-button routerLink="/admin" routerLinkActive="active-link">Admin</a>
      }
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon> Logout
      </button>
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
  `],
})
export class ShellComponent {
  private auth = inject(AuthService);
  readonly isAdmin = this.auth.isAdmin;

  logout(): void {
    this.auth.logout();
  }
}
