import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAirlines } from './admin-airlines';

describe('AdminAirlines', () => {
  let component: AdminAirlines;
  let fixture: ComponentFixture<AdminAirlines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminAirlines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAirlines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
