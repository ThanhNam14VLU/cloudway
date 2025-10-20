import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AdminNav} from '../../components/admin-nav/admin-nav';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet,AdminNav, Header],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

}
