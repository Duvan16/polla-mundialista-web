import { Routes } from '@angular/router';
import { ShellComponent } from '../../shared/components/layout/shell.component';

export const LEADERBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./leaderboard-page/leaderboard-page.component').then(
            m => m.LeaderboardPageComponent
          ),
      },
    ],
  },
];
