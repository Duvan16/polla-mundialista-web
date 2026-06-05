import { Routes } from '@angular/router';
import { ShellComponent } from '../../shared/components/layout/shell.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin-results/admin-results.component').then(
            m => m.AdminResultsComponent
          ),
      },
    ],
  },
];
