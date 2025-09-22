import { Component } from '@angular/core';

@Component({
  selector: 'app-airline-nav',
  imports: [],
  templateUrl: './airline-nav.html',
  styleUrl: './airline-nav.scss'
})
export class AirlineNav {
  isActive=1;
  Active(active:number){
    this.isActive=active;
  }

}
