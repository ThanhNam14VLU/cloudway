/**
 * Flight Search Request - Gửi lên backend
 */
export interface FlightSearchRequest {
  departure_airport_id: string;   // UUID của sân bay đi
  destination_airport_id: string; // UUID của sân bay đến
  departure_date: string;         // Format: YYYY-MM-DD
  return_date?: string;           // Format: YYYY-MM-DD (optional cho one-way)
  trip_type: 'oneway' | 'roundtrip';
  adults: number;
  children: number;
  infants: number;
}

/**
 * Flight Model - Response từ backend
 */
export interface FlightModel {
  id: string;
  flight_code: string;           // VN210, VJ146, etc.
  airline_id: string;
  airline_name: string;          // Vietnam Airlines, Vietjet Air
  airline_logo?: string;
  departure_airport_id: string;  // UUID của sân bay đi
  destination_airport_id: string; // UUID của sân bay đến
  departure_time: string;        // HH:mm
  arrival_time: string;          // HH:mm
  departure_date: string;        // YYYY-MM-DD
  arrival_date: string;          // YYYY-MM-DD
  duration: number;              // minutes
  aircraft_type: string;         // A321, Boeing 787
  available_seats: number;
  base_price: number;
  class_type: string;            // Economy, Business
  created_at?: Date | string;
}

/**
 * Flight từ backend với format mới
 */
export interface BackendFlight {
  flight_id: string;
  flight_number: string;
  airline: {
    name: string;
    code: string;
  };
  departure: {
    airport: {
      id: string;
      city: string;
      name: string;
      country: string;
      iata_code: string;
    };
    time: string;
  };
  arrival: {
    airport: {
      id: string;
      city: string;
      name: string;
      country: string;
      iata_code: string;
    };
    time: string;
  };
  duration: {
    hours: number;
    minutes: number;
    total_minutes: number;
    formatted: string;
  };
  aircraft: {
    id: string;
    type: string;
    seat_capacity: number;
  };
  status: string;
  available_seats: number;
  pricing: {
    adult_price: number;
    child_price: number;
    infant_price: number;
    total_price: number;
    currency: string;
    breakdown: any;
  };
  fare_buckets: any[];
}

/**
 * Flight Search Response từ backend
 */
export interface FlightSearchResponse {
  trip_type: 'oneway' | 'roundtrip';
  passengers: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  };
  outbound: {
    departure_date: string;
    flights: BackendFlight[];
  };
  return: {
    departure_date: string;
    flights: BackendFlight[];
  } | null;
}

