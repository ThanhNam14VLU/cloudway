import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalNotification } from './components/global-notification/global-notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalNotification],
  providers: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('cloudway');
}
