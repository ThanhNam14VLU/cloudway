import { Component } from '@angular/core';
import { AirlineNav } from '../../components/airline-nav/airline-nav';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-airline',
  imports: [RouterOutlet, AirlineNav, Header],
  templateUrl: './airline.html',
  styleUrl: './airline.scss'
})
export class Airline {
  nav_selected = 1;//biến kiểm tra chức năng nào được chọn trên thanh nav
  Selected(nav_selected: number) {
    this.nav_selected = nav_selected;
  }

}
