import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Header } from '../../components/header/header';
import { MatIconModule } from '@angular/material/icon';
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
  selector: 'app-airline-card-detail',
  imports: [Header, MatIconModule, FormsModule, CommonModule],
  templateUrl: './airline-card-detail.html',
  styleUrl: './airline-card-detail.scss'
})
export class AirlineCardDetail implements OnInit {
  // Step management
  currentStep: number = 1;
  completedSteps: number[] = [];

  // Booking state
  isCreatingBooking = false;
  bookingResult: BookingResponse | null = null;
  errorMessages: string[] = [];

  // Flight data (from router state or mock)
  selectedFlight: BackendFlight | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private bookingHelper: BookingHelperService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('=== AIRLINE CARD DETAIL INIT ===');
    
    // Get flight data from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['selectedFlight']) {
      this.selectedFlight = navigation.extras.state['selectedFlight'];
      console.log('✈️ Selected flight received:', this.selectedFlight);
    } else {
      console.warn('⚠️ No flight data found, using mock data');
      this.loadMockFlightData();
    }
  }

  loadMockFlightData() {
    // Mock flight data for testing
    this.selectedFlight = {
      flight_id: 'cd593248-07ff-4eb6-898b-81bf71704b5a',
      flight_number: 'VN003',
      airline: {
        name: 'Vietnam Airlines',
        code: 'VN'
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
      available_seats: 999,
      pricing: {
        adult_price: 5000000,
        child_price: 3200000,
        infant_price: 500000,
        total_price: 5000000,
        currency: 'VND',
        breakdown: {}
      },
      fare_buckets: []
    };
  }

  // Passenger information (Step 1)
  passengerInfo = {
    title: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    idNumber: '',
    phone: ''
  };

  // Contact information (Step 2)
  contactInfo = {
    title: '',
    fullName: '',
    phone: '',
    email: ''
  };

  specialRequests = '';
  
  // Additional services
  additionalServices = {
    specialMeal: false,
    extraLuggage: false,
    seatSelection: false
  };

  /**
   * Move to next step
   */
  nextStep(): void {
    if (this.currentStep === 1) {
      // Validate passenger info
      if (this.validatePassengerInfo()) {
        this.completedSteps.push(1);
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      // Validate contact info
      if (this.validateContactInfo()) {
        this.completedSteps.push(2);
        this.currentStep = 3;
      }
    }
  }

  /**
   * Move to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      // Remove from completed steps if going back
      const index = this.completedSteps.indexOf(this.currentStep + 1);
      if (index > -1) {
        this.completedSteps.splice(index, 1);
      }
    }
  }

  /**
   * Validate passenger information
   */
  private validatePassengerInfo(): boolean {
    return !!(
      this.passengerInfo.title &&
      this.passengerInfo.firstName &&
      this.passengerInfo.lastName &&
      this.passengerInfo.birthDate &&
      this.passengerInfo.idNumber
    );
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(): boolean {
    return !!(
      this.contactInfo.title && 
      this.contactInfo.fullName && 
      this.contactInfo.phone && 
      this.contactInfo.email
    );
  }

  /**
   * Check if step is completed
   */
  isStepCompleted(step: number): boolean {
    return this.completedSteps.includes(step);
  }

  /**
   * Check if step is active
   */
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  /**
   * Get step status class
   */
  getStepClass(step: number): string {
    if (this.isStepCompleted(step)) {
      return 'step completed';
    } else if (this.isStepActive(step)) {
      return 'step active';
    } else {
      return 'step';
    }
  }

  /**
   * Get passenger display name
   */
  getPassengerDisplayName(): string {
    const titleMap: { [key: string]: string } = {
      'mr': 'Ông',
      'ms': 'Bà', 
      'miss': 'Cô'
    };

    const title = titleMap[this.passengerInfo.title] || '';
    const firstName = this.passengerInfo.firstName || '';
    const lastName = this.passengerInfo.lastName || '';

    if (title && firstName && lastName) {
      return `${title} ${firstName} ${lastName}`;
    } else if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else {
      return 'Chưa nhập thông tin hành khách';
    }
  }

  /**
   * Get contact display name
   */
  getContactDisplayName(): string {
    const titleMap: { [key: string]: string } = {
      'mr': 'Ông',
      'ms': 'Bà', 
      'miss': 'Cô'
    };

    const title = titleMap[this.contactInfo.title] || '';
    const fullName = this.contactInfo.fullName || '';

    if (title && fullName) {
      return `${title} ${fullName}`;
    } else if (fullName) {
      return fullName;
    } else {
      return 'Chưa nhập thông tin liên hệ';
    }
  }

  /**
   * Check if has additional services
   */
  hasAdditionalServices(): boolean {
    return this.additionalServices.specialMeal || 
           this.additionalServices.extraLuggage || 
           this.additionalServices.seatSelection;
  }

  /**
   * Calculate total amount
   */
  getTotalAmount(): number {
    let total = 716100; // Base price (ticket + taxes)

    // Add additional services
    if (this.additionalServices.specialMeal) {
      total += 150000;
    }
    if (this.additionalServices.extraLuggage) {
      total += 300000;
    }
    if (this.additionalServices.seatSelection) {
      total += 200000;
    }

    return total;
  }

  /**
   * Complete booking and navigate to success page
   */
  async completeBooking(): Promise<void> {
    console.log('=== COMPLETING BOOKING ===');
    
    this.isCreatingBooking = true;
    this.errorMessages = [];
    this.bookingResult = null;

    try {
      // 1. Get current user ID
      const currentUser = await this.authService.getCurrentUserProfile();
      const userId = currentUser?.id;
      console.log('👤 Current user:', userId);

      // 2. Create passenger info from form data
      const passengerInfo: PassengerInfo = this.bookingHelper.createPassengerInfo(
        `${this.passengerInfo.firstName} ${this.passengerInfo.lastName}`,
        this.passengerInfo.birthDate,
        this.passengerInfo.idNumber,
        this.passengerInfo.phone,
        this.contactInfo.email,
        'ADULT' // Default to adult, could be made dynamic
      );

      console.log('👤 Passenger info created:', passengerInfo);

      // 3. Create contact info
      const contactInfo = {
        fullname: this.contactInfo.fullName,
        phone: this.contactInfo.phone
      };

      // 4. Create booking DTO
      if (!this.selectedFlight) {
        throw new Error('No flight selected');
      }

      const bookingDto = this.bookingHelper.createBookingDto(
        [this.selectedFlight],
        [passengerInfo],
        contactInfo,
        userId
      );

      console.log('📋 Booking DTO created:', bookingDto);

      // 5. Validate booking data
      const validationErrors = this.bookingHelper.validateBookingData(bookingDto);
      if (validationErrors.length > 0) {
        this.errorMessages = validationErrors;
        console.error('❌ Validation errors:', validationErrors);
        this.isCreatingBooking = false;
        return;
      }

      // 6. Call booking API
      console.log('🚀 Calling booking API...');
      this.bookingService.createBookingWithPassengers(bookingDto).subscribe({
        next: (response) => {
          console.log('✅ Booking created successfully:', response);
          this.bookingResult = response;
          this.isCreatingBooking = false;
          
          // Navigate to success page with real booking data
          this.navigateToSuccessPage(response);
        },
        error: (error) => {
          console.error('❌ Booking creation failed:', error);
          this.errorMessages = [
            error.error?.message || error.message || 'Có lỗi xảy ra khi tạo booking'
          ];
          this.isCreatingBooking = false;
        }
      });

    } catch (error) {
      console.error('❌ Unexpected error:', error);
      this.errorMessages = ['Có lỗi xảy ra khi tạo booking'];
      this.isCreatingBooking = false;
    }
  }

  /**
   * Navigate to success page with booking result
   */
  private navigateToSuccessPage(bookingResponse: BookingResponse): void {
    const booking = bookingResponse.booking;
    
    // Navigate to booking success page with real booking data
    this.router.navigate(['/booking-success'], {
      state: {
        bookingData: {
          bookingCode: booking.pnr_code,
          totalAmount: booking.payment.amount,
          paymentStatus: booking.payment.status,
          passengerName: this.getPassengerDisplayName(),
          contactName: this.getContactDisplayName(),
          contactPhone: this.contactInfo.phone,
          contactEmail: this.contactInfo.email,
          flightNumber: this.selectedFlight?.flight_number || 'N/A',
          airline: this.selectedFlight?.airline?.name || 'N/A',
          departure: this.selectedFlight?.departure?.airport?.city || 'N/A',
          destination: this.selectedFlight?.arrival?.airport?.city || 'N/A',
          departureTime: this.formatTime(this.selectedFlight?.departure?.time || ''),
          arrivalTime: this.formatTime(this.selectedFlight?.arrival?.time || ''),
          flightDate: this.formatDate(this.selectedFlight?.departure?.time || ''),
          bookingId: booking.id,
          segments: booking.segments
        }
      }
    });
  }

  /**
   * Format time for display
   */
  private formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Format date for display
   */
  private formatDate(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${dayName}, ${day} tháng ${month}, ${year}`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Generate booking code
   */
  private generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

