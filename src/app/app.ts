import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Feature } from './feature/feature';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Footer,Feature],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cloudway');
}
