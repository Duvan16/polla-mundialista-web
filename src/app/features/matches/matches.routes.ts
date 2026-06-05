import { Routes } from '@angular/router';
import { ShellComponent } from '../../shared/components/layout/shell.component';

export const MATCHES_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./matches-list/matches-list.component').then(
            m => m.MatchesListComponent
          ),
      },
    ],
  },
];
