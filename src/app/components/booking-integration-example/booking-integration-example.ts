import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirlineCardBookingInfo } from '../airline-card-booking-info/airline-card-booking-info';
import { BookingResponse } from '../../models/booking.model';
import { BackendFlight } from '../../models/flight.model';

@Component({
  selector: 'app-booking-integration-example',
  standalone: true,
  imports: [CommonModule, AirlineCardBookingInfo],
  template: `
    <div class="booking-integration-example">
      <h2>Booking Integration Example</h2>
      
      <div class="flight-selection">
        <h3>Selected Flight:</h3>
        @if (selectedFlight) {
          <div class="flight-card">
            <div class="flight-info">
              <strong>{{ selectedFlight.flight_number }}</strong>
              <span>{{ selectedFlight.airline.name }}</span>
              <span>{{ selectedFlight.departure.airport.iata_code }} → {{ selectedFlight.arrival.airport.iata_code }}</span>
              <span>Giá: {{ formatPrice(selectedFlight.pricing.total_price) }}</span>
            </div>
          </div>
        } @else {
          <p>No flight selected</p>
        }
      </div>

      <div class="booking-component">
        <app-airline-card-booking-info 
          [selectedFlight]="selectedFlight"
          (bookingCreated)="onBookingCreated($event)">
        </app-airline-card-booking-info>
      </div>

      @if (bookingResult) {
        <div class="booking-result">
          <h3>Booking Created Successfully!</h3>
          <div class="result-info">
            <p><strong>PNR Code:</strong> {{ bookingResult.booking.pnr_code }}</p>
            <p><strong>Status:</strong> {{ bookingResult.booking.status }}</p>
            <p><strong>Total Amount:</strong> {{ formatPrice(bookingResult.booking.payment.amount) }}</p>
            <p><strong>Payment Status:</strong> {{ bookingResult.booking.payment.status }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .booking-integration-example {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .flight-selection {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .flight-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-top: 10px;
    }

    .flight-info {
      display: flex;
      gap: 15px;
      align-items: center;
      flex-wrap: wrap;
    }

    .booking-component {
      margin-bottom: 30px;
    }

    .booking-result {
      background: #d4edda;
      color: #155724;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #c3e6cb;
    }

    .result-info p {
      margin: 8px 0;
    }
  `]
})
export class BookingIntegrationExampleComponent implements OnInit {
  
  selectedFlight: BackendFlight | null = null;
  bookingResult: BookingResponse | null = null;

  ngOnInit() {
    console.log('=== BOOKING INTEGRATION EXAMPLE INIT ===');
    this.loadMockFlightData();
  }

  loadMockFlightData() {
    // Mock flight data for testing
    this.selectedFlight = {
      flight_id: 'cd593248-07ff-4eb6-898b-81bf71704b5a',
      flight_number: 'VN003',
      airline: {
        id: 'f8236b71-7c5b-4bba-a2e7-978c74a6b672',
        name: 'Vietnam Airlines',
        code: 'VN',
        logo: 'https://tgdwrhbnigwskfpkzfgr.supabase.co/storage/v1/object/public/logos/f8236b71-7c5b-4bba-a2e7-978c74a6b672/f8236b71-7c5b-4bba-a2e7-978c74a6b672.png'
      },
      departure: {
        airport: {
          id: '4a25c1f5-fea9-4a80-8f0d-b64f0105d3d3',
          city: 'Hanoi',
          name: 'Noi Bai International Airport',
          country: 'Vietnam',
          iata_code: 'HAN'
        },
        time: '2025-10-16T06:30:00+00:00'
      },
      arrival: {
        airport: {
          id: '987e2fc4-7c69-4b23-ba91-ec00fe9ba82e',
          city: 'Ho Chi Minh City',
          name: 'Tan Son Nhat International Airport',
          country: 'Vietnam',
          iata_code: 'SGN'
        },
        time: '2025-10-16T08:00:00+00:00'
      },
      duration: {
        hours: 1,
        minutes: 30,
        total_minutes: 90,
        formatted: '1h 30m'
      },
      aircraft: {
        id: 'd5b1ff89-b645-42b4-97fc-21523acc4408',
        type: 'Airbus A321',
        seat_capacity: 180
      },
      status: 'SCHEDULED',
      available_seats: 250,
      total_seats: 250,
      fares: [
        {
          base_price: 2000000,
          fare_bucket: {
            id: '6135348f-2e68-4a4b-a750-9a9dc69a17b6',
            code: 'BUS',
            class_type: 'Business',
            description: 'Hạng thương gia'
          }
        },
        {
          base_price: 1500000,
          fare_bucket: {
            id: 'b500ed8d-fc0e-4439-bb9d-46f601295b5b',
            code: 'ECO',
            class_type: 'Economy',
            description: 'Hạng phổ thông'
          }
        }
      ],
      pricing: {
        base_price: 1500000,
        total_passengers: 2,
        total_price: 3000000,
        currency: 'VND',
        breakdown: {
          adults: {
            count: 1,
            unit_price: 1500000,
            total: 1500000
          },
          children: {
            count: 1,
            unit_price: 1500000,
            total: 1500000
          },
          infants: null
        }
      },
      fare_buckets: []
    };

    console.log('✅ Mock flight data loaded:', this.selectedFlight);
  }

  onBookingCreated(bookingResponse: BookingResponse) {
    console.log('🎉 Booking created in parent component:', bookingResponse);
    this.bookingResult = bookingResponse;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }
}
