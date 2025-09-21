import { Component } from '@angular/core';
import { FlightSearch } from '../../components/flight-search/flight-search';
import { FlightCard } from '../../components/flight-card/flight-card';
import { Feature } from '../../feature/feature';

@Component({
  selector: 'app-home',
  imports: [FlightSearch,FlightCard,Feature],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  flights = [1,2,3,4,5];
  
}
