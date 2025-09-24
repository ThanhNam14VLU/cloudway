import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineSetting } from './airline-setting';

describe('AirlineSetting', () => {
  let component: AirlineSetting;
  let fixture: ComponentFixture<AirlineSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineSetting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineSetting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
