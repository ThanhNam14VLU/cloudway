import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAirports } from './admin-airports';

describe('AdminAirports', () => {
  let component: AdminAirports;
  let fixture: ComponentFixture<AdminAirports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAirports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAirports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
