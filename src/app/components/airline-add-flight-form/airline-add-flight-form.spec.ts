import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineAddFlightForm } from './airline-add-flight-form';

describe('AirlineAddFlightForm', () => {
  let component: AirlineAddFlightForm;
  let fixture: ComponentFixture<AirlineAddFlightForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineAddFlightForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineAddFlightForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
