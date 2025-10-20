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
    // Init component
    
    // Get router state immediately
    this.loadDataFromRouterState();
  }

  private loadDataFromRouterState(): void {
    // Get flight data from router state
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras?.state;
    
    console.log('🔁 Step 2 - getCurrentNavigation result:', !!navigation);
    console.log('🔁 Step 2 - navigation state:', !!state);
    
    // If getCurrentNavigation() returns null, try to get state from ActivatedRoute
    if (!state) {
      console.log('🔁 Step 2 - getCurrentNavigation returned null, trying ActivatedRoute');
      // Try to get state from route snapshot
      const routeSnapshot = this.route.snapshot;
      state = (routeSnapshot as any).state;
      console.log('🔁 Step 2 - ActivatedRoute state:', !!state);
    }
    
    if (state) {
      // Check for new booking data structure
      if (state['bookingData']) {
        this.bookingData = state['bookingData'];
        
      }
      
      // Check for trip type and flights
      if (state['tripType']) {
        this.tripType = state['tripType'];
        
      }
      
      // Check for passenger data
      if (state['passengers']) {
        this.passengers = state['passengers'];
        
        this.initializePassengerForms();
      } else {
        console.warn('⚠️ No passengers data found in router state');
        
      }
      
      // Check for selected flights
      console.log('🔁 Step 2 - Router state keys:', Object.keys(state));
      console.log('🔁 Step 2 - selectedFlight in state:', !!state['selectedFlight']);
      console.log('🔁 Step 2 - selectedDepartureFlight in state:', !!state['selectedDepartureFlight']);
      console.log('🔁 Step 2 - selectedReturnFlight in state:', !!state['selectedReturnFlight']);
      
      if (state['selectedFlight']) {
        this.selectedFlight = state['selectedFlight'];
        console.log('🔁 Step 2 - Using selectedFlight from state');
      } else if (state['selectedDepartureFlight']) {
        this.selectedFlight = state['selectedDepartureFlight'];
        console.log('🔁 Step 2 - Using selectedDepartureFlight from state');
        
        // Store return flight if available
        if (state['selectedReturnFlight']) {
          this.selectedReturnFlight = state['selectedReturnFlight'];
          console.log('🔁 Step 2 - Using selectedReturnFlight from state');
        }
      } else {
          console.warn('⚠️ No flight data found');
          // Don't load mock data, let the component handle empty state
        }
      
      // Fallback: if trip is roundtrip and return flight is missing, try to get from bookingData
      if (this.tripType === 'roundtrip' && !this.selectedReturnFlight && this.bookingData && Array.isArray(this.bookingData.flights) && this.bookingData.flights.length > 1) {
        const [, returnFlight] = this.bookingData.flights;
        if (returnFlight) {
          this.selectedReturnFlight = returnFlight;
        }
      }
    } else {
      console.warn('⚠️ No navigation state found, trying to get data from service');
      
      // Try to get flight data from service
      const serviceFlight = this.flightService.getCurrentSelectedFlight();
      if (serviceFlight) {
        console.log('🔁 Step 2 - Found flight in service:', serviceFlight.code, serviceFlight.flight_instance_id);
        // Use service flight data directly
        this.selectedFlight = serviceFlight;
      } else {
        console.warn('⚠️ No flight data in service');
        // Don't load mock data, let the component handle empty state
      }
      
      // Try to get return flight from service for roundtrip
      const serviceReturnFlight = this.flightService.getCurrentSelectedReturnFlight();
      if (serviceReturnFlight) {
        console.log('🔁 Step 2 - Found return flight in service:', serviceReturnFlight.code, serviceReturnFlight.flight_instance_id);
        this.selectedReturnFlight = serviceReturnFlight;
        // If we have return flight, set tripType to roundtrip
        if (this.tripType !== 'roundtrip') {
          console.log('🔁 Step 2 - Setting tripType to roundtrip based on return flight');
          this.tripType = 'roundtrip';
        }
      } else {
        console.log('🔁 Step 2 - No return flight in service');
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
    
    
    // Debug flight time data if we have a selected flight
    
  }

  /**
   * Initialize passenger forms based on passenger count
   */
  initializePassengerForms(): void {
    
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
        
      } else {
        
        this.showValidationErrors();
      }
    } else if (this.currentStep === 2) {
      // Validate contact info
      if (this.validateContactInfo()) {
        // Save contact data temporarily
        this.saveContactData();
        this.completedSteps.push(2);
        this.currentStep = 3;
        
      } else {
        
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
    
  }

  /**
   * Save contact data temporarily
   */
  private saveContactData(): void {
    // Data is already stored in this.contactInfo
    // This method can be extended to save to localStorage or service if needed
    
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
      
      // Check email validation for adults
      if (passenger.passengerType === 'ADULT') {
        if (!passenger.email) {
          errors.push(`Hành khách ${passengerNumber}: Vui lòng nhập email`);
        } else if (!this.validateEmail(passenger.email)) {
          errors.push(`Hành khách ${passengerNumber}: Email không đúng định dạng`);
        }
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
    } else if (!this.validateEmail(this.contactInfo.email)) {
      errors.push('Email liên hệ không đúng định dạng');
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
        // Check email validation for adults
        const emailValid = this.validateEmail(passenger.email);
        return basicFieldsValid && passenger.idNumber && ageValid && emailValid;
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
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    if (!email) return false;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate contact information
   */
  private validateContactInfo(): boolean {
    return !!(
      this.contactInfo.title && 
      this.contactInfo.fullName && 
      this.contactInfo.phone && 
      this.contactInfo.email &&
      this.validateEmail(this.contactInfo.email)
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
    // Completing booking (roundtrip debug below)
    
    // Store flight data before booking to ensure we have it for success page
    this.flightDataForSuccess = this.selectedFlight;
    
    
    this.isCreatingBooking = true;
    this.errorMessages = [];
    this.bookingResult = null;

    try {
      // 1. Get current user ID
      const currentUser = await this.authService.getCurrentUserProfile();
      const userId = currentUser?.id;
      

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

      

      // 3. Create contact info
      const contactInfo = {
        fullname: this.contactInfo.fullName,
        phone: this.contactInfo.phone
      };

      // 4. Create booking DTO
      if (!this.selectedFlight) {
        throw new Error('No flight selected');
      }

      console.log('🔁 Step 3 - Creating booking DTO');
      console.log('🔁 Step 3 - tripType:', this.tripType);
      console.log('🔁 Step 3 - selectedFlight:', this.selectedFlight?.code, this.selectedFlight?.flight_instance_id);
      console.log('🔁 Step 3 - selectedReturnFlight:', this.selectedReturnFlight?.code, this.selectedReturnFlight?.flight_instance_id);
      
      const flightsToBook = this.tripType === 'roundtrip' && this.selectedReturnFlight
        ? [this.selectedFlight, this.selectedReturnFlight]
        : [this.selectedFlight];
        
      console.log('🔁 Step 3 - flightsToBook length:', flightsToBook.length);
      console.log('🔁 Step 3 - flightsToBook:', flightsToBook.map(f => ({ code: f?.code, flight_instance_id: f?.flight_instance_id })));

      // Prefer building from selected flights; if missing return flight for roundtrip, fallback to bookingData.segments
      let bookingDto: CreateBookingWithPassengersDto;
      if (this.tripType === 'roundtrip' && (!this.selectedReturnFlight) && this.bookingData?.segments?.length > 1) {
        const segments = this.bookingData.segments.map((seg: any) => ({
          flight_instance_id: seg.flight_instance_id || seg.flight_id,
          fare_bucket_id: seg.fare_bucket_id || (this.selectedFlight as any)?.fare_bucket_id,
          passengers: passengerInfos
        }));
        bookingDto = {
          user_id: userId,
          contact_fullname: contactInfo.fullname,
          contact_phone: contactInfo.phone,
          segments
        };
      } else {
        bookingDto = this.bookingHelper.createBookingDto(
          flightsToBook,
          passengerInfos,
          contactInfo,
          userId
        );
      }

      // Roundtrip debug: segments count
      console.log('🔁 Roundtrip - bookingDto.segments length:', bookingDto?.segments?.length);

      // 5. Validate booking data
      const validationErrors = this.bookingHelper.validateBookingData(bookingDto);
      if (validationErrors.length > 0) {
        this.errorMessages = validationErrors;
        console.error('❌ Validation errors:', validationErrors);
        this.isCreatingBooking = false;
        return;
      }

      // 6. Call booking API
      
      this.bookingService.createBookingWithPassengers(bookingDto).subscribe({
        next: (response) => {
          console.log('✅ Booking created successfully');
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
    
    
    // Use stored flight data if selectedFlight is null
    let flightData = this.selectedFlight || this.flightDataForSuccess;
    
    
    if (!flightData && booking.segments && booking.segments.length > 0) {
      
      
      // Get flight instance ID from first segment
      const firstSegment = booking.segments[0];
      if (firstSegment.flight_instance_id) {
        
        // You might need to fetch flight details using this ID
        // For now, let's try to extract what we can from the segment
      }
    }
    
    // Navigate to booking success page with booking ID
    
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
    
    try {
      // Handle different time formats
      let timeStr = timeString.toString().trim();
      
      // If it's already in HH:MM format, validate and return
      if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const m = parseInt(minutes);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          return `${h.toString().padStart(2, '0')}:${minutes}`;
        }
      }
      
      // If it's in HH:MM:SS format, extract HH:MM
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const m = parseInt(minutes);
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          return `${h.toString().padStart(2, '0')}:${minutes}`;
        }
      }
      
      // Try to parse as Date object
      const date = new Date(timeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const result = `${hours}:${minutes}`;
      return result;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Format flight duration to readable format
   */
  formatFlightDuration(duration: string | number): string {
    if (!duration) return 'N/A';
    
    try {
      let durationStr = duration.toString().trim();
      
      // Handle negative durations - more comprehensive check
      if (durationStr.startsWith('-') || durationStr.includes('-') || 
          (typeof duration === 'number' && duration < 0)) {
        return 'N/A';
      }
      
      // Handle different duration formats
      if (typeof duration === 'number') {
        // If it's a number, assume it's in minutes
        if (duration <= 0) {
          return 'N/A';
        }
        // Reject unrealistic durations (> 24h)
        if (duration > 24 * 60) {
          return 'N/A';
        }
        return this.minutesToDisplay(duration);
      }
      
      // Handle string formats like "2h 30m", "150m", "2:30"
      if (durationStr.includes('h') && durationStr.includes('m')) {
        // Check if it contains negative values
        if (durationStr.includes('-')) {
          return 'N/A';
        }
        // Parse to minutes to validate range
        const mins = this.parseDurationToMinutes(durationStr);
        if (mins <= 0 || mins > 24 * 60) {
          return 'N/A';
        }
        return this.minutesToDisplay(mins);
      } else if (durationStr.includes(':')) {
        // Format like "2:30"
        const parts = durationStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        if (hours < 0 || minutes < 0) {
          return 'N/A';
        }
        const mins = hours * 60 + minutes;
        if (mins <= 0 || mins > 24 * 60) {
          return 'N/A';
        }
        return this.minutesToDisplay(mins);
      } else if (durationStr.endsWith('m')) {
        // Format like "150m"
        const minutes = parseInt(durationStr.replace('m', '')) || 0;
        if (minutes <= 0) {
          return 'N/A';
        }
        if (minutes > 24 * 60) {
          return 'N/A';
        }
        return this.minutesToDisplay(minutes);
      } else {
        // Try to parse as number of minutes
        const minutes = parseInt(durationStr) || 0;
        if (minutes > 0) {
          if (minutes > 24 * 60) {
            return 'N/A';
          }
          return this.minutesToDisplay(minutes);
        } else {
          return 'N/A';
        }
      }
      
      return 'N/A';
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Parse a duration string (like "2h 30m" or "150m") to minutes
   */
  private parseDurationToMinutes(duration: string): number {
    try {
      const trimmed = duration.trim();
      const hmMatch = trimmed.match(/^(\d+)h\s*(\d+)m$/i);
      if (hmMatch) {
        const h = parseInt(hmMatch[1]);
        const m = parseInt(hmMatch[2]);
        return h * 60 + m;
      }
      const hOnly = trimmed.match(/^(\d+)h$/i);
      if (hOnly) {
        return parseInt(hOnly[1]) * 60;
      }
      const mOnly = trimmed.match(/^(\d+)m$/i);
      if (mOnly) {
        return parseInt(mOnly[1]);
      }
      const colon = trimmed.match(/^(\d+):(\d{2})$/);
      if (colon) {
        const h = parseInt(colon[1]);
        const m = parseInt(colon[2]);
        return h * 60 + m;
      }
      const asNum = parseInt(trimmed);
      if (!isNaN(asNum)) {
        return asNum;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Convert minutes to display string "Xh Ym"
   */
  private minutesToDisplay(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
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
  debugPricingData(): void {}

  /**
   * Get flight time display string
   */
  getFlightTimeDisplay(): string {
    if (!this.selectedFlight) return 'N/A';
    
    // Try different time field combinations with more fallback options
    const departureTime = this.selectedFlight.departure?.time || 
                         this.selectedFlight.departTime || 
                         (this.selectedFlight as any).departure_time ||
                         (this.selectedFlight as any).departureTime ||
                         (this.selectedFlight as any).depart_time;
    
    const arrivalTime = this.selectedFlight.arrival?.time || 
                       this.selectedFlight.arriveTime || 
                       (this.selectedFlight as any).arrival_time ||
                       (this.selectedFlight as any).arrivalTime ||
                       (this.selectedFlight as any).arrive_time;
    
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
   * Get flight duration display string
   */
  getFlightDurationDisplay(): string {
    if (!this.selectedFlight) return 'N/A';
    
    const duration = this.selectedFlight.duration;
    
    // Try to format the duration
    const formattedDuration = this.formatFlightDuration(duration);
    
    // If duration is invalid or N/A, try to calculate from departure and arrival times
    if (formattedDuration === 'N/A') {
      const calculatedDuration = this.calculateDurationFromTimes();
      if (calculatedDuration !== 'N/A') {
        return calculatedDuration;
      }
    }
    
    return formattedDuration;
  }

  /**
   * Calculate duration from departure and arrival times
   */
  private calculateDurationFromTimes(): string {
    if (!this.selectedFlight) return 'N/A';
    
    try {
      // Get departure and arrival times
      const departureTime = this.selectedFlight.departure?.time || 
                           this.selectedFlight.departTime || 
                           (this.selectedFlight as any).departure_time ||
                           (this.selectedFlight as any).departureTime ||
                           (this.selectedFlight as any).depart_time;
      
      const arrivalTime = this.selectedFlight.arrival?.time || 
                         this.selectedFlight.arriveTime || 
                         (this.selectedFlight as any).arrival_time ||
                         (this.selectedFlight as any).arrivalTime ||
                         (this.selectedFlight as any).arrive_time;
      
      if (!departureTime || !arrivalTime) {
        console.log('❌ Missing departure or arrival time for calculation');
        return 'N/A';
      }
      
      // Try to parse as time strings first (HH:MM format)
      const departureTimeStr = departureTime.toString().trim();
      const arrivalTimeStr = arrivalTime.toString().trim();
      
      // Check if they are in HH:MM format
      const timeRegex = /^(\d{1,2}):(\d{2})$/;
      const departureMatch = departureTimeStr.match(timeRegex);
      const arrivalMatch = arrivalTimeStr.match(timeRegex);
      
      if (departureMatch && arrivalMatch) {
        // Parse as time strings
        const depHours = parseInt(departureMatch[1]);
        const depMinutes = parseInt(departureMatch[2]);
        const arrHours = parseInt(arrivalMatch[1]);
        const arrMinutes = parseInt(arrivalMatch[2]);
        
        // Convert to total minutes
        const depTotalMinutes = depHours * 60 + depMinutes;
        const arrTotalMinutes = arrHours * 60 + arrMinutes;
        
        let diffInMinutes = arrTotalMinutes - depTotalMinutes;
        
        // Handle case where arrival is next day (e.g., 23:30 to 01:30)
        if (diffInMinutes < 0) {
          diffInMinutes += 24 * 60; // Add 24 hours
        }
        
        if (diffInMinutes <= 0 || diffInMinutes > 24 * 60) {
          return 'N/A';
        }
        
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        return `${hours}h ${minutes}m`;
      }
      
      // Fallback to Date parsing
      const departureDate = new Date(departureTime);
      const arrivalDate = new Date(arrivalTime);
      
      if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
        console.log('❌ Invalid departure or arrival date');
        return 'N/A';
      }
      
      // Calculate difference in minutes
      const diffInMs = arrivalDate.getTime() - departureDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInMinutes <= 0 || diffInMinutes > 24 * 60) {
        return 'N/A';
      }
      
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      
      return `${hours}h ${minutes}m`;
      
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get return flight time display string
   */
  getReturnFlightTimeDisplay(): string {
    if (!this.selectedReturnFlight) return 'N/A';
    
    // Try different time field combinations
    const departureTime = this.selectedReturnFlight.departure?.time || 
                         this.selectedReturnFlight.departTime || 
                         (this.selectedReturnFlight as any).departure_time;
    
    const arrivalTime = this.selectedReturnFlight.arrival?.time || 
                       this.selectedReturnFlight.arriveTime || 
                       (this.selectedReturnFlight as any).arrival_time;
    
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
   * Get return flight duration display string
   */
  getReturnFlightDurationDisplay(): string {
    if (!this.selectedReturnFlight) return 'N/A';
    
    const duration = this.selectedReturnFlight.duration;
    
    // Try to format the duration
    const formattedDuration = this.formatFlightDuration(duration);
    
    // If duration is invalid or N/A, try to calculate from departure and arrival times
    if (formattedDuration === 'N/A') {
      const calculatedDuration = this.calculateReturnFlightDurationFromTimes();
      if (calculatedDuration !== 'N/A') {
        return calculatedDuration;
      }
    }
    
    return formattedDuration;
  }

  /**
   * Calculate return flight duration from departure and arrival times
   */
  private calculateReturnFlightDurationFromTimes(): string {
    if (!this.selectedReturnFlight) return 'N/A';
    
    try {
      // Get departure and arrival times
      const departureTime = this.selectedReturnFlight.departure?.time || 
                           this.selectedReturnFlight.departTime || 
                           (this.selectedReturnFlight as any).departure_time ||
                           (this.selectedReturnFlight as any).departureTime ||
                           (this.selectedReturnFlight as any).depart_time;
      
      const arrivalTime = this.selectedReturnFlight.arrival?.time || 
                         this.selectedReturnFlight.arriveTime || 
                         (this.selectedReturnFlight as any).arrival_time ||
                         (this.selectedReturnFlight as any).arrivalTime ||
                         (this.selectedReturnFlight as any).arrive_time;
      
      if (!departureTime || !arrivalTime) {
        console.log('❌ Missing return flight departure or arrival time for calculation');
        return 'N/A';
      }
      
      // Try to parse as time strings first (HH:MM format)
      const departureTimeStr = departureTime.toString().trim();
      const arrivalTimeStr = arrivalTime.toString().trim();
      
      // Check if they are in HH:MM format
      const timeRegex = /^(\d{1,2}):(\d{2})$/;
      const departureMatch = departureTimeStr.match(timeRegex);
      const arrivalMatch = arrivalTimeStr.match(timeRegex);
      
      if (departureMatch && arrivalMatch) {
        // Parse as time strings
        const depHours = parseInt(departureMatch[1]);
        const depMinutes = parseInt(departureMatch[2]);
        const arrHours = parseInt(arrivalMatch[1]);
        const arrMinutes = parseInt(arrivalMatch[2]);
        
        // Convert to total minutes
        const depTotalMinutes = depHours * 60 + depMinutes;
        const arrTotalMinutes = arrHours * 60 + arrMinutes;
        
        let diffInMinutes = arrTotalMinutes - depTotalMinutes;
        
        // Handle case where arrival is next day (e.g., 23:30 to 01:30)
        if (diffInMinutes < 0) {
          diffInMinutes += 24 * 60; // Add 24 hours
        }
        
        if (diffInMinutes <= 0 || diffInMinutes > 24 * 60) {
          return 'N/A';
        }
        
        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        
        return `${hours}h ${minutes}m`;
      }
      
      // Fallback to Date parsing
      const departureDate = new Date(departureTime);
      const arrivalDate = new Date(arrivalTime);
      
      if (isNaN(departureDate.getTime()) || isNaN(arrivalDate.getTime())) {
        console.log('❌ Invalid return flight departure or arrival date');
        return 'N/A';
      }
      
      // Calculate difference in minutes
      const diffInMs = arrivalDate.getTime() - departureDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInMinutes <= 0 || diffInMinutes > 24 * 60) {
        return 'N/A';
      }
      
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      
      return `${hours}h ${minutes}m`;
      
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Debug flight time data
   */
  debugFlightTimeData(): void {}

}

