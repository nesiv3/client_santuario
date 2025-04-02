import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../models/customer';
import { CustomerService } from '../../services/customer/customer.service';

@Component({
  selector: 'cash-register-customer',
  standalone: true, 
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cash-register-customer.component.html',
  styleUrl: './cash-register-customer.component.css'
})
export class CashRegisterCustomerComponent implements OnInit {

  @Output() customerSelected = new EventEmitter<Customer>();  

  customersApi: Customer[] = [];
  selectCustomer: Customer | null = null;
  loading: boolean = false;
  isEditing: boolean = false;

  customerForm = new FormGroup({
    document: new FormControl('', [Validators.required]),
    name: new FormControl({ value: '', disabled: true }, [Validators.required]),
    phone: new FormControl({ value: '', disabled: true }, [Validators.required]),
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email])
  });

  constructor(private customerServices: CustomerService) {}

  ngOnInit(): void {
    this.chargeCustomer();
  }

  chargeCustomer() {
    this.customerServices.getAllCustomers().subscribe({
      next: (customers) => {  
        this.customersApi = customers || [];  
        console.log('Clientes obtenidos:', this.customersApi);
      },
      error: (error) => {
        console.error('Error en la búsqueda de clientes:', error);
        this.customersApi = [];  
      }
    });
  }

  selectingCustomer(event?: KeyboardEvent) {
    if (event) {
      event.preventDefault();  // Evita que Enter dispare el formulario
    }
    console.log("⏩ selectingCustomer() ejecutado");

    const inputValue = this.customerForm.get('document')?.value?.trim();
  
    if (!inputValue) {
      alert("Debe ingresar un documento válido.");
      return;
    }
  
    const foundCustomer = this.customersApi.find(c => c.document === inputValue);
  
    if (foundCustomer) {
      this.selectCustomer = foundCustomer;
      this.customerForm.patchValue(foundCustomer);
  
      // 🔹 Deshabilitar los campos después de autocompletarlos
      this.customerForm.controls['name'].disable();
      this.customerForm.controls['phone'].disable();
      this.customerForm.controls['email'].disable();
  
      this.isEditing = true;
      this.sendCustomer();
    } else {
      alert("Cliente no encontrado. Asegúrese de ingresar correctamente o cree un nuevo cliente.");
      
      // ✅ Limpiar y habilitar los campos correctamente
      this.customerForm.reset({
        document: inputValue,  // Mantener el documento ingresado
        name: '',
        phone: '',
        email: ''
      });
  
      this.customerForm.controls['name'].enable();
      this.customerForm.controls['phone'].enable();
      this.customerForm.controls['email'].enable();
  
      this.selectCustomer = null;
      this.isEditing = false;
    }
  }  
  
  saveCustomer() {
    console.log("⏩ saveCustomer() ejecutado");
    if (this.customerForm.invalid) {
      alert("Por favor, complete todos los campos correctamente.");
      return;
    }
  
    this.loading = true;  // 🔄 Activar spinner
  
    const newCustomer: Customer = this.customerForm.getRawValue() as Customer;
  
    this.customerServices.createCustomer(newCustomer).subscribe({
      next: (response) => {
        alert("Cliente registrado exitosamente.");
        this.customersApi.push(response);
        this.selectCustomer = response;
  
        // ✅ Deshabilitar los campos después de registrar
        this.customerForm.controls['name'].disable();
        this.customerForm.controls['phone'].disable();
        this.customerForm.controls['email'].disable();
  
        this.isEditing = true;
      },
      error: (err) => {
        console.error("Error al registrar cliente:", err);
        alert("Hubo un error al registrar el cliente.");
      },
      complete: () => {
        this.loading = false;  // ✅ Desactivar spinner
        this.sendCustomer();
      }
    });
  }  

  cashCustomer(){

  }
  
  sendCustomer() {
    this.customerSelected.emit(this.selectCustomer ?? undefined);
  }
  resetCustomerForm() {
    this.customerForm.reset();
    this.selectCustomer = null;
    this.isEditing = false;
    this.customerForm.controls.name.disable();
    this.customerForm.controls.phone.disable();
    this.customerForm.controls.email.disable();
  }
}



