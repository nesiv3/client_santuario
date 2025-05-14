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

  constructor(
    private fb: FormBuilder,
    private purchasesService: PurchasesService,
    private productService: ProductService,
    private supplierService: SupplierService
  ) {
    this.purchaseForm = this.fb.group({
      supplier: ['', Validators.required],
      date: ['', Validators.required],
      barcode: ['', Validators.required],
      count: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe((data) => {
      this.suppliers = data;
    });
  }

  onBarcodeScan(): void {
    const barcode = this.purchaseForm.value.barcode;
    if (!barcode) return;

    this.productService.getProductByCode(barcode).subscribe((product) => {
      if (product) {
        console.log('Producto encontrado:', product);
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
          // this.calculateTotal(newProduct);
          this.selectedProducts.push(newProduct);
        }
      } else {
        alert('Producto no encontrado')
      }
    }, error => {
      console.error('Error obteniendo producto', error)

    });
    this.purchaseForm.patchValue({ barcode: '' });

  }

  calculateTotal(product: any): void {
    product.total = (product.unit_price + (product.unit_price * product.value_taxes) / 100) * product.count;
  }




  removeProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
  }

  submitPurchase(): void {
    if (this.selectedProducts.length === 0) return;

    const totalCount = this.selectedProducts.reduce((sum, p) => sum + p.count, 0);
    const subtotal = this.selectedProducts.reduce((sum, p) => sum + p.unit_price * p.count, 0);
    const taxes = this.selectedProducts.reduce((sum, p) => sum + (p.unit_price * p.taxes_code / 100) * p.count, 0);
    const totalPrice = subtotal + taxes;

    const purchaseData: Purchase = {
      supplier: this.purchaseForm.value.supplier,
      date: this.purchaseForm.value.date,
      count: totalCount,
      price: subtotal,
      taxes: taxes,
      subtotal: subtotal,
      total_price: totalPrice, // Se agrega esta propiedad
      detailPurchasesBody: this.selectedProducts.map(product => ({ // Se corrige el nombre del array
        id_products: product.id_products,
        count: product.count,
        unit_price: parseFloat(product.unit_price),
        value_taxes: product.taxes_code,
        total: (parseFloat(product.unit_price) + (parseFloat(product.unit_price) * product.taxes_code / 100)) * product.count
      }))
    };

    console.log('Compra a enviar:', purchaseData);

    this.purchasesService.createPurchase(purchaseData).subscribe({
      next: (response) => {
        console.log("Respuesta del backend:", response);
        alert(response.message);
        this.selectedProducts = [];
        this.purchaseForm.reset();

      },
      error: (error) => {
        console.error("Error en la petición:", error);
        alert(error.message || "Ocurrió un error al procesar la compra.");
      }
    });
  }
}
