import { Component, signal } from '@angular/core';
import { RouterEvent, RouterLink, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Feature } from './components/feature/feature';
import { FlightCard } from './components/flight-card/flight-card';
import { Login } from './pages/login/login';
import { FlightSearch } from './components/flight-search/flight-search';
import { Header } from './components/header/header';
import { AirlineLogin } from './components/airline-login/airline-login';
import { Stepper } from './components/stepper/stepper';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Feature, FlightCard, RouterLink, Login, FlightSearch, AirlineLogin, Stepper,],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cloudway');
}
