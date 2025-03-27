import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer/customer.service';
import { Customer } from '../../models/customer';

@Component({
  selector: 'list-customers-admin',
  imports: [CommonModule],
  templateUrl: './list-customers-admin.component.html',
  styleUrl: './list-customers-admin.component.css'
})
export class ListCustomersAdminComponent implements OnInit{

  listcustomers: Customer[] = []

    constructor(private customerServices: CustomerService
    ) {}

  ngOnInit(): void {
    this.chargeCustomer();
  }

  chargeCustomer() {
    this.customerServices.getAllCustomers().subscribe({
      next: (customers) => {  
        this.listcustomers = customers || [];  
        console.log('Clientes obtenidos:', this.listcustomers);
      },
      error: (error) => {
        console.error('Error en la búsqueda de clientes:', error);
        this.listcustomers = [];  
      }
    });
  }
}
