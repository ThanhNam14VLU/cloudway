import { Component, AfterViewInit, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { NgClass, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AirportModel } from '../../models/airport.model';
import { AirportService } from '../../services/airport/airport.service';
import { FlightService } from '../../services/flight/flight.service';
import { FlightSearchRequest } from '../../models/flight.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-flight-search',
  imports: [
    MatIcon,
    FormsModule,
    NgClass,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './flight-search.html',
  styleUrl: './flight-search.scss'
})
export class FlightSearch implements AfterViewInit, OnInit, OnDestroy {
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

  // Custom dropdown state
  departureDropdownOpen: boolean = false;
  destinationDropdownOpen: boolean = false;
  departureSearchTerm: string = '';
  destinationSearchTerm: string = '';
  filteredDepartureAirports: AirportModel[] = [];
  filteredDestinationAirports: AirportModel[] = [];

  // UI state
  isLoading: boolean = false;
  errorMessages: string[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router, 
    private elementRef: ElementRef, 
    private airportService: AirportService,
    private flightService: FlightService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Load airports
    const airportsSub = this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
        this.filteredDepartureAirports = [...airports];
        this.filteredDestinationAirports = [...airports];
        console.log('✅ Loaded airports:', this.airports);
      },
      error: (error) => {
        console.error('❌ Error loading airports:', error);
        this.errorMessages.push('Không thể tải danh sách sân bay');
      }
    });
    this.subscriptions.push(airportsSub);

    // Load existing search params if available
    this.loadExistingSearchParams();

    // Set default dates
    this.setDefaultDates();

    // Add click outside listener
    this.addClickOutsideListener();
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

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load existing search params from service or route state
   */
  private loadExistingSearchParams(): void {
    // Check if we have search params from service
    const existingParams = this.flightService.getCurrentSearchParams();
    if (existingParams) {
      this.tripType = existingParams.trip_type;
      this.departureAirportId = existingParams.departure_airport_id;
      this.destinationAirportId = existingParams.destination_airport_id;
      this.departureDate = existingParams.departure_date;
      this.returnDate = existingParams.return_date || '';
      this.adults = existingParams.adults;
      this.children = existingParams.children;
      this.infants = existingParams.infants;
      console.log('✅ Loaded existing search params:', existingParams);
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
    const searchSub = this.flightService.searchFlights(searchRequest).subscribe({
      next: (response) => {
        console.log('✅ Flight search response:', response);
        
        // Check nếu có flights
        const hasOutboundFlights = response.outbound?.flights && response.outbound.flights.length > 0;
        const hasReturnFlights = response.return?.flights && response.return.flights.length > 0;
        
        console.log('🔍 Has outbound flights:', hasOutboundFlights);
        console.log('🔍 Outbound flights count:', response.outbound?.flights?.length || 0);
        console.log('🔍 Has return flights:', hasReturnFlights);
        console.log('🔍 Return flights count:', response.return?.flights?.length || 0);
        
        if (hasOutboundFlights) {
          console.log('🚀 Navigating to ticket-list with search result...');
          
          // Store result in service
          this.flightService.setSearchResult(response);
          console.log('💾 Search result stored in service');
          
          // Navigate to ticket-list với kết quả
          this.router.navigate(['/ticket-list'], {
            state: { searchResult: response }
          }).then(() => {
            console.log('✅ Navigation completed');
          }).catch((error) => {
            console.error('❌ Navigation failed:', error);
          });
        } else {
          console.log('⚠️ No outbound flights found, showing error message');
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
    
    this.subscriptions.push(searchSub);
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

  // Custom dropdown methods
  toggleDepartureDropdown(): void {
    this.departureDropdownOpen = !this.departureDropdownOpen;
    if (this.departureDropdownOpen) {
      this.destinationDropdownOpen = false;
      this.departureSearchTerm = '';
      this.filterDepartureAirports();
    }
  }

  toggleDestinationDropdown(): void {
    this.destinationDropdownOpen = !this.destinationDropdownOpen;
    if (this.destinationDropdownOpen) {
      this.departureDropdownOpen = false;
      this.destinationSearchTerm = '';
      this.filterDestinationAirports();
    }
  }

  selectDepartureAirport(airportId: string, event: Event): void {
    event.stopPropagation();
    this.departureAirportId = airportId;
    this.departureDropdownOpen = false;
    this.clearErrors();
  }

  selectDestinationAirport(airportId: string, event: Event): void {
    event.stopPropagation();
    this.destinationAirportId = airportId;
    this.destinationDropdownOpen = false;
    this.clearErrors();
  }

  filterDepartureAirports(): void {
    if (!this.departureSearchTerm.trim()) {
      this.filteredDepartureAirports = [...this.airports];
    } else {
      const searchTerm = this.departureSearchTerm.toLowerCase();
      this.filteredDepartureAirports = this.airports.filter(airport =>
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.iata_code.toLowerCase().includes(searchTerm)
      );
    }
  }

  filterDestinationAirports(): void {
    if (!this.destinationSearchTerm.trim()) {
      this.filteredDestinationAirports = [...this.airports];
    } else {
      const searchTerm = this.destinationSearchTerm.toLowerCase();
      this.filteredDestinationAirports = this.airports.filter(airport =>
        airport.name.toLowerCase().includes(searchTerm) ||
        airport.city.toLowerCase().includes(searchTerm) ||
        airport.iata_code.toLowerCase().includes(searchTerm)
      );
    }
  }

  getSelectedAirport(airportId: string): AirportModel | undefined {
    return this.airports.find(airport => airport.id === airportId);
  }

  private addClickOutsideListener(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const isInsideDropdown = target.closest('.custom-dropdown');
      
      if (!isInsideDropdown) {
        this.departureDropdownOpen = false;
        this.destinationDropdownOpen = false;
      }
    });
  }
}
