import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineReport } from './airline-report';

describe('AirlineReport', () => {
  let component: AirlineReport;
  let fixture: ComponentFixture<AirlineReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
