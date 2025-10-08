import { Component, AfterViewInit, ElementRef } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {NgClass} from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AirportModel } from '../../models/airport.model';
import { AirportService } from '../../services/airport/airport.service';

@Component({
  selector: 'app-flight-search',
  imports: [
    MatIcon,
    FormsModule,
    NgClass,
    MatButtonModule
  ],
  templateUrl: './flight-search.html',
  styleUrl: './flight-search.scss'
})
export class FlightSearch implements AfterViewInit {
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  airports!: AirportModel[];
  
  // Form data
  departure: string = '';
  destination: string = '';
  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  infants: number = 0;

  constructor(private router: Router, private elementRef: ElementRef, private airportService: AirportService) {
    this.airportService.getAirports().subscribe((airports) => {
      this.airports = airports;
      console.log(this.airports);
    });
  }

  ngAfterViewInit() {
    // Đảm bảo video được tắt âm hoàn toàn
    const video = this.elementRef.nativeElement.querySelector('video');
    if (video) {
      video.muted = true;
      video.volume = 0;
      video.defaultMuted = true;
    }
  }

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
