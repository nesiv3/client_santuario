import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer';
import { CustomerService } from '../../services/customer/customer.service';

@Component({
  selector: 'cash-register-customer',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-register-customer.component.html',
  styleUrl: './cash-register-customer.component.css'
})
export class CashRegisterCustomerComponent {

  @Output() customerSelected = new EventEmitter<Customer>();  // 🔴 Evento para enviar el cliente al padre

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading: boolean = false;
  filterText: string = '';
  customerForm: Customer = {
    document: '', name: '', phone: '', email: ''
  };
  isEditing: boolean = false;
  
  constructor (
    private customerServices : CustomerService
  ){}

  saveCustomer() {  
    this.loading = true;  // 🔄 Activar estado de carga
  
    this.customerServices.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        console.log('Clientes obtenidos:', this.customers);
      
        console.log('Cliente guardado:', this.customerForm);
        this.customerSelected.emit(this.customerForm);
      
        this.resetCustomerForm();
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
      },
      complete: () => {
        this.loading = false;  // ✅ Desactivar estado de carga cuando termina
      }
    });
  }

  resetCustomerForm() {
    this.customerForm = { document: '', name: '', phone: '', email: '' };
  }
}
