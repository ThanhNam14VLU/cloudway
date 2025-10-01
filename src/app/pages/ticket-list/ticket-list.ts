import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FlightCard } from '../../components/flight-card/flight-card';
import { MatButtonModule } from '@angular/material/button';

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
    MatButtonModule
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss'
})
export class TicketList implements OnInit {
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  showPassengerDropdown: boolean = false;
  isFlightsCollapsed: boolean = false;
  isReturnFlightsCollapsed: boolean = false;
  
  passengers = {
    adults: 1,
    children: 0,
    infants: 0
  };
  
  searchParams: SearchParams = {
    departure: 'SGN',
    destination: 'HAN',
    departureDate: '2025-09-16',
    returnDate: '2025-09-20'
  };

  constructor(private route: ActivatedRoute) {}

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

  flights: Flight[] = [
    {
      code: 'QH290',
      airline: 'Vietravel Airlines',
      logo: './assets/images/vietravel.webp',
      departTime: '23:25',
      departAirport: 'SGN',
      arriveTime: '01:35',
      arriveAirport: 'HAN',
      price: 1420000,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'VJ146',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '15:25',
      departAirport: 'SGN',
      arriveTime: '17:35',
      arriveAirport: 'HAN',
      price: 1624600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'VJ150',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '16:05',
      departAirport: 'SGN',
      arriveTime: '18:15',
      arriveAirport: 'HAN',
      price: 1624600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'VJ1162',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '16:50',
      departAirport: 'SGN',
      arriveTime: '19:00',
      arriveAirport: 'HAN',
      price: 1624600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    }
  ];

  returnFlights: Flight[] = [
    {
      code: 'VJ147',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '18:25',
      departAirport: 'HAN',
      arriveTime: '20:35',
      arriveAirport: 'SGN',
      price: 1524600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'QH291',
      airline: 'Vietravel Airlines',
      logo: './assets/images/vietravel.webp',
      departTime: '19:25',
      departAirport: 'HAN',
      arriveTime: '21:35',
      arriveAirport: 'SGN',
      price: 1380000,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'VJ151',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '20:05',
      departAirport: 'HAN',
      arriveTime: '22:15',
      arriveAirport: 'SGN',
      price: 1624600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    },
    {
      code: 'VJ1163',
      airline: 'Vietjet Air',
      logo: './assets/images/vietjet-logo.png',
      departTime: '21:50',
      departAirport: 'HAN',
      arriveTime: '00:00',
      arriveAirport: 'SGN',
      price: 1724600,
      duration: '130 phút',
      aircraft: '321B',
      class: 'Economy',
      carryOn: '7kg',
      checkedBaggage: 'Vui lòng chọn ở bước tiếp theo'
    }
  ];

  filteredFlights: Flight[] = [];
  filteredReturnFlights: Flight[] = [];

  ngOnInit() {
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
    
    this.filteredFlights = [...this.flights];
    this.filteredReturnFlights = [...this.returnFlights];
  }

  searchFlights() {
    // Implement search logic here
    console.log('Searching flights with params:', this.searchParams);
    this.filterFlights();
  }

  filterFlights() {
    const selectedAirlines = this.airlines.filter(airline => airline.selected);
    
    if (selectedAirlines.length === 0) {
      this.filteredFlights = [...this.flights];
      this.filteredReturnFlights = [...this.returnFlights];
    } else {
      const selectedAirlineNames = selectedAirlines.map(airline => airline.name);
      this.filteredFlights = this.flights.filter(flight => 
        selectedAirlineNames.includes(flight.airline)
      );
      this.filteredReturnFlights = this.returnFlights.filter(flight => 
        selectedAirlineNames.includes(flight.airline)
      );
    }
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
    const airports: { [key: string]: string } = {
      'SGN': 'Sân bay Tân Sơn Nhất',
      'HAN': 'Sân bay Nội Bài',
      'DAD': 'Sân bay Đà Nẵng'
    };
    return airports[code] || code;
  }

  toggleTripType() {
    this.tripType = this.tripType === 'oneway' ? 'roundtrip' : 'oneway';
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
    console.log('Passenger selector clicked, dropdown:', this.showPassengerDropdown);
  }

  getTotalPassengers(): number {
    return this.passengers.adults + this.passengers.children + this.passengers.infants;
  }

  incrementAdults() {
    this.passengers.adults++;
  }

  decrementAdults() {
    if (this.passengers.adults > 1) {
      this.passengers.adults--;
    }
  }

  incrementChildren() {
    this.passengers.children++;
  }

  decrementChildren() {
    if (this.passengers.children > 0) {
      this.passengers.children--;
    }
  }

  incrementInfants() {
    this.passengers.infants++;
  }

  decrementInfants() {
    if (this.passengers.infants > 0) {
      this.passengers.infants--;
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
