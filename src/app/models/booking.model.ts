/**
 * Passenger Information DTO
 */
export interface PassengerInfo {
  full_name: string;
  date_of_birth?: string;
  id_number?: string;
  phone?: string;
  email?: string;
  passenger_type: 'ADULT' | 'CHILD' | 'INFANT';
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
