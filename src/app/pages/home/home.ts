import { Component } from '@angular/core';
import { FlightSearch } from '../../components/flight-search/flight-search';
import { Feature } from '../../components/feature/feature';
import { Footer } from '../../components/footer/footer';
import { Header } from '../../components/header/header';
import { AirportService } from '../../services/airport/airport.service';
import { AirportModel } from '../../models/airport.model';

@Component({
  selector: 'app-home',
  imports: [FlightSearch, Feature, Header, Footer],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  
}
