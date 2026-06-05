import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'matches',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: 'matches',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/matches/matches.routes').then(m => m.MATCHES_ROUTES),
  },
  {
    path: 'leaderboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/leaderboard/leaderboard.routes').then(
        m => m.LEADERBOARD_ROUTES
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'matches',
  },
];
