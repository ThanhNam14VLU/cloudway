import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'login',
    loadComponent: () =>{
        return import('../app/pages/login/login').then(m => m.Login)
    }
  },
   {
    path: 'home',
    loadComponent: () =>{
        return import('./pages/home/home').then(m => m.Home)
    }
  }
];
