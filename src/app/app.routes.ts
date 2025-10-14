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
import { AuthCallbackComponent } from './auth-callback.component';

import {Admin} from './pages/admin/admin';
import { AdminDashboard} from './components/admin-dashboard/admin-dashboard';
import { AdminAirlines } from './components/admin-airlines/admin-airlines';
import { AdminAirports} from './components/admin-airports/admin-airports';
import { AdminCustomers}  from './components/admin-customers/admin-customers';
import { AdminFlights} from './components/admin-flights/admin-flights';
import { AdminBookings} from './components/admin-bookings/admin-bookings';
import { AdminReports} from './components/admin-reports/admin-reports';
import { AdminSettings} from './components/admin-settings/admin-settings';
import {Profile}   from './pages/profile/profile';

export const routes: Routes = [
  {
    path: '',
    // loadComponent: () =>
    //   import('./pages/home/home').then(m => m.Home),
    loadComponent: () =>
      import('./pages/profile/profile').then(m => m.Profile),
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
    path: 'admin',
    loadComponent: () =>
       import('./pages/admin/admin').then(m => m.Admin),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/admin-dashboard/admin-dashboard')
                .then(m => m.AdminDashboard)
          },
        {
          path: 'admin-dashboard',
          loadComponent: () =>
            import('./components/admin-dashboard/admin-dashboard')
              .then(m => m.AdminDashboard)
        },
        {
          path: 'admin-flights',
          loadComponent: () =>
            import('./components/admin-flights/admin-flights')
              .then(m => m.AdminFlights)
        },
        {
          path: 'admin-bookings',
          loadComponent: () =>
            import('./components/admin-bookings/admin-bookings')
              .then(m => m.AdminBookings)
        },
          {
            path: 'admin-customers',
            loadComponent: () =>
              import('./components/admin-customers/admin-customers')
                .then(m => m.AdminCustomers)
          },
          {
            path: 'admin-airlines',
            loadComponent: () =>
              import('./components/admin-airlines/admin-airlines')
                .then(m => m.AdminAirlines)
          },

          {
            path: 'admin-airports',
            loadComponent: () =>
              import('./components/admin-airports/admin-airports')
                .then(m => m.AdminAirports)
          },
          {
          path: 'admin-reports',
          loadComponent: () =>
            import('./components/admin-reports/admin-reports')
              .then(m => m.AdminReports)
        },
        {
          path: 'admin-settings',
          loadComponent: () =>
            import('./components/admin-settings/admin-settings')
              .then(m => m.AdminSettings)
        },
      ]
  },

  {
    path: 'airline',
    loadComponent: () =>
      import('./pages/airline/airline').then(m => m.Airline), // layout chính
    //trong ailine có các component con là dashboard, management, report, setting
    children: [
      { path: '', redirectTo: 'airline-dashboard', pathMatch: 'full' },
      {
        path: '',
        loadComponent: () =>
          import('./components/airline-dashboard/airline-dashboard')
            .then(m => m.AirlineDashboard)
      },
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
  {
    path: "auth/callback",
    loadComponent: () => {
      return import('./auth-callback.component').then(m => m.AuthCallbackComponent)
    }
  },
  {
    path: "reset-password",
    loadComponent: () => {
      return import('./pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)
    }
  },
  {
    path: "booking-success",
    loadComponent: () => {
      return import('./pages/booking-success/booking-success').then(m => m.BookingSuccess)
    }
  }
];
