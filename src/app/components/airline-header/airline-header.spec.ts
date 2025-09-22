import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineHeader } from './airline-header';

describe('AirlineHeader', () => {
  let component: AirlineHeader;
  let fixture: ComponentFixture<AirlineHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
