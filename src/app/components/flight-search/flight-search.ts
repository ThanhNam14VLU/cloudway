import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-flight-search',
  imports: [
    MatIcon,
    FormsModule,
    NgClass
  ],
  templateUrl: './flight-search.html',
  styleUrl: './flight-search.scss'
})
export class FlightSearch {
  tripType: 'oneway' | 'roundtrip' = 'oneway';

  get isRoundTrip(): boolean {
    return this.tripType === 'roundtrip';
  }
}
