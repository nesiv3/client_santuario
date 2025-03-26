import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterSummaryComponent } from './cash-register-summary.component';

describe('CashRegisterSummaryComponent', () => {
  let component: CashRegisterSummaryComponent;
  let fixture: ComponentFixture<CashRegisterSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashRegisterSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashRegisterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
