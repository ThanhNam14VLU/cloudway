export interface CreateFlightInstanceModel {
  airline_id: string;
  flight_number: {
    code: string;
    departure_airport_id: string;
    arrival_airport_id: string;
  };
  aircraft_id: string;
  scheduled_departure_local: string;
  scheduled_arrival_local: string;
  fares: Array<{
    fare_bucket_id: string;
    passenger_type: 'ADULT' | 'CHILD' | 'INFANT';
    base_price: number;
    total_seats: number;
  }>;
}
