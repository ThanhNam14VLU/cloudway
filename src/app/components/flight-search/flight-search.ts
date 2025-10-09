import { Component, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgClass, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AirportModel } from '../../models/airport.model';
import { AirportService } from '../../services/airport/airport.service';
import { FlightService } from '../../services/flight/flight.service';
import { FlightSearchRequest } from '../../models/flight.model';

@Component({
  selector: 'app-flight-search',
  imports: [
    MatIcon,
    FormsModule,
    NgClass,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './flight-search.html',
  styleUrl: './flight-search.scss'
})
export class FlightSearch implements AfterViewInit, OnInit {
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  airports: AirportModel[] = [];
  
  // Form data
  departureAirportId: string = '';   // UUID của sân bay đi
  destinationAirportId: string = ''; // UUID của sân bay đến
  departureDate: string = '';
  returnDate: string = '';
  adults: number = 1;
  children: number = 0;
  infants: number = 0;

  // UI state
  isLoading: boolean = false;
  errorMessages: string[] = [];

  constructor(
    private router: Router, 
    private elementRef: ElementRef, 
    private airportService: AirportService,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    // Load airports
    this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
        console.log('✅ Loaded airports:', this.airports);
      },
      error: (error) => {
        console.error('❌ Error loading airports:', error);
        this.errorMessages.push('Không thể tải danh sách sân bay');
      }
    });

    // Set default dates
    this.setDefaultDates();
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

  /**
   * Set default dates (today and tomorrow)
   */
  private setDefaultDates(): void {
    const today = new Date();
    this.departureDate = this.formatDateForInput(today);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.returnDate = this.formatDateForInput(tomorrow);
  }

  /**
   * Format date for input[type="date"]
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get minimum date (today)
   */
  get minDate(): string {
    return this.formatDateForInput(new Date());
  }

  /**
   * Get minimum return date (departure date + 1)
   */
  get minReturnDate(): string {
    if (this.departureDate) {
      const departDate = new Date(this.departureDate);
      departDate.setDate(departDate.getDate() + 1);
      return this.formatDateForInput(departDate);
    }
    return this.minDate;
  }

  /**
   * Search flights - Gửi request lên backend
   */
  searchFlights(): void {
    this.errorMessages = [];
    
    // Build search request
    const searchRequest: FlightSearchRequest = {
      departure_airport_id: this.departureAirportId,
      destination_airport_id: this.destinationAirportId,
      departure_date: this.departureDate,
      return_date: this.tripType === 'roundtrip' ? this.returnDate : undefined,
      trip_type: this.tripType,
      adults: this.adults,
      children: this.children,
      infants: this.infants
    };

    // Validate
    const validationErrors = this.flightService.validateSearchParams(searchRequest);
    
    if (validationErrors.length > 0) {
      this.errorMessages = validationErrors;
      return;
    }

    // Show loading
    this.isLoading = true;

    // Call backend API
    this.flightService.searchFlights(searchRequest).subscribe({
      next: (response) => {
        console.log('✅ Flight search response:', response);
        
        // Check nếu có flights
        const hasOutboundFlights = response.outbound?.flights && response.outbound.flights.length > 0;
        const hasReturnFlights = response.return?.flights && response.return.flights.length > 0;
        
        if (hasOutboundFlights) {
          // Navigate to ticket-list với kết quả
          this.router.navigate(['/ticket-list'], {
            state: { searchResult: response }
          });
        } else {
          this.errorMessages.push('Không tìm thấy chuyến bay phù hợp với yêu cầu của bạn');
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Flight search error:', error);
        this.errorMessages.push(
          error.error?.message || 'Có lỗi xảy ra khi tìm kiếm chuyến bay. Vui lòng thử lại.'
        );
        this.isLoading = false;
      }
    });
  }

  /**
   * Clear error messages
   */
  clearErrors(): void {
    this.errorMessages = [];
  }

  /**
   * Handle trip type change
   */
  onTripTypeChange(): void {
    this.clearErrors();
    if (this.tripType === 'oneway') {
      this.returnDate = '';
    } else {
      // Set return date if empty
      if (!this.returnDate && this.departureDate) {
        const departDate = new Date(this.departureDate);
        departDate.setDate(departDate.getDate() + 1);
        this.returnDate = this.formatDateForInput(departDate);
      }
    }
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
