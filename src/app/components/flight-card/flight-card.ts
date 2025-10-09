import { Component, Input } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import { RouterLink } from '@angular/router';

interface Flight {
  code: string;
  airline: string;
  logo: string;
  departTime: string;
  departAirport: string;
  arriveTime: string;
  arriveAirport: string;
  price: number;
  duration?: string;
  aircraft?: string;
  class?: string;
  carryOn?: string;
  checkedBaggage?: string;
}

@Component({
  selector: 'app-flight-card',
  imports: [MatButtonModule,RouterLink],
  templateUrl: './flight-card.html',
  styleUrl: './flight-card.scss'
})
export class FlightCard {
  @Input() flight!: Flight;
  
  isDropped: boolean = false;//check xem chi tiết vé
  
  Dropdown() {
    this.isDropped = !this.isDropped;
  }

  // formatPrice(price: number): string {
  //   return price.toLocaleString('vi-VN');
  // }
}
