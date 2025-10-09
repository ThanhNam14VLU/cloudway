import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlightSearchRequest, FlightSearchResponse } from '../../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  // Store search params để share giữa các components
  private searchParamsSubject = new BehaviorSubject<FlightSearchRequest | null>(null);
  public searchParams$ = this.searchParamsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Tìm kiếm chuyến bay
   */
  searchFlights(searchParams: FlightSearchRequest): Observable<FlightSearchResponse> {
    console.log('🔍 Searching flights with params:', searchParams);
    
    // Lưu search params vào subject
    this.searchParamsSubject.next(searchParams);
    
    return this.http.post<FlightSearchResponse>(
      `${environment.apiUrl}/flights/search`,
      searchParams
    );
  }

  /**
   * Lấy search params hiện tại
   */
  getCurrentSearchParams(): FlightSearchRequest | null {
    return this.searchParamsSubject.value;
  }

  /**
   * Clear search params
   */
  clearSearchParams(): void {
    this.searchParamsSubject.next(null);
  }

  /**
   * Validate search params trước khi gửi
   */
  validateSearchParams(params: Partial<FlightSearchRequest>): string[] {
    const errors: string[] = [];

    if (!params.departure_airport_id) {
      errors.push('Vui lòng chọn điểm đi');
    }

    if (!params.destination_airport_id) {
      errors.push('Vui lòng chọn điểm đến');
    }

    if (params.departure_airport_id === params.destination_airport_id) {
      errors.push('Điểm đi và điểm đến không được trùng nhau');
    }

    if (!params.departure_date) {
      errors.push('Vui lòng chọn ngày đi');
    }

    if (params.trip_type === 'roundtrip' && !params.return_date) {
      errors.push('Vui lòng chọn ngày về cho chuyến khứ hồi');
    }

    // Validate dates
    if (params.departure_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const departDate = new Date(params.departure_date);
      
      if (departDate < today) {
        errors.push('Ngày đi không được là ngày trong quá khứ');
      }
    }

    if (params.departure_date && params.return_date) {
      const departDate = new Date(params.departure_date);
      const returnDate = new Date(params.return_date);
      
      if (returnDate < departDate) {
        errors.push('Ngày về phải sau ngày đi');
      }
    }

    if (!params.adults || params.adults < 1) {
      errors.push('Phải có ít nhất 1 người lớn');
    }

    const totalPassengers = (params.adults || 0) + (params.children || 0) + (params.infants || 0);
    if (totalPassengers > 9) {
      errors.push('Tổng số hành khách không được vượt quá 9 người');
    }

    return errors;
  }

  /**
   * Format date to YYYY-MM-DD
   */
  formatDateForApi(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculate total price for passengers
   */
  calculateTotalPrice(basePrice: number, adults: number, children: number, infants: number): number {
    const childDiscount = 0.75;  // Trẻ em giảm 25%
    const infantDiscount = 0.1;  // Em bé giảm 90%
    
    return (
      basePrice * adults +
      basePrice * childDiscount * children +
      basePrice * infantDiscount * infants
    );
  }

  /**
   * Format duration từ minutes sang giờ phút
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} phút`;
    }
    if (mins === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${mins} phút`;
  }
}

