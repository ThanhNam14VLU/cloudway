import { Injectable } from '@angular/core';
import { CreateBookingWithPassengersDto, BookingSegment, PassengerInfo } from '../../models/booking.model';
import { BackendFlight } from '../../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class BookingHelperService {

  /**
   * Tạo booking DTO từ flight selection và passenger info
   */
  createBookingDto(
    selectedFlights: BackendFlight[],
    passengers: PassengerInfo[],
    contactInfo: {
      fullname: string;
      phone: string;
    },
    userId?: string
  ): CreateBookingWithPassengersDto {
    
    console.log('🛠️ Creating booking DTO from:', {
      selectedFlights: selectedFlights.length,
      passengers: passengers.length,
      contactInfo,
      userId
    });

    // Tạo segments từ selected flights (ưu tiên dữ liệu đã chọn từ UI)
    const segments: BookingSegment[] = selectedFlights.map(flight => ({
      flight_instance_id: (flight as any).flight_instance_id || (flight as any).flight_id,
      fare_bucket_id: (flight as any).fare_bucket_id || this.getDefaultFareBucketId(flight),
      passengers: passengers
    }));

    const bookingDto: CreateBookingWithPassengersDto = {
      user_id: userId,
      contact_fullname: contactInfo.fullname,
      contact_phone: contactInfo.phone,
      segments: segments
    };

    console.log('✅ Booking DTO created:', bookingDto);
    return bookingDto;
  }

  /**
   * Tạo passenger info từ form data
   */
  createPassengerInfo(
    fullName: string,
    dateOfBirth?: string,
    idNumber?: string,
    phone?: string,
    email?: string,
    passengerType: 'ADULT' | 'CHILD' | 'INFANT' = 'ADULT'
  ): PassengerInfo {
    return {
      full_name: fullName,
      date_of_birth: dateOfBirth,
      id_number: idNumber,
      phone: phone,
      email: email,
      passenger_type: passengerType
    };
  }

  /**
   * Tạo multiple passengers từ form data
   */
  createMultiplePassengers(
    adults: number,
    children: number,
    infants: number,
    basePassengerData: Partial<PassengerInfo>
  ): PassengerInfo[] {
    const passengers: PassengerInfo[] = [];

    // Tạo adults
    for (let i = 0; i < adults; i++) {
      passengers.push({
        ...basePassengerData,
        passenger_type: 'ADULT',
        full_name: basePassengerData.full_name || `Adult ${i + 1}`
      } as PassengerInfo);
    }

    // Tạo children
    for (let i = 0; i < children; i++) {
      passengers.push({
        ...basePassengerData,
        passenger_type: 'CHILD',
        full_name: basePassengerData.full_name || `Child ${i + 1}`
      } as PassengerInfo);
    }

    // Tạo infants
    for (let i = 0; i < infants; i++) {
      passengers.push({
        ...basePassengerData,
        passenger_type: 'INFANT',
        full_name: basePassengerData.full_name || `Infant ${i + 1}`
      } as PassengerInfo);
    }

    return passengers;
  }

  /**
   * Validate booking data trước khi gửi
   */
  validateBookingData(dto: CreateBookingWithPassengersDto): string[] {
    const errors: string[] = [];

    if (!dto.contact_fullname || dto.contact_fullname.trim().length === 0) {
      errors.push('Vui lòng nhập họ tên người liên hệ');
    }

    if (!dto.contact_phone || dto.contact_phone.trim().length === 0) {
      errors.push('Vui lòng nhập số điện thoại liên hệ');
    }

    if (!dto.segments || dto.segments.length === 0) {
      errors.push('Vui lòng chọn ít nhất một chuyến bay');
    }

    // Validate segments
    dto.segments.forEach((segment, index) => {
      if (!segment.flight_instance_id) {
        errors.push(`Segment ${index + 1}: Vui lòng chọn chuyến bay`);
      }

      if (!segment.fare_bucket_id) {
        errors.push(`Segment ${index + 1}: Vui lòng chọn hạng vé`);
      }

      if (!segment.passengers || segment.passengers.length === 0) {
        errors.push(`Segment ${index + 1}: Vui lòng nhập thông tin hành khách`);
      }

      // Validate passengers
      segment.passengers.forEach((passenger, pIndex) => {
        if (!passenger.full_name || passenger.full_name.trim().length === 0) {
          errors.push(`Segment ${index + 1}, Hành khách ${pIndex + 1}: Vui lòng nhập họ tên`);
        }

        if (!passenger.passenger_type) {
          errors.push(`Segment ${index + 1}, Hành khách ${pIndex + 1}: Vui lòng chọn loại hành khách`);
        }
      });
    });

    return errors;
  }

  /**
   * Format booking response để hiển thị
   */
  formatBookingResponse(response: any): any {
    return {
      ...response,
      booking: {
        ...response.booking,
        segments: response.booking.segments.map((segment: any) => ({
          ...segment,
          flight_info: this.getFlightInfoFromSegment(segment),
          passenger_count: segment.passengers.length
        }))
      }
    };
  }

  /**
   * Lấy thông tin flight từ segment
   */
  private getFlightInfoFromSegment(segment: any): any {
    // This would need to be implemented based on your flight data structure
    return {
      flight_id: segment.flight_instance_id,
      fare_bucket_id: segment.fare_bucket_id,
      price: segment.price
    };
  }

  /**
   * Lấy default fare bucket ID (economy)
   */
  private getDefaultFareBucketId(flight: BackendFlight): string {
    // Default to economy fare bucket
    // You might want to make this configurable or get from flight data
    return 'b500ed8d-fc0e-4439-bb9d-46f601295b5b'; // Economy fare bucket ID
  }

  /**
   * Tính tổng giá booking
   */
  calculateTotalPrice(segments: BookingSegment[], flightPricing: any[]): number {
    let total = 0;
    
    segments.forEach(segment => {
      const flight = flightPricing.find(f => f.flight_instance_id === segment.flight_instance_id);
      if (flight) {
        segment.passengers.forEach(passenger => {
          switch (passenger.passenger_type) {
            case 'ADULT':
              total += flight.adult_price || 0;
              break;
            case 'CHILD':
              total += flight.child_price || 0;
              break;
            case 'INFANT':
              total += flight.infant_price || 0;
              break;
          }
        });
      }
    });

    return total;
  }
}
