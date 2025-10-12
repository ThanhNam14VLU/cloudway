import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-airline-nav',
  imports: [RouterLink],
  templateUrl: './airline-nav.html',
  styleUrl: './airline-nav.scss'
})
export class AirlineNav {
  isActive=1;
  Active(active:number){
    this.isActive=active;
  }

}
