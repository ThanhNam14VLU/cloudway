import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FareSelectionDialog } from './fare-selection-dialog';

describe('FareSelectionDialog', () => {
  let component: FareSelectionDialog;
  let fixture: ComponentFixture<FareSelectionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FareSelectionDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FareSelectionDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
