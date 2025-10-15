import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CreateBookingWithPassengersDto, 
  BookingResponse 
} from '../../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  /**
   * Tạo booking với thông tin passengers
   */
  createBookingWithPassengers(dto: CreateBookingWithPassengersDto): Observable<BookingResponse> {
    console.log('🎫 Creating booking with passengers:', dto);
    
    return this.http.post<BookingResponse>(
      `${environment.apiUrl}/bookings/with-passengers`,
      dto
    );
  }

  /**
   * Lấy thông tin booking theo ID
   */
  getBookingById(bookingId: string): Observable<any> {
    console.log('📋 Getting booking by ID:', bookingId);
    
    return this.http.get<any>(
      `${environment.apiUrl}/bookings/${bookingId}`
    );
  }

  /**
   * Lấy thông tin booking theo PNR code
   */
  getBookingByPNR(pnrCode: string): Observable<any> {
    console.log('🔍 Getting booking by PNR:', pnrCode);
    
    return this.http.get<any>(
      `${environment.apiUrl}/bookings/pnr/${pnrCode}`
    );
  }

  /**
   * Lấy danh sách bookings của user hiện tại
   */
  getUserBookings(): Observable<any[]> {
    console.log('📋 Getting user bookings');
    
    return this.http.get<any[]>(
      `${environment.apiUrl}/bookings/my-bookings`
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking(bookingId: string): Observable<any> {
    console.log('❌ Canceling booking:', bookingId);
    
    return this.http.patch<any>(
      `${environment.apiUrl}/bookings/${bookingId}/cancel`,
      {}
    );
  }

  /**
   * Update booking status
   */
  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    console.log('🔄 Updating booking status:', bookingId, 'to', status);
    
    return this.http.patch<any>(
      `${environment.apiUrl}/bookings/${bookingId}/status`,
      { status }
    );
  }
}
