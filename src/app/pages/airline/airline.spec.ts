import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Airline } from './airline';

describe('Airline', () => {
  let component: Airline;
  let fixture: ComponentFixture<Airline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Airline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Airline);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
