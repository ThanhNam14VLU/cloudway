/**
 * Passenger Information DTO
 */
export interface PassengerInfo {
  id?: string;
  full_name: string;
  date_of_birth?: string;
  id_number?: string;
  phone?: string;
  email?: string;
  passenger_type: 'ADULT' | 'CHILD' | 'INFANT';
  created_at?: string;
  pricing?: {
    base_price: number;
    passenger_price: number;
    passenger_type: string;
    currency: string;
  };
}

/**
 * Booking Segment DTO
 */
export interface BookingSegment {
  flight_instance_id: string;
  fare_bucket_id: string;
  passengers: PassengerInfo[];
}

/**
 * Create Booking with Passengers DTO
 */
export interface CreateBookingWithPassengersDto {
  user_id?: string;
  contact_fullname: string;
  contact_phone: string;
  segments: BookingSegment[];
}

/**
 * Booking Segment Response (from backend)
 */
export interface BookingSegmentResponse {
  id: string;
  booking_id: string;
  flight_instance_id: string;
  fare_bucket_id: string;
  passengers: PassengerInfo[];
  price: number;
  created_at: string;
  fare_bucket?: {
    id: string;
    code: string;
    class_type: string;
    description: string;
  };
  flight_instance?: {
    id: string;
    scheduled_departure_local: string;
    scheduled_arrival_local: string;
    flight_number?: {
      code: string;
      airline?: {
        id: string;
        name: string;
        iata_code: string;
        logo?: string;
      };
      departure_airport?: {
        id: string;
        city: string;
        name: string;
        country: string;
        iata_code: string;
      };
      arrival_airport?: {
        id: string;
        city: string;
        name: string;
        country: string;
        iata_code: string;
      };
    };
  };
  duration?: {
    hours: number;
    minutes: number;
    total_minutes: number;
    formatted: string;
  };
  pricing?: {
    base_price: number;
    segment_total: number;
    currency: string;
    fare_bucket?: {
      id: string;
      code: string;
      class_type: string;
      description: string;
    };
    fare_details?: {
      id: string;
      base_price: number;
      fare_bucket?: {
        id: string;
        code: string;
        class_type: string;
        description: string;
      };
    };
  };
}

/**
 * Payment Information
 */
export interface PaymentInfo {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

/**
 * Booking Response
 */
export interface BookingResponse {
  message: string;
  booking: {
    id: string;
    pnr_code: string;
    user_id: string | null;
    contact_fullname: string;
    contact_phone: string;
    status: string;
    created_at: string;
    segments: BookingSegmentResponse[];
    payment: PaymentInfo;
  };
}
