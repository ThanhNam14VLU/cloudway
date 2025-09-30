import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineCardBookingInfo } from './airline-card-booking-info';

describe('AirlineCardBookingInfo', () => {
  let component: AirlineCardBookingInfo;
  let fixture: ComponentFixture<AirlineCardBookingInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineCardBookingInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineCardBookingInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
