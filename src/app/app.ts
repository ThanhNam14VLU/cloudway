import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlightCard } from './components/flight-card/flight-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FlightCard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cloudway');
}
