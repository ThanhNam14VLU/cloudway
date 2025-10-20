import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightCard } from '../../components/flight-card/flight-card';
import { MatButtonModule } from '@angular/material/button';
import { Header } from '../../components/header/header';
import { FlightService } from '../../services/flight/flight.service';
import { AirportService } from '../../services/airport/airport.service';
import { AirportModel } from '../../models/airport.model';
import { FlightSearchRequest, FlightSearchResponse } from '../../models/flight.model';
import { NotificationService } from '../../services/notification/notification.service';
import { Subscription } from 'rxjs';

interface Flight {
  code: string;
  airline: string;
  logo: string;
  departTime: string;
  departAirport: string;
  arriveTime: string;
  arriveAirport: string;
  price: number;
  duration: string;
  aircraft: string;
  class: string;
  carryOn: string;
  checkedBaggage: string;
  // API fields for booking
  flight_instance_id?: string;
  fare_bucket_id?: string;
  // New fields from updated API
  flight_id?: string;
  status?: string;
  available_seats?: number;
  total_seats?: number;
  fares?: Array<{
    base_price: number;
    fare_bucket: {
      id: string;
      code: string;
      class_type: string;
      description: string;
    };
  }>;
  pricing?: {
    base_price: number;
    total_passengers: number;
    total_price: number;
    currency: string;
    breakdown: {
      adults: {
        count: number;
        unit_price: number;
        total: number;
      };
      children: {
        count: number;
        unit_price: number;
        total: number;
      };
      infants: {
        count: number;
        unit_price: number;
        total: number;
      } | null;
    };
  };
}

interface SearchParams {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate: string;
}

interface Airline {
  name: string;
  selected: boolean;
}

interface DateOption {
  dayName: string;
  dayNumber: string;
  date: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-ticket-list',
  imports: [
    FormsModule,
    MatIcon,
    CommonModule,
    FlightCard,
    MatButtonModule,
    Header
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit, OnDestroy {
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  showPassengerDropdown: boolean = false;
  isFlightsCollapsed: boolean = false;
  isReturnFlightsCollapsed: boolean = false;

  // API search result data
  searchResult: FlightSearchResponse | null = null;
  apiFlights: Flight[] = [];
  apiReturnFlights: Flight[] = [];
  isLoading: boolean = false;
  airports: AirportModel[] = [];

  passengers = {
    adults: 1,
    children: 0,
    infants: 0
  };

  searchParams: SearchParams = {
    departure: '',
    destination: '',
    departureDate: '',
    returnDate: ''
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private airportService: AirportService,
    private notificationService: NotificationService
  ) {}

  airlines: Airline[] = [
    { name: 'Bamboo Airways', selected: false },
    { name: 'Vietravel Airlines', selected: false },
    { name: 'Vietjet Air', selected: false },
    { name: 'Vietnam Airlines', selected: false }
  ];

  availableDates: DateOption[] = [
    { dayName: 'Chủ nhật', dayNumber: '14', date: '2025-09-14', isSelected: false },
    { dayName: 'Thứ 2', dayNumber: '15', date: '2025-09-15', isSelected: false },
    { dayName: 'Thứ 3', dayNumber: '16', date: '2025-09-16', isSelected: true },
    { dayName: 'Thứ 4', dayNumber: '17', date: '2025-09-17', isSelected: false },
    { dayName: 'Thứ 5', dayNumber: '18', date: '2025-09-18', isSelected: false },
    { dayName: 'Thứ 6', dayNumber: '19', date: '2025-09-19', isSelected: false },
    { dayName: 'Thứ 7', dayNumber: '20', date: '2025-09-20', isSelected: false }
  ];

  

  filteredFlights: Flight[] = [];
  filteredReturnFlights: Flight[] = [];

  // Selected flights for booking
  selectedDepartureFlight: Flight | null = null;
  selectedReturnFlight: Flight | null = null;

  ngOnInit() {
    
    // Load airports
    this.loadAirports();
    
    // Load search params from service
    this.loadSearchParamsFromService();
    
    // Get search result from router state
    const navigation = this.router.getCurrentNavigation();
    
    if (navigation?.extras?.state?.['searchResult']) {
      this.searchResult = navigation.extras.state['searchResult'];
      this.loadSearchResult();
    } else {
      console.warn('⚠️ No search result found in router state');
      
      // Try to get from service as fallback
      const serviceResult = this.flightService.getCurrentSearchResult();
      if (serviceResult) {
        this.searchResult = serviceResult;
        this.loadSearchResult();
      } else {
        this.router.navigate(['/']);
      }
    }

    // Get query parameters from the route
    this.route.queryParams.subscribe(params => {
      if (params['departure']) {
        this.searchParams.departure = params['departure'];
      }
      if (params['destination']) {
        this.searchParams.destination = params['destination'];
      }
      if (params['departureDate']) {
        this.searchParams.departureDate = params['departureDate'];
      }
      if (params['tripType']) {
        this.tripType = params['tripType'];
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Load airports from API
   */
  private loadAirports(): void {
    const airportsSub = this.airportService.getAirports().subscribe({
      next: (airports) => {
        this.airports = airports;
      },
      error: (error) => {
        console.error('❌ Error loading airports in ticket-list:', error);
      }
    });
    this.subscriptions.push(airportsSub);
  }

  /**
   * Load search params from service
   */
  private loadSearchParamsFromService(): void {
    const searchParams = this.flightService.getCurrentSearchParams();
    if (searchParams) {
      this.tripType = searchParams.trip_type;
      this.passengers.adults = searchParams.adults;
      this.passengers.children = searchParams.children;
      this.passengers.infants = searchParams.infants;
      this.searchParams.departureDate = searchParams.departure_date;
      this.searchParams.returnDate = searchParams.return_date || '';
      
      // Find airport codes by IDs (only if airports are loaded)
      if (this.airports.length > 0) {
        const departureAirport = this.airports.find(a => a.id === searchParams.departure_airport_id);
        const destinationAirport = this.airports.find(a => a.id === searchParams.destination_airport_id);
        
        if (departureAirport) {
          this.searchParams.departure = departureAirport.iata_code;
        }
        if (destinationAirport) {
          this.searchParams.destination = destinationAirport.iata_code;
        }
      }
    }
  }

  useMockData() {
    console.log('🔄 No API data available, showing empty state...');
    // Clear API data
    this.apiFlights = [];
    this.apiReturnFlights = [];
    // Clear filtered data
    this.filteredFlights = [];
    this.filteredReturnFlights = [];
    console.log('✅ Empty state loaded - no flights to display');
  }

  loadSearchResult() {
    if (!this.searchResult) return;


    // Set trip type and passengers from search result
    this.tripType = this.searchResult.trip_type || 'oneway';
    if (this.searchResult.passengers) {
      console.log('👥 Setting passengers from search result:', this.searchResult.passengers);
      this.passengers = {
        adults: this.searchResult.passengers.adults || 1,
        children: this.searchResult.passengers.children || 0,
        infants: this.searchResult.passengers.infants || 0
      };
      console.log('👥 Passengers updated to:', this.passengers);
    } else {
      console.warn('⚠️ No passengers data in search result');
    }

    // Process outbound flights
    if (this.searchResult.outbound?.flights) {
      this.apiFlights = this.searchResult.outbound.flights.map((flight: any) => 
        this.convertApiFlightToFlight(flight)
      );
      console.log('🛫 API flights processed:', this.apiFlights.length);
    }

    // Process return flights (if roundtrip)
    if (this.searchResult.return?.flights) {
      this.apiReturnFlights = this.searchResult.return.flights.map((flight: any) => 
        this.convertApiFlightToFlight(flight)
      );
      console.log('🛬 API return flights processed:', this.apiReturnFlights.length);
    }

    // Update airlines list from API data
    this.updateAirlinesFromApiData();

    // Update filtered flights with API data and apply current filters
    this.filterFlights();

    // Update search params with real data
    if (this.apiFlights.length > 0) {
      const firstFlight = this.searchResult.outbound.flights[0];
      if (firstFlight.departure?.airport) {
        this.searchParams.departure = firstFlight.departure.airport.iata_code;
      }
      if (firstFlight.arrival?.airport) {
        this.searchParams.destination = firstFlight.arrival.airport.iata_code;
      }
      if (this.searchResult.outbound.departure_date) {
        this.searchParams.departureDate = this.searchResult.outbound.departure_date;
      }
      if (this.searchResult.return?.departure_date) {
        this.searchParams.returnDate = this.searchResult.return.departure_date;
      }
    }

    console.log('✅ Search result loaded successfully');
  }

  /**
   * Update airlines list from API data
   */
  private updateAirlinesFromApiData(): void {
    const uniqueAirlines = new Set<string>();
    
    // Collect unique airlines from API flights
    [...this.apiFlights, ...this.apiReturnFlights].forEach(flight => {
      if (flight.airline && flight.airline !== 'Unknown Airline') {
        uniqueAirlines.add(flight.airline);
      }
    });
    
    // Update airlines list
    this.airlines = Array.from(uniqueAirlines).map(airlineName => ({
      name: airlineName,
      selected: false
    }));
    
    console.log('✅ Updated airlines list from API data:', this.airlines);
  }

  /**
   * Clear all airline filters
   */
  clearAirlineFilters(): void {
    this.airlines.forEach(airline => airline.selected = false);
    this.filterFlights();
    console.log('✅ Cleared all airline filters');
  }

  // Flight selection methods
  selectDepartureFlight(flight: Flight): void {
    this.selectedDepartureFlight = flight;
    console.log('🔁 Step 1 - Selected departure flight:', flight.code, flight.flight_instance_id);
    // Persist in service for downstream pages
    this.flightService.setSelectedFlight(flight);
  }

  selectReturnFlight(flight: Flight): void {
    this.selectedReturnFlight = flight;
    console.log('🔁 Step 1 - Selected return flight:', flight.code, flight.flight_instance_id);
    // Persist in service for downstream pages
    this.flightService.setSelectedReturnFlight(flight);
  }

  proceedToBooking(): void {
    console.log('🔁 Step 1 - proceedToBooking called');
    console.log('🔁 Step 1 - selectedDepartureFlight:', this.selectedDepartureFlight?.code, this.selectedDepartureFlight?.flight_instance_id);
    console.log('🔁 Step 1 - selectedReturnFlight:', this.selectedReturnFlight?.code, this.selectedReturnFlight?.flight_instance_id);
    console.log('🔁 Step 1 - tripType:', this.tripType);
    
    // Store passenger data in service for airline-card-detail to access
    this.flightService.setPassengers(this.passengers);
    
    // Store selected flight data in service
    if (this.selectedDepartureFlight) {
      this.flightService.setSelectedFlight(this.selectedDepartureFlight);
    }
    
    if (this.tripType === 'oneway' && this.selectedDepartureFlight) {
      // Create booking data for oneway
      const bookingData = this.createBookingData([this.selectedDepartureFlight]);
      
      // Navigate to booking page with selected flight
      const navigationState = {
        selectedFlight: this.selectedDepartureFlight,
        searchParams: this.searchParams,
        passengers: this.passengers,
        tripType: this.tripType,
        bookingData: bookingData
      };
      
      this.router.navigate(['/airline-card-detail/1'], {
        state: navigationState
      });
    } else if (this.tripType === 'roundtrip' && this.selectedDepartureFlight && this.selectedReturnFlight) {
      // Create booking data for roundtrip
      const bookingData = this.createBookingData([this.selectedDepartureFlight, this.selectedReturnFlight]);
      // Debug duy nhất cho khứ hồi
      console.log('🔁 Roundtrip - segments prepared:', bookingData?.segments?.length, bookingData?.segments);
      
      // Navigate to booking page with both selected flights
      const navigationState = {
        selectedDepartureFlight: this.selectedDepartureFlight,
        selectedReturnFlight: this.selectedReturnFlight,
        searchParams: this.searchParams,
        passengers: this.passengers,
        tripType: this.tripType,
        bookingData: bookingData
      };
      // Debug duy nhất cho khứ hồi
      console.log('🔁 Roundtrip - navigating with two flights');
      
      this.router.navigate(['/airline-card-detail/1'], {
        state: navigationState
      });
    } else {
      // Show alert if flights are not selected properly
      if (this.tripType === 'oneway' && !this.selectedDepartureFlight) {
        this.notificationService.showWarning('Cảnh báo', 'Vui lòng chọn chuyến bay đi trước khi tiếp tục');
      } else if (this.tripType === 'roundtrip') {
        if (!this.selectedDepartureFlight && !this.selectedReturnFlight) {
          this.notificationService.showWarning('Cảnh báo', 'Vui lòng chọn cả chuyến bay đi và về trước khi tiếp tục');
        } else if (!this.selectedDepartureFlight) {
          this.notificationService.showWarning('Cảnh báo', 'Vui lòng chọn chuyến bay đi trước khi tiếp tục');
        } else if (!this.selectedReturnFlight) {
          this.notificationService.showWarning('Cảnh báo', 'Vui lòng chọn chuyến bay về trước khi tiếp tục');
        }
      }
    }
  }

  createBookingData(flights: Flight[]): any {
    const segments = flights.map(flight => ({
      flight_instance_id: flight.flight_instance_id,
      fare_bucket_id: flight.fare_bucket_id,
      passengers: this.createPassengerData()
    }));

    return {
      user_id: this.getCurrentUserId(), // You'll need to implement this
      contact_fullname: '', // Will be filled in information page
      contact_phone: '', // Will be filled in information page
      segments: segments
    };
  }

  createPassengerData(): any[] {
    const passengers = [];
    
    // Add adults
    for (let i = 0; i < this.passengers.adults; i++) {
      passengers.push({
        full_name: '', // Will be filled in information page
        date_of_birth: '', // Will be filled in information page
        passenger_type: 'ADULT'
      });
    }
    
    // Add children
    for (let i = 0; i < this.passengers.children; i++) {
      passengers.push({
        full_name: '', // Will be filled in information page
        date_of_birth: '', // Will be filled in information page
        passenger_type: 'CHILD'
      });
    }
    
    // Add infants
    for (let i = 0; i < this.passengers.infants; i++) {
      passengers.push({
        full_name: '', // Will be filled in information page
        date_of_birth: '', // Will be filled in information page
        passenger_type: 'INFANT'
      });
    }
    
    return passengers;
  }

  getCurrentUserId(): string {
    // Get user ID from localStorage or auth service
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id || userData.user_id || '';
    }
    return '';
  }

  isFlightSelected(flight: Flight, isReturn: boolean = false): boolean {
    if (isReturn) {
      return this.selectedReturnFlight?.code === flight.code;
    } else {
      return this.selectedDepartureFlight?.code === flight.code;
    }
  }

  canProceedToBooking(): boolean {
    // Always show the proceed button, validation will be done in proceedToBooking()
    return true;
  }

  getTotalPrice(): number {
    let total = 0;
    if (this.selectedDepartureFlight) {
      total += this.selectedDepartureFlight.pricing?.base_price || this.selectedDepartureFlight.price || 0;
    }
    if (this.selectedReturnFlight) {
      total += this.selectedReturnFlight.pricing?.base_price || this.selectedReturnFlight.price || 0;
    }
    return total;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }

  convertApiFlightToFlight(apiFlight: any): Flight {
    console.log('🔄 Converting API flight:', apiFlight);
    
    // Get the lowest price from fares array
    const lowestPrice = apiFlight.fares && apiFlight.fares.length > 0 
      ? Math.min(...apiFlight.fares.map((fare: any) => fare.base_price))
      : apiFlight.pricing?.total_price || 0;
    
    // Get the first fare bucket for booking (default to first available)
    const defaultFare = apiFlight.fares && apiFlight.fares.length > 0 
      ? apiFlight.fares[0] 
      : null;
    
    return {
      code: apiFlight.flight_number || apiFlight.flight_id || 'N/A',
      airline: apiFlight.airline?.name || 'Unknown Airline',
      logo: apiFlight.airline?.logo || '/assets/images/logo.png',
      departTime: this.formatTime(apiFlight.departure?.time),
      departAirport: apiFlight.departure?.airport?.iata_code || 'N/A',
      arriveTime: this.formatTime(apiFlight.arrival?.time),
      arriveAirport: apiFlight.arrival?.airport?.iata_code || 'N/A',
      price: lowestPrice,
      duration: apiFlight.duration?.formatted || 'N/A',
      aircraft: apiFlight.aircraft?.type || 'N/A',
      class: defaultFare?.fare_bucket?.class_type || 'Economy',
      carryOn: '7kg', // Default
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo', // Default
      // API fields for booking
      flight_instance_id: apiFlight.flight_id || apiFlight.id,
      fare_bucket_id: defaultFare?.fare_bucket?.id,
      // New fields from updated API
      flight_id: apiFlight.flight_id,
      status: apiFlight.status,
      available_seats: apiFlight.available_seats,
      total_seats: apiFlight.total_seats,
      fares: apiFlight.fares,
      pricing: apiFlight.pricing
    };
  }

  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return 'N/A';
    }
  }

  searchFlights() {
    console.log('🔍 Searching flights with updated params:', this.searchParams);
    
    // Reset selected flights when searching
    this.selectedDepartureFlight = null;
    this.selectedReturnFlight = null;
    
    // Find airport IDs from codes
    const departureAirport = this.airports.find(a => a.iata_code === this.searchParams.departure);
    const destinationAirport = this.airports.find(a => a.iata_code === this.searchParams.destination);
    
    if (!departureAirport || !destinationAirport) {
      console.error('❌ Could not find airports for search');
      return;
    }
    
    // Build search request
    const searchRequest: FlightSearchRequest = {
      departure_airport_id: departureAirport.id,
      destination_airport_id: destinationAirport.id,
      departure_date: this.searchParams.departureDate,
      return_date: this.tripType === 'roundtrip' ? this.searchParams.returnDate : undefined,
      trip_type: this.tripType,
      adults: this.passengers.adults,
      children: this.passengers.children,
      infants: this.passengers.infants
    };

    console.log('🚀 Sending search request:', searchRequest);
    
    this.isLoading = true;
    
    const searchSub = this.flightService.searchFlights(searchRequest).subscribe({
      next: (response) => {
        console.log('✅ New search response:', response);
        this.searchResult = response;
        this.loadSearchResult();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Search error:', error);
        // Clear data on error
        this.apiFlights = [];
        this.apiReturnFlights = [];
        this.filteredFlights = [];
        this.filteredReturnFlights = [];
        this.airlines = [];
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(searchSub);
  }

  filterFlights() {
    const selectedAirlines = this.airlines.filter(airline => airline.selected);

    if (selectedAirlines.length === 0) {
      // Show all API flights
      this.filteredFlights = [...this.apiFlights];
      this.filteredReturnFlights = [...this.apiReturnFlights];
    } else {
      const selectedAirlineNames = selectedAirlines.map(airline => airline.name);
      
      // Filter API flights
      this.filteredFlights = this.apiFlights.filter(flight =>
        selectedAirlineNames.includes(flight.airline)
      );
      
      this.filteredReturnFlights = this.apiReturnFlights.filter(flight =>
        selectedAirlineNames.includes(flight.airline)
      );
    }
    
    console.log('🔍 Filtered flights:', {
      selectedAirlines: selectedAirlines.map(a => a.name),
      filteredFlights: this.filteredFlights.length,
      filteredReturnFlights: this.filteredReturnFlights.length
    });
  }

  selectDate(date: DateOption) {
    this.availableDates.forEach(d => d.isSelected = false);
    date.isSelected = true;
    this.searchParams.departureDate = date.date;
    this.searchFlights();
  }

  getRouteTitle(): string {
    const departureName = this.getAirportName(this.searchParams.departure);
    const destinationName = this.getAirportName(this.searchParams.destination);
    return `${departureName} (${this.searchParams.departure}) → ${destinationName} (${this.searchParams.destination})`;
  }

  getReturnRouteTitle(): string {
    const departureName = this.getAirportName(this.searchParams.destination);
    const destinationName = this.getAirportName(this.searchParams.departure);
    return `${departureName} (${this.searchParams.destination}) → ${destinationName} (${this.searchParams.departure})`;
  }

  getFormattedReturnDate(): string {
    const date = new Date(this.searchParams.returnDate);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  }

  getFormattedDate(): string {
    const date = new Date(this.searchParams.departureDate);
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  }

  getAirportName(code: string): string {
    const airport = this.airports.find(a => a.iata_code === code);
    return airport ? `${airport.city} - ${airport.name}` : code;
  }

  toggleTripType() {
    this.tripType = this.tripType === 'oneway' ? 'roundtrip' : 'oneway';
    this.searchFlights();
  }


  togglePassengerDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showPassengerDropdown = !this.showPassengerDropdown;
    console.log('Dropdown toggled:', this.showPassengerDropdown);
  }

  onPassengerSelectorClick(event: Event) {
    event.stopPropagation();
    this.showPassengerDropdown = !this.showPassengerDropdown;
  }

  getTotalPassengers(): number {
    return this.passengers.adults + this.passengers.children + this.passengers.infants;
  }

  incrementAdults() {
    this.passengers.adults++;
    this.searchFlights();
  }

  decrementAdults() {
    if (this.passengers.adults > 1) {
      this.passengers.adults--;
      this.searchFlights();
    }
  }

  incrementChildren() {
    this.passengers.children++;
    this.searchFlights();
  }

  decrementChildren() {
    if (this.passengers.children > 0) {
      this.passengers.children--;
      this.searchFlights();
    }
  }

  incrementInfants() {
    this.passengers.infants++;
    this.searchFlights();
  }

  decrementInfants() {
    if (this.passengers.infants > 0) {
      this.passengers.infants--;
      this.searchFlights();
    }
  }

  toggleFlightsCollapse() {
    this.isFlightsCollapsed = !this.isFlightsCollapsed;
  }

  toggleReturnFlightsCollapse() {
    this.isReturnFlightsCollapsed = !this.isReturnFlightsCollapsed;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const passengerSelector = target.closest('.passenger-selector');
    const passengerDropdown = target.closest('.passenger-dropdown');

    // Only close dropdown if clicking outside both selector and dropdown
    if (!passengerSelector && !passengerDropdown) {
      this.showPassengerDropdown = false;
    }
  }
}
