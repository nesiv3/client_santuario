import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierService } from '../../services/supplier/supplier.service';
import { Supplier } from '../../models/supplier';
import { response } from 'express';
import { error } from 'console';


@Component({
    selector: 'supplier',
    imports: [CommonModule, FormsModule,ReactiveFormsModule],
    templateUrl: './supplier.component.html',
    styleUrl: './supplier.component.css'
})
export class SupplierComponent {

  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  loading: boolean = false;
  filterText: string = '';
  supplierForm: FormGroup;
  isEditing: boolean = false;
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 10; // Elementos por página
  searchTerm: string = ''; // Término de búsqueda
  

  constructor(private supplierService: SupplierService,private fb: FormBuilder) { 
    this.supplierForm = this.fb.group({
      nit: [{ value: '', disabled: this.isEditing }, Validators.pattern(/^[0-9-]+$/)],
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      active: [true],
      id_suppliers: [0]
    });
  }

  ngOnInit() {
    this.loadSuppliers();
  }


  searchSupplier() {
    this.currentPage = 1;
    const searchTerm = this.searchTerm.toLowerCase();
    this.filteredSuppliers = this.suppliers.filter((supplier) =>
      supplier.nit.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  loadSuppliers() {
    this.loading = true;
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener proveedores', err);
        this.loading = false;
      }
    });
  }
  filterSuppliers() {
    this.filteredSuppliers = this.suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }
  saveSupplier() {
    if (this.supplierForm.invalid) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }

    const supplierData = this.supplierForm.value;

    if (this.isEditing) {
      this.supplierService.updateSupplier(supplierData.id_suppliers, supplierData).subscribe(() => {
        this.loadSuppliers();
        this.resetForm();
        alert('Actualizado exitosamente.');
      return;
      });
    } else {
      this.supplierService.createSuppliers(supplierData).subscribe(() => {
        this.loadSuppliers();
        this.resetForm();
        alert('Proveedor creado exitosamente.');
      return;
      });
    }
  }
  editSupplier(supplier: Supplier) {
    this.supplierForm.patchValue(supplier);
    this.isEditing = true;
  }
  deleteSuppliers(id_suppliers: number) {

    if (confirm('¿Estás seguro de desactivar este proveedor?')) {
      this.supplierService.deleteSupplier(id_suppliers).subscribe(() => {

        this.loadSuppliers();
      });
    }
  }
  resetForm() {
    this.supplierForm.reset({
      nit: '',
      name: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      active: true,
      id_suppliers: 0
    });
    this.isEditing = false
  }

  toggleSupplierStatus(supplier: any) {
    const previousState = supplier.active;
    supplier.active = !supplier.active;

    this.supplierService.deleteSupplier(supplier.id_suppliers).subscribe({
      next:(response)=>{
        console.log("Estado actualizado correctamente",response);
        alert(response.message);
      },
      error:(error)=>{
        console.error("Error Actualizar estado:",error);
        supplier.active=previousState;
      }
    });
  }
  

  get paginatedSuppliers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredSuppliers.slice(start, end);
  }
  
  nextPage() {
    if ((this.currentPage * this.itemsPerPage) < this.filteredSuppliers.length) {
      this.currentPage++;
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

}
