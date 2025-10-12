import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFlights } from './admin-flights';

describe('AdminFlights', () => {
  let component: AdminFlights;
  let fixture: ComponentFixture<AdminFlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFlights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFlights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
