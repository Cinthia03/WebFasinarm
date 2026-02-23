import { Routes } from '@angular/router';

export const routes: Routes = [
   {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./inicio/inicio')
        .then(m => m.Inicio)
  },
  {
    path: 'mantenimiento',
    loadComponent: () =>
      import('./mantenimiento/mantenimiento')
        .then(m => m.Mantenimiento)
  },
  {
    path: 'vistaMantenimiento',
    loadComponent: () =>
      import('./mantenimiento/vista-mantenimiento/vista-mantenimiento')
        .then(m => m.VistaMantenimiento)
  }
];
