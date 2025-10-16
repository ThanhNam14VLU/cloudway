export interface AirportModel {
  id: string;                    // uuid
  iata_code: string;              // iata_code (3 characters)
  name: string;                  // airport name (max 255 chars)
  city: string;                  // city name (max 100 chars)
  country: string;               // country name (max 100 chars)
  timezone: string;              // timezone (max 50 chars)
  created_at: Date | string;      // created_at timestamp
}

export interface CreateAirportModel {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}