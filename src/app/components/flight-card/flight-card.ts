import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FareSelectionDialog } from '../fare-selection-dialog/fare-selection-dialog';

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
  // Additional API fields for real data
  scheduled_departure_local?: string;
  scheduled_arrival_local?: string;
  flight_number?: {
    code: string;
    departure_airport: string;
    arrival_airport: string;
  };
  aircraft_type?: string;
  airline_info?: {
    name: string;
    logo: string;
    iata_code: string;
  };
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

@Component({
  selector: 'app-flight-card',
  imports: [MatButtonModule],
  templateUrl: './flight-card.html',
  styleUrl: './flight-card.scss'
})
export class FlightCard {
  @Input() flight!: Flight;
  @Input() isSelected: boolean = false;
  @Output() flightSelected = new EventEmitter<Flight>();
  
  isDropped: boolean = false;//check xem chi tiết vé

  constructor(private dialog: MatDialog) {}
  
  Dropdown() {
    this.isDropped = !this.isDropped;
  }

  onSelectFlight() {
    console.log('Opening fare selection dialog with flight:', this.flight);
    
    // Open fare selection dialog
    const dialogRef = this.dialog.open(FareSelectionDialog, {
      width: '90%',
      maxWidth: '800px',
      data: { flight: this.flight },
      disableClose: false,
      panelClass: 'fare-selection-dialog-container'
    });

    dialogRef.componentInstance.fareSelected.subscribe((result: {flight: Flight, selectedFare: any}) => {
      console.log('Fare selected:', result);
      this.flightSelected.emit(result.flight);
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed:', result);
    });
  }

  getBasePrice(): number {
    // Use base_price from pricing object if available, otherwise fall back to price field
    return this.flight.pricing?.base_price || this.flight.price || 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }

  // Get fare class from flight data
  getFareClass(): string {
    if (this.flight.fares && this.flight.fares.length > 0) {
      return this.flight.fares[0].fare_bucket.class_type || 'N/A';
    }
    return this.flight.class || 'N/A';
  }

  // Get available seats information
  getAvailableSeats(): string {
    if (this.flight.available_seats !== undefined && this.flight.total_seats !== undefined) {
      return `${this.flight.available_seats}/${this.flight.total_seats} ghế`;
    }
    return 'N/A';
  }

  // Get flight status
  getFlightStatus(): string {
    if (this.flight.status) {
      switch (this.flight.status.toLowerCase()) {
        case 'scheduled':
          return 'Đã lên lịch';
        case 'boarding':
          return 'Đang lên máy bay';
        case 'departed':
          return 'Đã khởi hành';
        case 'arrived':
          return 'Đã đến nơi';
        case 'delayed':
          return 'Bị trễ';
        case 'cancelled':
          return 'Đã hủy';
        default:
          return this.flight.status;
      }
    }
    return 'Đã lên lịch';
  }

  // Get aircraft type from real data
  getAircraftType(): string {
    return this.flight.aircraft_type || this.flight.aircraft || 'N/A';
  }

  // Get airline name from real data
  getAirlineName(): string {
    return this.flight.airline_info?.name || this.flight.airline || 'N/A';
  }

  // Get flight code from real data
  getFlightCode(): string {
    return this.flight.flight_number?.code || this.flight.code || 'N/A';
  }
}
