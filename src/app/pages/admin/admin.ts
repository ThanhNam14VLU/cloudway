import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {AdminNav} from '../../components/admin-nav/admin-nav';
import {AdminCustomers} from '../../components/admin-customers/admin-customers';
import {AdminDashboard} from '../../components/admin-dashboard/admin-dashboard';

@Component({
  selector: 'app-admin',
  imports: [RouterLink,RouterOutlet,AdminNav,AdminCustomers,AdminDashboard],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
