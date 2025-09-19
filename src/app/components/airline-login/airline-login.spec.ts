import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineLogin } from './airline-login';

describe('AirlineLogin', () => {
  let component: AirlineLogin;
  let fixture: ComponentFixture<AirlineLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
