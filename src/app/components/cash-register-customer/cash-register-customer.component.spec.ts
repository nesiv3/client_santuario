import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashRegisterCustomerComponent } from './cash-register-customer.component';

describe('CashRegisterCustomerComponent', () => {
  let component: CashRegisterCustomerComponent;
  let fixture: ComponentFixture<CashRegisterCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashRegisterCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashRegisterCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
