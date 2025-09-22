import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineNav } from './airline-nav';

describe('AirlineNav', () => {
  let component: AirlineNav;
  let fixture: ComponentFixture<AirlineNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
