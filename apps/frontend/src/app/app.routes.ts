import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'lambda-config',
    loadComponent: () => import('./lambda-config/lambda-config.component').then(m => m.LambdaConfigComponent)
  },
  { path: '', redirectTo: '/lambda-config', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
