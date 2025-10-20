import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportService } from '../../services/airport/airport.service';
import { AirlineService } from '../../services/airline/airline.service';
import { AuthService } from '../../services/auth/auth.service';
import { CreateFlightInstanceModel } from '../../models/create-flight-instance.model';

@Component({
  selector: 'app-airline-add-flight-form',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './airline-add-flight-form.html',
  styleUrl: './airline-add-flight-form.scss'
})
export class AirlineAddFlightForm implements OnInit {
 @Output() close = new EventEmitter<void>();//con tạo sự kiện để phát ra ngoài

  constructor(
    private airportService: AirportService,
    private airlineService: AirlineService,
    private authService: AuthService
  ) {}

  airports: Array<{ id: string; name?: string; code?: string }> = [] as any;

  // Danh sách máy bay lấy từ service
  aircrafts: Array<{ id: string; name: string }> = [];

  // Dữ liệu form theo payload yêu cầu
  flightPayload: CreateFlightInstanceModel = {
    airline_id: '', // Sẽ được set từ user profile
    flight_number: {
      code: '',
      departure_airport_id: '',
      arrival_airport_id: ''
    },
    aircraft_id: '',
    scheduled_departure_local: '',
    scheduled_arrival_local: '',
    fares: [
      { fare_bucket_id: '', base_price: 0, total_seats: 0 }, // Business
      { fare_bucket_id: '', base_price: 0, total_seats: 0 }  // Economy
    ]
  };

  // Hardcoded fare bucket IDs
  businessBucketId = '6135348f-2e68-4a4b-a750-9a9dc69a17b6';
  economyBucketId = 'b500ed8d-fc0e-4439-bb9d-46f601295b5b';

  async ngOnInit(): Promise<void> {
    console.log('=== AIRLINE ADD FLIGHT FORM INIT ===');
    
    // 1. Load airports
    this.airportService.getAirports().subscribe({
      next: (list: any[]) => {
        this.airports = list || [];
        console.log('🏢 Airports loaded:', this.airports.length, 'airports');
      },
      error: (e) => console.error('❌ Error loading airports:', e)
    });

    // 1.2 Load aircrafts
    this.airlineService.getAircrafts().subscribe({
      next: (list: any[]) => {
        const mapped = (list || []).map((ac: any) => ({
          id: ac.id,
          name: ac.name || ac.model || ac.type || ac.code || 'Aircraft'
        }));
        this.aircrafts = mapped;
        console.log('🛩️ Aircrafts loaded:', this.aircrafts.length, 'items');
        if (this.aircrafts.length) {
          console.log('👉 First aircraft sample:', this.aircrafts[0]);
        }
      },
      error: (e) => console.error('❌ Error loading aircrafts:', e)
    });

    // 2. Get current user's airline ID
    try {
      const airlineId = await this.authService.getCurrentUserAirlineId();
      if (airlineId) {
        this.flightPayload.airline_id = airlineId;
        console.log('✈️ Airline ID set:', airlineId);
      } else {
        console.warn('⚠️ No airline ID found for current user');
      }
    } catch (error) {
      console.error('❌ Error getting airline ID:', error);
    }
  }

  onBucketChange(): void {
    // Map hardcoded bucket ids vào 2 fares theo thứ tự Business, Economy
    this.flightPayload.fares[0].fare_bucket_id = this.businessBucketId; // Business
    this.flightPayload.fares[1].fare_bucket_id = this.economyBucketId;  // Economy
    console.log('🔧 Fare bucket IDs set:', {
      business: this.businessBucketId,
      economy: this.economyBucketId
    });
  }

  handle() {
    this.close.emit();//phát sự kiện ra ngoài
  }

  async submit(evt: Event) {
    evt.preventDefault();
    console.log('=== SUBMIT FLIGHT FORM ===');
    
    // 1. Update bucket IDs
    this.onBucketChange();
    
    // 2. Validate required fields
    if (!this.validateForm()) {
      console.error('❌ Form validation failed');
      return;
    }
    
    // 3. Log payload before sending
    console.log('📤 Flight payload to send:', JSON.stringify(this.flightPayload, null, 2));
    
    // 4. Send to backend
    try {
      console.log('🚀 Sending flight creation request...');
      this.airlineService.createFlightInstance(this.flightPayload).subscribe({
        next: (response) => {
          console.log('✅ Flight created successfully!');
          console.log('📥 Backend response:', response);
          alert('Tạo chuyến bay thành công!');
          this.close.emit();
        },
        error: (error) => {
          console.error('❌ Flight creation failed:', error);
          console.error('❌ Error details:', error.error);
          console.error('❌ Error status:', error.status);
          alert(`Tạo chuyến bay thất bại: ${error.error?.message || error.message || 'Unknown error'}`);
        }
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      alert('Có lỗi xảy ra khi tạo chuyến bay');
    }
  }

  private validateForm(): boolean {
    console.log('🔍 Validating form...');
    
    // Check flight number
    if (!this.flightPayload.flight_number.code) {
      console.error('❌ Flight number is required');
      alert('Vui lòng nhập số hiệu chuyến bay');
      return false;
    }
    
    // Check airports
    if (!this.flightPayload.flight_number.departure_airport_id) {
      console.error('❌ Departure airport is required');
      alert('Vui lòng chọn điểm đi');
      return false;
    }
    
    if (!this.flightPayload.flight_number.arrival_airport_id) {
      console.error('❌ Arrival airport is required');
      alert('Vui lòng chọn điểm đến');
      return false;
    }
    
    // Check aircraft
    if (!this.flightPayload.aircraft_id) {
      console.error('❌ Aircraft is required');
      alert('Vui lòng chọn máy bay');
      return false;
    }
    
    // Check times
    if (!this.flightPayload.scheduled_departure_local) {
      console.error('❌ Departure time is required');
      alert('Vui lòng nhập giờ khởi hành');
      return false;
    }
    
    if (!this.flightPayload.scheduled_arrival_local) {
      console.error('❌ Arrival time is required');
      alert('Vui lòng nhập giờ đến');
      return false;
    }
    
    // Fare bucket IDs are hardcoded, no need to validate
    
    // Check fares have valid prices and seat counts
    for (let i = 0; i < this.flightPayload.fares.length; i++) {
      const fare = this.flightPayload.fares[i];
      if (fare.base_price <= 0) {
        console.error(`❌ Invalid fare price at index ${i}:`, fare);
        alert(`Vui lòng nhập giá vé cho tất cả hạng vé`);
        return false;
      }
      if (fare.total_seats <= 0) {
        console.error(`❌ Invalid seat count at index ${i}:`, fare);
        alert(`Vui lòng nhập số ghế cho tất cả hạng vé`);
        return false;
      }
    }
    
    console.log('✅ Form validation passed');
    return true;
  }
}
