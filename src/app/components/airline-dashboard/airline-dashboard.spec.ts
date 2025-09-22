import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineDashboard } from './airline-dashboard';

describe('AirlineDashboard', () => {
  let component: AirlineDashboard;
  let fixture: ComponentFixture<AirlineDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
