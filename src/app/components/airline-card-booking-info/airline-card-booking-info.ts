import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-airline-card-booking-info',
  imports: [CommonModule, FormsModule],
  templateUrl: './airline-card-booking-info.html',
  styleUrl: './airline-card-booking-info.scss'
})
export class AirlineCardBookingInfo {
  @Input() selectedFlight: BackendFlight | null = null;
  @Output() bookingCreated = new EventEmitter<BookingResponse>();

  // Form data
  contactInfo = {
    fullname: '',
    phone: '',
    email: ''
  };

  passengerInfo = {
    fullName: '',
    dateOfBirth: '',
    idNumber: '',
    phone: '',
    email: ''
  };

  // State
  isCreatingBooking = false;
  errorMessages: string[] = [];

  constructor(
    private bookingService: BookingService,
    private bookingHelper: BookingHelperService,
    private authService: AuthService
  ) {}

  async createBooking(): Promise<void> {
    console.log('=== CREATING BOOKING FROM BOOKING INFO ===');
    
    this.isCreatingBooking = true;
    this.errorMessages = [];

    try {
      // 1. Get current user ID
      const currentUser = await this.authService.getCurrentUserProfile();
      const userId = currentUser?.id;

      // 2. Create passenger info
      const passenger: PassengerInfo = this.bookingHelper.createPassengerInfo(
        this.passengerInfo.fullName,
        this.passengerInfo.dateOfBirth,
        this.passengerInfo.idNumber,
        this.passengerInfo.phone,
        this.passengerInfo.email,
        'ADULT'
      );

      // 3. Create contact info
      const contact = {
        fullname: this.contactInfo.fullname,
        phone: this.contactInfo.phone
      };

      // 4. Create booking DTO
      if (!this.selectedFlight) {
        throw new Error('No flight selected');
      }

      const bookingDto = this.bookingHelper.createBookingDto(
        [this.selectedFlight],
        [passenger],
        contact,
        userId
      );

      // 5. Validate
      const validationErrors = this.bookingHelper.validateBookingData(bookingDto);
      if (validationErrors.length > 0) {
        this.errorMessages = validationErrors;
        this.isCreatingBooking = false;
        return;
      }

      // 6. Call API
      this.bookingService.createBookingWithPassengers(bookingDto).subscribe({
        next: (response) => {
          console.log('✅ Booking created from booking info:', response);
          this.isCreatingBooking = false;
          this.bookingCreated.emit(response);
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
}
