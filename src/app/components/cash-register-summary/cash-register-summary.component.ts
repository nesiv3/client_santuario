import { Component, Input } from '@angular/core';
import { Shopping } from '../../models/shoppings';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cash-register-summary',
  imports: [CommonModule],
  templateUrl:'./cash-register-summary.component.html',
  styleUrl: './cash-register-summary.component.css'
})
export class CashRegisterSummaryComponent {

  @Input() shoppingData!: Shopping;
  @Input() today: Date = new Date();


}
