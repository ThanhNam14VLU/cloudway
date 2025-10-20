import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalNotification } from './global-notification';

describe('GlobalNotification', () => {
  let component: GlobalNotification;
  let fixture: ComponentFixture<GlobalNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalNotification);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
