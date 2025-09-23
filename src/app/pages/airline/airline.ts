import { Component } from '@angular/core';
import { AirlineHeader } from '../../components/airline-header/airline-header';
import { AirlineNav } from '../../components/airline-nav/airline-nav';
import { AirlineDashboard } from '../../components/airline-dashboard/airline-dashboard';
import { AirlineManagement } from '../../components/airline-management/airline-management';
import { AirlineAddFlightForm } from '../../airline-add-flight-form/airline-add-flight-form';

@Component({
  selector: 'app-airline',
  imports: [AirlineHeader,AirlineNav,AirlineDashboard,AirlineManagement,AirlineAddFlightForm],
  templateUrl: './airline.html',
  styleUrl: './airline.scss'
})
export class Airline {
  nav_selected=1;//biến kiểm tra chức năng nào được chọn trên thanh nav
  Selected(nav_selected:number){
    this.nav_selected=nav_selected;
  }

}
