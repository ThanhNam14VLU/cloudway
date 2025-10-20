import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Header } from '../../components/header/header';
import { BookingResponse, BookingSegmentResponse, PassengerInfo } from '../../models/booking.model';

@Component({
  selector: 'app-booking-success',
  imports: [CommonModule, Header],
  templateUrl: './booking-success.html',
  styleUrl: './booking-success.scss'
})
export class BookingSuccess implements OnInit {
  // Default data - sẽ được override từ router state
  bookingData = {
    bookingCode: '',
    totalAmount: 0,
    paymentStatus: '',
    passengerName: '',
    passengerNames: [] as string[],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    flightNumber: '',
    airline: '',
    departure: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    flightDate: '',
    bookingId: '',
    segments: [] as BookingSegmentResponse[]
  };

  // Loading and error states
  isLoading = false;
  errorMessages: string[] = [];

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get booking ID from URL parameters
    const bookingId = this.route.snapshot.paramMap.get('id');
    console.log('🔍 Booking ID from URL:', bookingId);
    
    if (bookingId) {
      // Fetch booking data from API
      this.fetchBookingData(bookingId);
    } else {
      // Fallback: Try to get data from router state (for backward compatibility)
      this.loadDataFromRouterState();
    }
  }

  /**
   * Fetch booking data from API
   */
  private fetchBookingData(bookingId: string): void {
    console.log('🌐 Fetching booking data from API...');
    
    this.isLoading = true;
    this.errorMessages = [];
    
    const apiUrl = `http://localhost:3000/bookings/${bookingId}/booking-details`;
    console.log('🔗 API URL:', apiUrl);
    
    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        console.log('✅ Booking data received from API:', response);
        this.isLoading = false;
        this.processBookingData(response);
      },
      error: (error) => {
        console.error('❌ Error fetching booking data:', error);
        this.isLoading = false;
        this.errorMessages = ['Không thể tải thông tin booking. Vui lòng thử lại.'];
        
        // Fallback to router state data
        this.loadDataFromRouterState();
      }
    });
  }

  /**
   * Process booking data from API response
   */
  private processBookingData(apiData: any): void {
    console.log('🔄 Processing API booking data:', apiData);
    
    // Transform API data to our booking data structure
    this.bookingData = {
      bookingCode: apiData.booking?.pnr_code || '',
      totalAmount: apiData.payment?.amount || 0,
      paymentStatus: apiData.payment?.status || '',
      passengerName: apiData.booking?.contact_info?.fullname || '',
      passengerNames: this.extractPassengerNames(apiData.segments || []),
      contactName: apiData.booking?.contact_info?.fullname || '',
      contactPhone: apiData.booking?.contact_info?.phone || '',
      contactEmail: this.extractContactEmail(apiData.segments || []),
      flightNumber: this.extractFlightNumber(apiData.segments || []),
      airline: this.extractAirlineName(apiData.segments || []),
      departure: this.extractDeparture(apiData.segments || []),
      destination: this.extractDestination(apiData.segments || []),
      departureTime: this.extractDepartureTime(apiData.segments || []),
      arrivalTime: this.extractArrivalTime(apiData.segments || []),
      flightDate: this.extractFlightDate(apiData.segments || []),
      bookingId: apiData.booking?.id || '',
      segments: apiData.segments || []
    };
    
    console.log('✅ Processed booking data:', this.bookingData);
  }

  /**
   * Load data from router state (fallback method)
   */
  private loadDataFromRouterState(): void {
    console.log('🔄 Loading data from router state...');
    
    // Try to get data from router state
    const navigation = this.router.getCurrentNavigation();
    console.log('🔍 Navigation state:', navigation?.extras?.state);
    
    // Check if we have booking data in router state
    if (navigation?.extras?.state?.['bookingData']) {
      const receivedData = navigation.extras.state['bookingData'];
      console.log('📦 Received booking data from navigation:', receivedData);
      
      // Merge received data with default structure
      this.bookingData = { 
        ...this.bookingData, 
        ...receivedData 
      };
      
      console.log('✅ Final booking data:', this.bookingData);
      console.log('🎫 Segments count:', this.bookingData.segments?.length || 0);
    } else {
      console.log('⚠️ No booking data found in router state');
      console.log('🔍 Available state keys:', Object.keys(navigation?.extras?.state || {}));
      
      // Try to get data from browser history state as fallback
      const historyState = history.state;
      console.log('🔍 Browser history state:', historyState);
      
      if (historyState && historyState.bookingData) {
        console.log('📦 Found booking data in history state:', historyState.bookingData);
        this.bookingData = { 
          ...this.bookingData, 
          ...historyState.bookingData 
        };
        console.log('✅ Final booking data from history:', this.bookingData);
      } else {
        console.log('⚠️ No booking data found in history state either');
        console.log('🔍 This might be a direct navigation to booking-success page');
        
        // For testing purposes, you can uncomment this to load sample data
        // this.loadSampleData();
      }
    }
  }

  /**
   * Load sample data for testing (can be called from template)
   */
  loadSampleData(): void {
    console.log('🧪 Loading sample data for testing...');
    this.bookingData = {
      bookingCode: 'HDUWP1',
      totalAmount: 1500000,
      paymentStatus: 'Đã thanh toán',
      passengerName: 'Nguyễn Văn A',
      passengerNames: ['Nguyễn Văn A'],
      contactName: 'Nguyễn Văn A',
      contactPhone: '0123456789',
      contactEmail: 'test@example.com',
      flightNumber: 'VN123',
      airline: 'Vietnam Airlines',
      departure: 'Hà Nội (HAN)',
      destination: 'TP. Hồ Chí Minh (SGN)',
      departureTime: '08:00',
      arrivalTime: '10:30',
      flightDate: 'Thứ 2, 20/01/2025',
      bookingId: 'booking-test-123',
      segments: [
        {
          id: 'segment-test-1',
          booking_id: 'booking-test-123',
          flight_instance_id: 'flight-test-1',
          fare_bucket_id: 'fare-test-1',
          passengers: [
            {
              full_name: 'Nguyễn Văn A',
              date_of_birth: '1990-01-01',
              id_number: '123456789',
              phone: '0123456789',
              email: 'test@example.com',
              passenger_type: 'ADULT'
            }
          ],
          price: 1500000,
          created_at: '2025-01-01T00:00:00Z'
        }
      ] as BookingSegmentResponse[]
    };
    console.log('✅ Sample data loaded:', this.bookingData);
  }

  /**
   * Navigate to ticket details
   */
  viewTicketDetails(): void {
    // Navigate to ticket details page
    console.log('Navigate to ticket details');
  }

  /**
   * Navigate to home page
   */
  goHome(): void {
    this.router.navigate(['/']);
  }

  /**
   * Print ticket
   */
  printTicket(): void {
    window.print();
  }

  /**
   * Download PDF
   */
  downloadPDF(): void {
    // Implement PDF download
    console.log('Download PDF');
  }

  /**
   * Book new ticket
   */
  bookNewTicket(): void {
    this.router.navigate(['/']);
  }

  /**
   * Get all tickets from booking segments
   */
  getAllTickets(): Array<{segment: any, passenger: any}> {
    const tickets: Array<{segment: any, passenger: any}> = [];
    
    console.log('🎫 Getting tickets from booking data:', this.bookingData);
    console.log('🎫 Segments:', this.bookingData.segments);
    
    // Check if we have segments data
    if (!this.bookingData.segments || this.bookingData.segments.length === 0) {
      console.log('⚠️ No segments found in booking data');
      console.log('🔍 Booking data structure:', JSON.stringify(this.bookingData, null, 2));
      return tickets;
    }
    
    // Process each segment
    this.bookingData.segments.forEach((segment: any, segmentIndex: number) => {
      console.log(`🎫 Processing segment ${segmentIndex}:`, segment);
      
      // Check if segment has passengers
      if (!segment.passengers || segment.passengers.length === 0) {
        console.log(`⚠️ No passengers found in segment ${segmentIndex}`);
        console.log('🔍 Segment structure:', JSON.stringify(segment, null, 2));
        return;
      }
      
      // Process each passenger in the segment
      segment.passengers.forEach((passenger: any, passengerIndex: number) => {
        console.log(`🎫 Processing passenger ${passengerIndex}:`, passenger);
        
        // Validate passenger data
        if (passenger && passenger.full_name) {
          tickets.push({ segment, passenger });
        } else {
          console.log(`⚠️ Invalid passenger data at index ${passengerIndex}:`, passenger);
        }
      });
    });
    
    console.log('🎫 Final tickets array:', tickets);
    console.log('🎫 Total tickets found:', tickets.length);
    return tickets;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US').format(amount) + ' VND';
  }

  /**
   * Get passenger type label in Vietnamese
   */
  getPassengerTypeLabel(type: string): string {
    switch (type) {
      case 'ADULT': return 'Người lớn';
      case 'CHILD': return 'Trẻ em';
      case 'INFANT': return 'Em bé';
      default: return type;
    }
  }

  /**
   * Get fare bucket class type
   */
  getFareBucketClass(segment: any): string {
    return segment?.fare_bucket?.class_type || 'Economy';
  }

  /**
   * Get fare bucket description
   */
  getFareBucketDescription(segment: any): string {
    return segment?.fare_bucket?.description || 'Hạng phổ thông';
  }

  /**
   * Check if we have real booking data
   */
  hasRealBookingData(): boolean {
    return !!(this.bookingData.bookingCode && 
              this.bookingData.bookingId && 
              this.bookingData.segments && 
              this.bookingData.segments.length > 0);
  }

  /**
   * Get debug information for troubleshooting
   */
  getDebugInfo(): any {
    return {
      hasBookingCode: !!this.bookingData.bookingCode,
      hasBookingId: !!this.bookingData.bookingId,
      hasSegments: !!(this.bookingData.segments && this.bookingData.segments.length > 0),
      segmentsCount: this.bookingData.segments?.length || 0,
      totalTickets: this.getAllTickets().length,
      bookingDataKeys: Object.keys(this.bookingData),
      segmentsStructure: this.bookingData.segments?.map(segment => ({
        id: segment.id,
        passengersCount: segment.passengers?.length || 0,
        passengers: segment.passengers?.map(p => ({
          name: p.full_name,
          type: p.passenger_type
        }))
      }))
    };
  }

  /**
   * Extract passenger names from segments
   */
  private extractPassengerNames(segments: any[]): string[] {
    const names: string[] = [];
    segments.forEach(segment => {
      if (segment.passengers) {
        segment.passengers.forEach((passenger: any) => {
          if (passenger.full_name && !names.includes(passenger.full_name)) {
            names.push(passenger.full_name);
          }
        });
      }
    });
    return names;
  }

  /**
   * Extract contact email from segments (from first passenger)
   */
  private extractContactEmail(segments: any[]): string {
    if (segments.length > 0 && segments[0].passengers && segments[0].passengers.length > 0) {
      return segments[0].passengers[0].email || '';
    }
    return '';
  }

  /**
   * Extract flight number from segments
   */
  private extractFlightNumber(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.flight_number) {
      return segments[0].flight_instance.flight_number.code || 'N/A';
    }
    return 'N/A';
  }

  /**
   * Extract airline name from segments
   */
  private extractAirlineName(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.flight_number?.airline) {
      return segments[0].flight_instance.flight_number.airline.name || 'N/A';
    }
    return 'N/A';
  }

  /**
   * Extract departure airport from segments
   */
  private extractDeparture(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.flight_number?.departure_airport) {
      const airport = segments[0].flight_instance.flight_number.departure_airport;
      return `${airport.city} (${airport.iata_code})`;
    }
    return 'N/A';
  }

  /**
   * Extract destination airport from segments
   */
  private extractDestination(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.flight_number?.arrival_airport) {
      const airport = segments[0].flight_instance.flight_number.arrival_airport;
      return `${airport.city} (${airport.iata_code})`;
    }
    return 'N/A';
  }

  /**
   * Extract departure time from segments
   */
  private extractDepartureTime(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.scheduled_departure_local) {
      return this.formatTime(segments[0].flight_instance.scheduled_departure_local);
    }
    return 'N/A';
  }

  /**
   * Extract arrival time from segments
   */
  private extractArrivalTime(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.scheduled_arrival_local) {
      return this.formatTime(segments[0].flight_instance.scheduled_arrival_local);
    }
    return 'N/A';
  }

  /**
   * Extract flight date from segments
   */
  private extractFlightDate(segments: any[]): string {
    if (segments.length > 0 && segments[0].flight_instance?.scheduled_departure_local) {
      return this.formatDate(segments[0].flight_instance.scheduled_departure_local);
    }
    return 'N/A';
  }

  /**
   * Format time string
   */
  private formatTime(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return 'N/A';
    }
  }

  /**
   * Format date string
   */
  private formatDate(timeString: string): string {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', timeString, error);
      return 'N/A';
    }
  }

  /**
   * Retry loading data
   */
  retryLoadData(): void {
    const bookingId = this.route.snapshot.paramMap.get('id');
    if (bookingId) {
      this.fetchBookingData(bookingId);
    } else {
      this.loadDataFromRouterState();
    }
  }
}
