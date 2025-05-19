import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PurchasesService } from '../../services/purchases/purchases.service';
import { ProductService } from '../../services/product/product.service';
import { SupplierService } from '../../services/supplier/supplier.service';
import { Product } from '../../models/product';
import { Supplier } from '../../models/supplier';
import { Purchase } from '../../models/purchases';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {
  purchaseForm: FormGroup;
  products: Product[] = [];
  suppliers: Supplier[] = [];
  selectedProducts: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private purchasesService: PurchasesService,
    private productService: ProductService,
    private supplierService: SupplierService
  ) {
    this.purchaseForm = this.fb.group({
      supplier: ['', Validators.required],
      date: ['', Validators.required],
      barcode: ['', [Validators.required, Validators.minLength(5)]],
      count: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
      },
      error: () => {
        this.showTemporaryMessage('Error al cargar proveedores.', 'error');
      }
    });
  }

  onBarcodeScan(): void {
    const barcode = this.purchaseForm.value.barcode;
    if (!barcode) return;

    this.productService.getProductByCode(barcode).subscribe({
      next: (product) => {
        if (product) {
          const existingProduct = this.selectedProducts.find(p => p.id_products === product.id_products);
          if (existingProduct) {
            existingProduct.count += this.purchaseForm.value.count;
            this.calculateTotal(existingProduct);
          } else {
            const newProduct = {
              ...product,
              count: this.purchaseForm.value.count,
              total: 0
            };
            this.selectedProducts.push(newProduct);
            this.calculateTotal(newProduct);
          }
        } else {
          this.showTemporaryMessage('Producto no encontrado.', 'error');
        }
      },
      error: () => {
        this.showTemporaryMessage('Error al buscar el producto.', 'error');
      }
    });
    this.purchaseForm.patchValue({ barcode: '', count: 1 });

  }


  subtotal: number = 0;
taxes: number = 0;
totalPrice: number = 0;

calculateTotal(product: any): void {
  product.total = (product.unit_price + (product.unit_price * product.taxes_code) / 100) * product.count;
  this.updateTotals();
}

updateTotals(): void {
  this.subtotal = this.selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.count), 0);
  this.taxes = this.selectedProducts.reduce((sum, p) => sum + ((p.unit_price * p.taxes_code) / 100) * p.count, 0);
  this.totalPrice = this.subtotal + this.taxes;
}

removeProduct(index: number): void {
  this.selectedProducts.splice(index, 1);
  this.updateTotals();
}

  submitPurchase(): void {
    if (this.selectedProducts.length === 0) {
      this.showTemporaryMessage('Debe agregar al menos un producto.', 'error');
      return;
    }

    const totalCount = this.selectedProducts.reduce((sum, p) => sum + p.count, 0);
    const subtotal = this.selectedProducts.reduce((sum, p) => sum + p.unit_price * p.count, 0);
    const taxes = this.selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.taxes_code / 100) * p.count, 0);
    const totalPrice = subtotal + taxes;

    const purchaseData: Purchase = {
      supplier: this.purchaseForm.value.supplier,
      date: this.purchaseForm.value.date,
      count: this.selectedProducts.reduce((sum, p) => sum + p.count, 0),
      price: this.selectedProducts.reduce((sum, p) => sum + p.unit_price * p.count, 0),
      taxes: this.selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.taxes_code / 100) * p.count, 0),
      subtotal: this.selectedProducts.reduce((sum, p) => sum + p.unit_price * p.count, 0),
      total_price: this.selectedProducts.reduce((sum, p) => sum + p.total, 0),
      detailPurchasesBody: this.selectedProducts.map(product => ({
        id_products: product.id_products,
        count: product.count,
        unit_price: parseFloat(product.unit_price),
        value_taxes: product.taxes_code,
        total: (parseFloat(product.unit_price) + (parseFloat(product.unit_price) * product.taxes_code / 100)) * product.count
      }))
    };

    this.purchasesService.createPurchase(purchaseData).subscribe({
      next: () => {
        this.showTemporaryMessage('Compra finalizada con exito', 'success');
        this.selectedProducts = [];
        this.purchaseForm.reset();

      },
      error: () => {
        this.showTemporaryMessage('Error al registrar la compra.', 'error');
      }
    });
  }
  showTemporaryMessage(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.successMessage = message;
    } else {
      this.errorMessage = message;
    }

    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }


}
