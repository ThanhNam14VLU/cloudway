export interface AirportModel {
  id: string;                    // uuid
  iata_code: string;              // iata_code (3 characters)
  name: string;                  // airport name (max 255 chars)
  city: string;                  // city name (max 100 chars)
  country: string;               // country name (max 100 chars)
  timezone: string;              // timezone (max 50 chars)
  create_at: Date | string;      // created_at timestamp
}

