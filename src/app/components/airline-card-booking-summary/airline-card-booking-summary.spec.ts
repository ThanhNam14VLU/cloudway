import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineCardBookingSummary } from './airline-card-booking-summary';

describe('AirlineCardBookingSummary', () => {
  let component: AirlineCardBookingSummary;
  let fixture: ComponentFixture<AirlineCardBookingSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineCardBookingSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineCardBookingSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
