import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Header } from '../../components/header/header';
import { MatIconModule } from '@angular/material/icon';
import { BookingService } from '../../services/booking/booking.service';
import { BookingHelperService } from '../../services/booking/booking-helper.service';
import { AuthService } from '../../services/auth/auth.service';
import { FlightService } from '../../services/flight/flight.service';
import { 
  CreateBookingWithPassengersDto, 
  BookingResponse,
  PassengerInfo 
} from '../../models/booking.model';
import { BackendFlight } from '../../models/flight.model';

// Interface for passenger form data
interface PassengerFormData {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  email: string;
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  passengerTypeLabel: string;
}

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

  // Flight data (from router state or service)
  selectedFlight: any = null;
  selectedReturnFlight: any = null;
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  bookingData: any = null;
  
  // Store flight data for booking success page
  private flightDataForSuccess: any = null;
  
  // Passenger data
  passengers: {
    adults: number;
    children: number;
    infants: number;
  } = { adults: 1, children: 0, infants: 0 };
  
  // Dynamic passenger forms
  passengerForms: PassengerFormData[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private bookingHelper: BookingHelperService,
    private authService: AuthService,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    console.log('=== AIRLINE CARD DETAIL INIT ===');
    
    // Get router state immediately
    this.loadDataFromRouterState();
  }

  private loadDataFromRouterState(): void {
    // Get flight data from router state
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras?.state;
    
    // If getCurrentNavigation() returns null, try to get state from ActivatedRoute
    if (!state) {
      // Try to get state from route snapshot
      const routeState = this.route.snapshot.paramMap;
      console.log('🔍 Route params:', routeState);
      
      // Try to get state from route snapshot
      const routeSnapshot = this.route.snapshot;
      console.log('🔍 Route snapshot:', routeSnapshot);
    }
    
    if (state) {
      // Check for new booking data structure
      if (state['bookingData']) {
        this.bookingData = state['bookingData'];
        console.log('📋 Booking data received:', this.bookingData);
      }
      
      // Check for trip type and flights
      if (state['tripType']) {
        this.tripType = state['tripType'];
        console.log('🔄 Trip type:', this.tripType);
      }
      
      // Check for passenger data
      if (state['passengers']) {
        this.passengers = state['passengers'];
        console.log('👥 Passengers data received:', this.passengers);
        console.log('👥 Adults:', this.passengers.adults);
        console.log('👥 Children:', this.passengers.children);
        console.log('👥 Infants:', this.passengers.infants);
        this.initializePassengerForms();
      } else {
        console.warn('⚠️ No passengers data found in router state');
        console.log('🔍 Available state keys:', Object.keys(state));
      }
      
      // Check for selected flights
      if (state['selectedFlight']) {
        this.selectedFlight = state['selectedFlight'];
        console.log('✈️ Selected flight received:', this.selectedFlight);
        console.log('💰 Flight pricing data:', this.selectedFlight?.pricing);
      } else if (state['selectedDepartureFlight']) {
        this.selectedFlight = state['selectedDepartureFlight'];
        console.log('✈️ Selected departure flight received:', this.selectedFlight);
        console.log('💰 Departure flight pricing data:', this.selectedFlight?.pricing);
        
        // Store return flight if available
        if (state['selectedReturnFlight']) {
          this.selectedReturnFlight = state['selectedReturnFlight'];
          console.log('✈️ Selected return flight received:', this.selectedReturnFlight);
          console.log('💰 Return flight pricing data:', this.selectedReturnFlight?.pricing);
        }
        } else {
          console.warn('⚠️ No flight data found');
          // Don't load mock data, let the component handle empty state
        }
    } else {
      console.warn('⚠️ No navigation state found, trying to get data from service');
      
      // Try to get flight data from service
      const serviceFlight = this.flightService.getCurrentSelectedFlight();
      if (serviceFlight) {
        console.log('✈️ Found flight data in service:', serviceFlight);
        
        // Use service flight data directly
        this.selectedFlight = serviceFlight;
      } else {
        console.warn('⚠️ No flight data in service');
        // Don't load mock data, let the component handle empty state
      }
      
      // Try to get passenger data from service
      const servicePassengers = this.flightService.getCurrentPassengers();
      if (servicePassengers) {
        console.log('👥 Found passenger data in service:', servicePassengers);
        this.passengers = servicePassengers;
      } else {
        console.warn('⚠️ No passenger data in service either, using default');
        // Initialize with default passenger data (1 adult) for testing
        this.passengers = { adults: 1, children: 0, infants: 0 };
      }
      this.initializePassengerForms();
    }
    
    // Debug selectedFlight data
    console.log('🔍 Final selectedFlight data:', this.selectedFlight);
    
    // Debug flight time data if we have a selected flight
    if (this.selectedFlight) {
      this.debugFlightTimeData();
    }
  }

  /**
   * Initialize passenger forms based on passenger count
   */
  initializePassengerForms(): void {
    console.log('🚀 Initializing passenger forms with data:', this.passengers);
    this.passengerForms = [];
    let passengerIndex = 1;

    // Add adult passengers
    for (let i = 0; i < this.passengers.adults; i++) {
      this.passengerForms.push({
        id: `adult-${passengerIndex}`,
        title: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        idNumber: '',
        phone: '',
        email: '',
        passengerType: 'ADULT',
        passengerTypeLabel: 'Người lớn'
      });
      passengerIndex++;
    }

    // Add child passengers
    for (let i = 0; i < this.passengers.children; i++) {
      this.passengerForms.push({
        id: `child-${passengerIndex}`,
        title: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        idNumber: '',
        phone: '',
        email: '',
        passengerType: 'CHILD',
        passengerTypeLabel: 'Trẻ em'
      });
      passengerIndex++;
    }

    // Add infant passengers
    for (let i = 0; i < this.passengers.infants; i++) {
      this.passengerForms.push({
        id: `infant-${passengerIndex}`,
        title: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        idNumber: '',
        phone: '',
        email: '',
        passengerType: 'INFANT',
        passengerTypeLabel: 'Em bé'
      });
      passengerIndex++;
    }

    console.log('👥 Initialized passenger forms:', this.passengerForms);
    console.log('👥 Total forms created:', this.passengerForms.length);
    console.log('👥 Forms breakdown:', {
      adults: this.passengerForms.filter(p => p.passengerType === 'ADULT').length,
      children: this.passengerForms.filter(p => p.passengerType === 'CHILD').length,
      infants: this.passengerForms.filter(p => p.passengerType === 'INFANT').length
    });
  }


  // Legacy passenger info (kept for backward compatibility if needed)
  // passengerInfo = {
  //   title: '',
  //   firstName: '',
  //   lastName: '',
  //   birthDate: '',
  //   idNumber: '',
  //   phone: ''
  // };

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
        // Save passenger data temporarily
        this.savePassengerData();
        this.completedSteps.push(1);
        this.currentStep = 2;
        console.log('✅ Passenger data saved and moving to step 2');
      } else {
        console.log('❌ Passenger validation failed');
        this.showValidationErrors();
      }
    } else if (this.currentStep === 2) {
      // Validate contact info
      if (this.validateContactInfo()) {
        // Save contact data temporarily
        this.saveContactData();
        this.completedSteps.push(2);
        this.currentStep = 3;
        console.log('✅ Contact data saved and moving to step 3');
      } else {
        console.log('❌ Contact validation failed');
        this.showContactValidationErrors();
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
   * Save passenger data temporarily
   */
  private savePassengerData(): void {
    // Data is already stored in this.passengerForms
    // This method can be extended to save to localStorage or service if needed
    console.log('💾 Passenger data saved:', this.passengerForms);
  }

  /**
   * Save contact data temporarily
   */
  private saveContactData(): void {
    // Data is already stored in this.contactInfo
    // This method can be extended to save to localStorage or service if needed
    console.log('💾 Contact data saved:', this.contactInfo);
  }

  /**
   * Show validation errors for passenger forms
   */
  private showValidationErrors(): void {
    const errors: string[] = [];
    
    this.passengerForms.forEach((passenger, index) => {
      const passengerNumber = index + 1;
      
      if (!passenger.title) {
        errors.push(`Hành khách ${passengerNumber}: Vui lòng chọn danh xưng`);
      }
      if (!passenger.firstName) {
        errors.push(`Hành khách ${passengerNumber}: Vui lòng nhập họ và tên đệm`);
      }
      if (!passenger.lastName) {
        errors.push(`Hành khách ${passengerNumber}: Vui lòng nhập tên`);
      }
      if (!passenger.birthDate) {
        errors.push(`Hành khách ${passengerNumber}: Vui lòng chọn ngày sinh`);
      }
      if (passenger.passengerType === 'ADULT' && !passenger.idNumber) {
        errors.push(`Hành khách ${passengerNumber}: Vui lòng nhập CMND/CCCD`);
      }
      
      // Check age validation
      if (passenger.birthDate && !this.validatePassengerAge(passenger.birthDate, passenger.passengerType)) {
        const ageText = passenger.passengerType === 'ADULT' ? 'từ 13 tuổi trở lên' :
                       passenger.passengerType === 'CHILD' ? 'từ 2-12 tuổi' : 'dưới 2 tuổi';
        errors.push(`Hành khách ${passengerNumber}: Tuổi phải ${ageText}`);
      }
    });
    
    this.errorMessages = errors;
  }

  /**
   * Show validation errors for contact form
   */
  private showContactValidationErrors(): void {
    const errors: string[] = [];
    
    if (!this.contactInfo.title) {
      errors.push('Vui lòng chọn danh xưng người liên hệ');
    }
    if (!this.contactInfo.fullName) {
      errors.push('Vui lòng nhập họ và tên người liên hệ');
    }
    if (!this.contactInfo.phone) {
      errors.push('Vui lòng nhập số điện thoại liên hệ');
    }
    if (!this.contactInfo.email) {
      errors.push('Vui lòng nhập email liên hệ');
    }
    
    this.errorMessages = errors;
  }

  /**
   * Clear error messages
   */
  clearErrors(): void {
    this.errorMessages = [];
  }

  /**
   * Validate passenger information
   */
  private validatePassengerInfo(): boolean {
    // Check if all passenger forms are valid
    return this.passengerForms.every(passenger => {
      // Basic fields required for all passengers
      const basicFieldsValid = passenger.title &&
        passenger.firstName &&
        passenger.lastName &&
        passenger.birthDate;

      // Check age validation
      const ageValid = this.validatePassengerAge(passenger.birthDate, passenger.passengerType);

      // Additional fields only required for adults
      if (passenger.passengerType === 'ADULT') {
        return basicFieldsValid && passenger.idNumber && ageValid;
      } else {
        // For children and infants, only basic fields and age are required
        return basicFieldsValid && ageValid;
      }
    });
  }

  /**
   * Validate passenger age based on passenger type
   */
  private validatePassengerAge(birthDate: string, passengerType: 'ADULT' | 'CHILD' | 'INFANT'): boolean {
    if (!birthDate) return false;

    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) 
      ? ageInYears - 1 
      : ageInYears;

    switch (passengerType) {
      case 'ADULT':
        return actualAge >= 13;
      case 'CHILD':
        return actualAge >= 2 && actualAge <= 12;
      case 'INFANT':
        return actualAge < 2;
      default:
        return false;
    }
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
   * Get passenger display names
   */
  getPassengerDisplayNames(): string[] {
    const titleMap: { [key: string]: string } = {
      'mr': 'Ông',
      'ms': 'Bà', 
      'miss': 'Cô'
    };

    return this.passengerForms.map(passenger => {
      const title = titleMap[passenger.title] || '';
      const firstName = passenger.firstName || '';
      const lastName = passenger.lastName || '';

      if (title && firstName && lastName) {
        return `${title} ${firstName} ${lastName}`;
      } else if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else {
        return 'Chưa nhập thông tin';
      }
    });
  }

  /**
   * Get passenger display name (for backward compatibility)
   */
  getPassengerDisplayName(): string {
    const names = this.getPassengerDisplayNames();
    if (names.length === 0) {
      return 'Chưa nhập thông tin hành khách';
    } else if (names.length === 1) {
      return names[0];
    } else {
      return `${names.length} hành khách`;
    }
  }

  /**
   * Get total passenger count
   */
  getTotalPassengerCount(): number {
    return this.passengers.adults + this.passengers.children + this.passengers.infants;
  }

  /**
   * Get minimum birth date for passenger type
   */
  getMinBirthDate(passengerType: 'ADULT' | 'CHILD' | 'INFANT'): string {
    const today = new Date();
    
    switch (passengerType) {
      case 'ADULT':
        // Adult: 13 years old and above (minimum 13 years old)
        // Set to 100 years ago to allow a wide range
        const adultMinDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
        return adultMinDate.toISOString().split('T')[0];
      
      case 'CHILD':
        // Child: 2-12 years old
        const childMinDate = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
        return childMinDate.toISOString().split('T')[0];
      
      case 'INFANT':
        // Infant: under 2 years old
        const infantMinDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
        return infantMinDate.toISOString().split('T')[0];
      
      default:
        return '';
    }
  }

  /**
   * Get maximum birth date for passenger type
   */
  getMaxBirthDate(passengerType: 'ADULT' | 'CHILD' | 'INFANT'): string {
    const today = new Date();
    
    switch (passengerType) {
      case 'ADULT':
        // Adult: 13 years old and above (cannot be born in the future)
        const adultMaxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        return adultMaxDate.toISOString().split('T')[0];
      
      case 'CHILD':
        // Child: 2-12 years old
        const childMaxDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
        return childMaxDate.toISOString().split('T')[0];
      
      case 'INFANT':
        // Infant: under 2 years old
        return today.toISOString().split('T')[0];
      
      default:
        return '';
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
    let total = 0;

    // Get base price from selected flight
    if (this.selectedFlight) {
      // Try to get price from pricing data first
      if (this.selectedFlight.pricing && this.selectedFlight.pricing.total_price) {
        total = this.selectedFlight.pricing.total_price;
      } 
      // Fallback to fare data
      else if (this.selectedFlight.fares && this.selectedFlight.fares.length > 0) {
        const firstFare = this.selectedFlight.fares[0];
        total = firstFare.base_price * this.getTotalPassengerCount();
      }
      // Fallback to price property (from fare selection)
      else if ((this.selectedFlight as any).price) {
        total = (this.selectedFlight as any).price * this.getTotalPassengerCount();
      }
      // Default fallback
      else {
        total = 716100; // Default price if no pricing data available
      }
    } else {
      total = 716100; // Default price if no flight selected
    }

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
    
    // Store flight data before booking to ensure we have it for success page
    this.flightDataForSuccess = this.selectedFlight;
    console.log('💾 Stored flight data for success page:', this.flightDataForSuccess);
    
    this.isCreatingBooking = true;
    this.errorMessages = [];
    this.bookingResult = null;

    try {
      // 1. Get current user ID
      const currentUser = await this.authService.getCurrentUserProfile();
      const userId = currentUser?.id;
      console.log('👤 Current user:', userId);

      // 2. Create passenger info from form data
      const passengerInfos: PassengerInfo[] = this.passengerForms.map(passenger => {
        // For children and infants, use contact info for phone and email
        const phone = passenger.passengerType === 'ADULT' ? passenger.phone : this.contactInfo.phone;
        const email = passenger.passengerType === 'ADULT' ? passenger.email : this.contactInfo.email;
        
        return this.bookingHelper.createPassengerInfo(
          `${passenger.firstName} ${passenger.lastName}`,
          passenger.birthDate,
          passenger.idNumber || '', // Empty string for children and infants
          phone,
          email,
          passenger.passengerType
        );
      });

      console.log('👤 Passenger infos created:', passengerInfos);

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
        passengerInfos,
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
    
    // Debug selectedFlight data
    console.log('🔍 Selected flight data:', this.selectedFlight);
    console.log('🔍 Flight number:', this.selectedFlight?.flight_number);
    console.log('🔍 Airline:', this.selectedFlight?.airline?.name);
    console.log('🔍 Departure:', this.selectedFlight?.departure?.airport?.city);
    console.log('🔍 Destination:', this.selectedFlight?.arrival?.airport?.city);
    
    // Use stored flight data if selectedFlight is null
    let flightData = this.selectedFlight || this.flightDataForSuccess;
    console.log('🔍 Using flight data:', flightData);
    
    if (!flightData && booking.segments && booking.segments.length > 0) {
      console.log('🔍 Trying to get flight data from segments...');
      console.log('🔍 Segments:', booking.segments);
      
      // Get flight instance ID from first segment
      const firstSegment = booking.segments[0];
      if (firstSegment.flight_instance_id) {
        console.log('🔍 Flight instance ID:', firstSegment.flight_instance_id);
        // You might need to fetch flight details using this ID
        // For now, let's try to extract what we can from the segment
      }
    }
    
    // Navigate to booking success page with booking ID
    console.log('🚀 Navigating to booking success with ID:', booking.id);
    this.router.navigate(['/booking-success', booking.id]);
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

  /**
   * Get flight date for display
   */
  getFlightDate(): string {
    if (!this.selectedFlight) return 'N/A';
    
    // Try to get date from departure.time if available
    if (this.selectedFlight.departure?.time) {
      return this.formatFlightDate(this.selectedFlight.departure.time);
    }
    
    // If no date available, use today's date as fallback
    const today = new Date();
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[today.getDay()];
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${day} tháng ${month}, ${year}`;
  }

  /**
   * Get return flight date for display
   */
  getReturnFlightDate(): string {
    if (!this.selectedReturnFlight) return 'N/A';
    
    // Try to get date from departure.time if available
    if (this.selectedReturnFlight.departure?.time) {
      return this.formatFlightDate(this.selectedReturnFlight.departure.time);
    }
    
    // If no date available, use today's date as fallback
    const today = new Date();
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[today.getDay()];
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${day} tháng ${month}, ${year}`;
  }

  /**
   * Format flight date to Vietnamese format
   */
  formatFlightDate(timeString: string): string {
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
   * Format time to HH:MM format
   */
  formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    // Debug log to see what we're receiving
    console.log('🔍 formatTime input:', timeString, 'type:', typeof timeString);
    
    try {
      const date = new Date(timeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('❌ Invalid date created from:', timeString);
        return 'N/A';
      }
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;
      
      console.log('✅ formatTime result:', result);
      return result;
    } catch (error) {
      console.log('❌ formatTime error:', error, 'for input:', timeString);
      return 'N/A';
    }
  }

  /**
   * Format price to Vietnamese locale
   */
  formatPrice(price: number): string {
    if (!price || isNaN(price)) {
      return '0';
    }
    return new Intl.NumberFormat('en-US').format(price) + ' VND';
  }

  /**
   * Debug pricing data
   */
  debugPricingData(): void {
    console.log('🔍 Debugging pricing data:');
    console.log('Selected flight:', this.selectedFlight);
    if (this.selectedFlight) {
      console.log('Flight pricing:', this.selectedFlight.pricing);
      console.log('Flight fares:', this.selectedFlight.fares);
      console.log('Flight price (from fare selection):', (this.selectedFlight as any).price);
      console.log('Flight class (from fare selection):', (this.selectedFlight as any).class);
      console.log('Selected fare bucket ID:', (this.selectedFlight as any).fare_bucket_id);
      if (this.selectedFlight.pricing) {
        console.log('Pricing breakdown:', this.selectedFlight.pricing.breakdown);
        console.log('Base price:', this.selectedFlight.pricing.base_price);
        console.log('Total price:', this.selectedFlight.pricing.total_price);
      }
    }
  }

  /**
   * Get flight time display string
   */
  getFlightTimeDisplay(): string {
    if (!this.selectedFlight) return 'N/A';
    
    // Try different time field combinations
    const departureTime = this.selectedFlight.departure?.time || 
                         this.selectedFlight.departTime || 
                         (this.selectedFlight as any).departure_time;
    
    const arrivalTime = this.selectedFlight.arrival?.time || 
                       this.selectedFlight.arriveTime || 
                       (this.selectedFlight as any).arrival_time;
    
    console.log('🔍 Flight time data:', {
      departureTime,
      arrivalTime,
      departureTimeType: typeof departureTime,
      arrivalTimeType: typeof arrivalTime
    });
    
    const formattedDeparture = this.formatTime(departureTime);
    const formattedArrival = this.formatTime(arrivalTime);
    
    // If both times are valid, return the range
    if (formattedDeparture !== 'N/A' && formattedArrival !== 'N/A') {
      return `${formattedDeparture} - ${formattedArrival}`;
    }
    
    // If only one time is valid, show what we have
    if (formattedDeparture !== 'N/A') {
      return `${formattedDeparture} - N/A`;
    }
    
    if (formattedArrival !== 'N/A') {
      return `N/A - ${formattedArrival}`;
    }
    
    // If no valid times, return N/A
    return 'N/A';
  }

  /**
   * Debug flight time data
   */
  debugFlightTimeData(): void {
    console.log('🔍 Debugging flight time data:');
    console.log('Selected flight:', this.selectedFlight);
    if (this.selectedFlight) {
      console.log('Departure time (departure.time):', this.selectedFlight.departure?.time);
      console.log('Arrival time (arrival.time):', this.selectedFlight.arrival?.time);
      console.log('Departure time (departTime):', this.selectedFlight.departTime);
      console.log('Arrival time (arriveTime):', this.selectedFlight.arriveTime);
      console.log('Duration:', this.selectedFlight.duration);
      
      // Test formatTime with different time formats
      if (this.selectedFlight.departure?.time) {
        console.log('Testing formatTime with departure.time:', this.formatTime(this.selectedFlight.departure.time));
      }
      if (this.selectedFlight.departTime) {
        console.log('Testing formatTime with departTime:', this.formatTime(this.selectedFlight.departTime));
      }
    }
  }

}

