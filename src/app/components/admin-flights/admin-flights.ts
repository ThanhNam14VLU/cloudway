import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightService } from '../../services/flight/flight.service';

export interface FlightData {
  id: string;
  status: string;
  scheduled_departure_local: string;
  scheduled_arrival_local: string;
  flight_number: {
    code: string;
    airline: {
      id: string;
      logo: string;
      name: string;
      iata_code: string;
    };
    arrival_airport: {
      city: string;
      iata_code: string;
    };
    departure_airport: {
      city: string;
      iata_code: string;
    };
  };
}

export interface Airline {
  id: string;
  name: string;
  code: string;
  logo?: string;
}

@Component({
  selector: 'app-admin-flights',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-flights.html',
  styleUrl: './admin-flights.scss'
})
export class AdminFlights implements OnInit {
  flights: FlightData[] = [];
  airlines: Airline[] = [];
  loading = false;
  searchTerm = '';
  fromDate = '';
  toDate = '';
  selectedAirlineId = '';

  constructor(private flightService: FlightService) {}

  ngOnInit(): void {
    this.loadFlights();
  }

  loadFlights(): void {
    this.loading = true;
    this.flightService.getFlights().subscribe({
      next: (flights) => {
        this.flights = flights;
        this.extractAirlinesFromFlights();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading flights:', error);
        this.loading = false;
      }
    });
  }

  extractAirlinesFromFlights(): void {
    const airlineMap = new Map<string, Airline>();
    
    this.flights.forEach(flight => {
      if (flight.flight_number.airline) {
        const airline = flight.flight_number.airline;
        airlineMap.set(airline.id, {
          id: airline.id,
          name: airline.name,
          code: airline.iata_code,
          logo: airline.logo
        });
      }
    });
    
    this.airlines = Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredFlights(): FlightData[] {
    return this.flights.filter(flight => {
      const matchesSearch = !this.searchTerm || 
        flight.flight_number.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDateRange = this.matchesDateRange(flight);
      
      const matchesAirline = !this.selectedAirlineId || 
        (flight.flight_number.airline && flight.flight_number.airline.id === this.selectedAirlineId);
      
      return matchesSearch && matchesDateRange && matchesAirline;
    });
  }

  matchesDateRange(flight: FlightData): boolean {
    if (!this.fromDate && !this.toDate) return true;
    
    const flightDate = new Date(flight.scheduled_departure_local).toISOString().split('T')[0];
    
    if (this.fromDate && flightDate < this.fromDate) return false;
    if (this.toDate && flightDate > this.toDate) return false;
    
    return true;
  }

  formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '-';
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  }

  getFlightStatus(flight: FlightData): string {
    // Sử dụng status từ API nếu có, nếu không thì tính toán dựa trên thời gian
    if (flight.status) {
      switch (flight.status.toUpperCase()) {
        case 'SCHEDULED':
          return 'Lên lịch';
        case 'BOARDING':
          return 'Đang lên máy bay';
        case 'DEPARTED':
          return 'Đã cất cánh';
        case 'IN_FLIGHT':
          return 'Đang bay';
        case 'ARRIVED':
          return 'Đã hạ cánh';
        case 'CANCELLED':
          return 'Đã hủy';
        case 'DELAYED':
          return 'Trễ chuyến';
        default:
          return flight.status;
      }
    }
    
    // Fallback: tính toán dựa trên thời gian nếu không có status
    const now = new Date();
    const departure = new Date(flight.scheduled_departure_local);
    const arrival = new Date(flight.scheduled_arrival_local);
    
    if (now < departure) {
      return 'Lên lịch';
    } else if (now >= departure && now < arrival) {
      return 'Đang bay';
    } else if (now >= arrival) {
      return 'Đã hạ cánh';
    }
    
    return 'Không xác định';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Lên lịch': return 'scheduled';
      case 'Đang lên máy bay': return 'boarding';
      case 'Đã cất cánh': return 'departed';
      case 'Đang bay': return 'on-time';
      case 'Đã hạ cánh': return 'completed';
      case 'Đã hủy': return 'cancelled';
      case 'Trễ chuyến': return 'delayed';
      default: return 'unknown';
    }
  }
}
