import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking/booking.service';
import { BookingHelperService } from '../../services/booking/booking-helper.service';
import { AuthService } from '../../services/auth/auth.service';
import { 
  CreateBookingWithPassengersDto, 
  BookingResponse, 
  PassengerInfo 
} from '../../models/booking.model';
import { BackendFlight } from '../../models/flight.model';

@Component({
  selector: 'app-booking-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="booking-example">
      <h2>Tạo Booking Example</h2>
      
      <!-- Contact Information -->
      <div class="contact-section">
        <h3>Thông tin liên hệ</h3>
        <div class="form-group">
          <label>Họ tên:</label>
          <input [(ngModel)]="contactInfo.fullname" placeholder="Nhập họ tên">
        </div>
        <div class="form-group">
          <label>Số điện thoại:</label>
          <input [(ngModel)]="contactInfo.phone" placeholder="Nhập số điện thoại">
        </div>
      </div>

      <!-- Passenger Information -->
      <div class="passenger-section">
        <h3>Thông tin hành khách</h3>
        <div class="passenger-form" *ngFor="let passenger of passengers; let i = index">
          <h4>Hành khách {{ i + 1 }} ({{ passenger.passenger_type }})</h4>
          <div class="form-group">
            <label>Họ tên:</label>
            <input [(ngModel)]="passenger.full_name" placeholder="Nhập họ tên">
          </div>
          <div class="form-group">
            <label>Ngày sinh:</label>
            <input type="date" [(ngModel)]="passenger.date_of_birth">
          </div>
          <div class="form-group">
            <label>Số CMND/CCCD:</label>
            <input [(ngModel)]="passenger.id_number" placeholder="Nhập số CMND/CCCD">
          </div>
          <div class="form-group">
            <label>Số điện thoại:</label>
            <input [(ngModel)]="passenger.phone" placeholder="Nhập số điện thoại">
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input type="email" [(ngModel)]="passenger.email" placeholder="Nhập email">
          </div>
        </div>
      </div>

      <!-- Selected Flights -->
      <div class="flights-section">
        <h3>Chuyến bay đã chọn</h3>
        <div class="flight-item" *ngFor="let flight of selectedFlights">
          <div class="flight-info">
            <strong>{{ flight.flight_number || flight.flight_id }}</strong>
            <span>{{ flight.airline.name }}</span>
            <span>{{ flight.departure.airport.iata_code }} → {{ flight.arrival.airport.iata_code }}</span>
            <span>Giá: {{ formatPrice(flight.pricing.total_price) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions">
        <button (click)="createBooking()" [disabled]="isLoading">
          {{ isLoading ? 'Đang tạo booking...' : 'Tạo Booking' }}
        </button>
      </div>

      <!-- Results -->
      <div class="results" *ngIf="bookingResult">
        <h3>Kết quả</h3>
        <div class="success-message" *ngIf="bookingResult.message">
          {{ bookingResult.message }}
        </div>
        <div class="booking-info">
          <p><strong>PNR Code:</strong> {{ bookingResult.booking.pnr_code }}</p>
          <p><strong>Trạng thái:</strong> {{ bookingResult.booking.status }}</p>
          <p><strong>Tổng tiền:</strong> {{ formatPrice(bookingResult.booking.payment.amount) }}</p>
        </div>
      </div>

      <!-- Error Messages -->
      <div class="error-messages" *ngIf="errorMessages.length > 0">
        <h4>Lỗi:</h4>
        <ul>
          <li *ngFor="let error of errorMessages">{{ error }}</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .booking-example {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .contact-section, .passenger-section, .flights-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    .passenger-form {
      border: 1px solid #eee;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
    }

    .flight-item {
      padding: 10px;
      border: 1px solid #eee;
      margin-bottom: 10px;
      border-radius: 4px;
    }

    .actions {
      text-align: center;
      margin: 30px 0;
    }

    .actions button {
      background: #007bff;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
    }

    .actions button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .results {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .success-message {
      color: #28a745;
      font-weight: 500;
      margin-bottom: 15px;
    }

    .booking-info p {
      margin: 5px 0;
    }

    .error-messages {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }

    .error-messages ul {
      margin: 10px 0 0 20px;
    }
  `]
})
export class BookingExampleComponent implements OnInit {
  
  // Form data
  contactInfo = {
    fullname: '',
    phone: ''
  };

  passengers: PassengerInfo[] = [];
  selectedFlights: BackendFlight[] = [];
  
  // State
  isLoading = false;
  bookingResult: BookingResponse | null = null;
  errorMessages: string[] = [];

  // Mock data for testing
  mockPassengers: PassengerInfo[] = [
    {
      full_name: 'Nguyễn Văn A',
      date_of_birth: '1990-01-01',
      id_number: '123456789',
      phone: '0123456789',
      email: 'nguyenvana@example.com',
      passenger_type: 'ADULT'
    }
  ];

  mockFlight: BackendFlight = {
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

  constructor(
    private bookingService: BookingService,
    private bookingHelper: BookingHelperService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('=== BOOKING EXAMPLE INIT ===');
    
    // Load mock data
    this.loadMockData();
  }

  loadMockData() {
    console.log('🔄 Loading mock data for testing...');
    
    this.contactInfo = {
      fullname: 'Nguyễn Văn A',
      phone: '0123456789'
    };

    this.passengers = [...this.mockPassengers];
    this.selectedFlights = [this.mockFlight];

    console.log('✅ Mock data loaded:', {
      contactInfo: this.contactInfo,
      passengers: this.passengers.length,
      flights: this.selectedFlights.length
    });
  }

  async createBooking() {
    console.log('=== CREATE BOOKING ===');
    
    this.isLoading = true;
    this.errorMessages = [];
    this.bookingResult = null;

    try {
      // 1. Get current user ID
      const currentUser = await this.authService.getCurrentUserProfile();
      const userId = currentUser?.id;

      console.log('👤 Current user:', userId);

      // 2. Create booking DTO
      const bookingDto = this.bookingHelper.createBookingDto(
        this.selectedFlights,
        this.passengers,
        this.contactInfo,
        userId
      );

      console.log('📋 Booking DTO:', bookingDto);

      // 3. Validate data
      const validationErrors = this.bookingHelper.validateBookingData(bookingDto);
      if (validationErrors.length > 0) {
        this.errorMessages = validationErrors;
        console.error('❌ Validation errors:', validationErrors);
        return;
      }

      // 4. Call API
      console.log('🚀 Calling booking API...');
      this.bookingService.createBookingWithPassengers(bookingDto).subscribe({
        next: (response) => {
          console.log('✅ Booking created successfully:', response);
          this.bookingResult = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Booking creation failed:', error);
          this.errorMessages = [
            error.error?.message || error.message || 'Có lỗi xảy ra khi tạo booking'
          ];
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      this.errorMessages = ['Có lỗi xảy ra khi tạo booking'];
      this.isLoading = false;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }
}
