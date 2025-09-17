import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-flight-card',
  imports: [MatButtonModule],
  templateUrl: './flight-card.html',
  styleUrl: './flight-card.scss'
})
export class FlightCard {
flight = {
    code: 'QH290',
    airline: 'Vietravel Airlines',
    logo: './assets/images/vietravel.webp',
    departTime: '23:25',
    departAirport: 'SGN',
    arriveTime: '01:35',
    arriveAirport: 'HAN',
    price: 1420000
  };
}
