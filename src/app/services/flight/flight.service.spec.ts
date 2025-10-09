import { TestBed } from '@angular/core/testing';
import { FlightService } from './flight.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FlightService', () => {
  let service: FlightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(FlightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate search params correctly', () => {
    const sameAirportId = 'uuid-123';
    const invalidParams = {
      departure_airport_id: sameAirportId,
      destination_airport_id: sameAirportId, // Same as departure
      departure_date: '2025-01-01',
      trip_type: 'oneway' as const,
      adults: 1,
      children: 0,
      infants: 0
    };

    const errors = service.validateSearchParams(invalidParams);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('Điểm đi và điểm đến không được trùng nhau');
  });

  it('should format duration correctly', () => {
    expect(service.formatDuration(130)).toBe('2 giờ 10 phút');
    expect(service.formatDuration(60)).toBe('1 giờ');
    expect(service.formatDuration(45)).toBe('45 phút');
  });
});

