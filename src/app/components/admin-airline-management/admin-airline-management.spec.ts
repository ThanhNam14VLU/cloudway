import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAirlineManagement } from './admin-airline-management';

describe('AdminAirlineManagement', () => {
  let component: AdminAirlineManagement;
  let fixture: ComponentFixture<AdminAirlineManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAirlineManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAirlineManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
