import { Component } from '@angular/core';
import { AirlineAddFlightForm } from '../airline-add-flight-form/airline-add-flight-form';

@Component({
  selector: 'app-airline-management',
  imports: [AirlineAddFlightForm],
  standalone: true,
  templateUrl: './airline-management.html',
  styleUrl: './airline-management.scss'
})
export class AirlineManagement {
  //biến kiểm tra
  isShowForm = false;
  //ẩn hiện form
  ShowForm() {
    this.isShowForm = !this.isShowForm;
  }

}
