import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineFlightAdd } from './airline-flight-add';

describe('AirlineFlightAdd', () => {
  let component: AirlineFlightAdd;
  let fixture: ComponentFixture<AirlineFlightAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineFlightAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineFlightAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
