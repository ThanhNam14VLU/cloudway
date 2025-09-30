import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';
import { Router } from '@angular/router';

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
  
  // Form data
  departure: string = '';
  destination: string = '';
  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  infants: number = 0;

  constructor(private router: Router) {}

  get isRoundTrip(): boolean {
    return this.tripType === 'roundtrip';
  }

  searchFlights() {
    // Navigate to ticket-list page with search parameters
    const queryParams = {
      departure: this.departure,
      destination: this.destination,
      departureDate: this.departureDate,
      returnDate: this.returnDate,
      adults: this.adults,
      children: this.children,
      infants: this.infants,
      tripType: this.tripType
    };
    
    this.router.navigate(['/ticket-list'], { queryParams });
  }

  // Counter methods
  decreaseAdults() {
    if (this.adults > 1) {
      this.adults--;
    }
  }

  increaseAdults() {
    this.adults++;
  }

  decreaseChildren() {
    if (this.children > 0) {
      this.children--;
    }
  }

  increaseChildren() {
    this.children++;
  }

  decreaseInfants() {
    if (this.infants > 0) {
      this.infants--;
    }
  }

  increaseInfants() {
    this.infants++;
  }
}
