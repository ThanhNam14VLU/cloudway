import { Component } from '@angular/core';
import { FlightSearch } from '../../components/flight-search/flight-search';
import { FlightCard } from '../../components/flight-card/flight-card';
import { Feature } from '../../feature/feature';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { Airline } from '../airline/airline';

@Component({
  selector: 'app-home',
  imports: [FlightSearch,FlightCard,Feature,Header,Footer,Airline],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  flights = [1,2,3,4,5];
  
}
