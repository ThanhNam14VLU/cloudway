import { Component, signal } from '@angular/core';
import { RouterEvent, RouterLink, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Feature } from './feature/feature';
import { FlightCard } from './components/flight-card/flight-card';
import { Login } from './pages/login/login';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Feature, FlightCard,RouterLink,Login],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cloudway');
}
