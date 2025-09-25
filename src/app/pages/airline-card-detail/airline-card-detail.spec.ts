import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirlineCardDetail } from './airline-card-detail';

describe('AirlineCardDetail', () => {
  let component: AirlineCardDetail;
  let fixture: ComponentFixture<AirlineCardDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AirlineCardDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AirlineCardDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
