import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AdminNav} from '../../components/admin-nav/admin-nav';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet,AdminNav],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
