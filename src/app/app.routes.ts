import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Airline } from './pages/airline/airline';
import { AirlineDashboard } from './components/airline-dashboard/airline-dashboard';
import { AirlineManagement } from './components/airline-management/airline-management';
import { AirlineReport } from './components/airline-report/airline-report';
import { AirlineSetting } from './components/airline-setting/airline-setting';
import { AirlineLogin } from './components/airline-login/airline-login';
import { AirlineCardDetail } from './pages/airline-card-detail/airline-card-detail';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => {
      return import('../app/pages/login/login').then(m => m.Login)
    }
  },
   {
    path: 'airline-login',
    loadComponent: () => {
      return import('../app/components/airline-login/airline-login').then(m => m.AirlineLogin)
    }
  },
  {
    path: 'home',
    loadComponent: () => {
      return import('./pages/home/home').then(m => m.Home)
    }
  },
  {
    path: 'airline',
    loadComponent: () =>
      import('./pages/airline/airline').then(m => m.Airline), // layout chính
    //trong ailine có các component con là dashboard, management, report, setting
    children: [
      {
        path: 'airline-dashboard',
        loadComponent: () =>
          import('./components/airline-dashboard/airline-dashboard')
            .then(m => m.AirlineDashboard)
      },
      {
        path: 'airline-management',
        loadComponent: () =>
          import('./components/airline-management/airline-management')
            .then(m => m.AirlineManagement)
      },
      {
        path: 'airline-report',
        loadComponent: () =>
          import('./components/airline-report/airline-report')
            .then(m => m.AirlineReport)
      },{
        path: 'airline-setting',
        loadComponent: () =>
          import('./components/airline-setting/airline-setting')
            .then(m => m.AirlineSetting)
      },
      {
        path: '',
     loadComponent: () =>
          import('./components/airline-dashboard/airline-dashboard')
            .then(m => m.AirlineDashboard)
      }
    ]
  },
  {
    path: "airline-card-detail/:id",//:id là tham số động, id vé
    loadComponent() {
       return import('./pages/airline-card-detail/airline-card-detail').then(m => m.AirlineCardDetail)
    },
  },
  {
    path: "ticket-list",
    loadComponent: () => {
      return import('./pages/ticket-list/ticket-list').then(m => m.TicketList)
    }
  },


];
