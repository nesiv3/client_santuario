import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { DetailShoppings } from '../../models/detailShoppings';
import { ProductService } from '../../Services/product/product.service';
import { ShoppingService } from '../../Services/shopping/shopping.service';
import { CashRegisterSummaryComponent } from '../cash-register-summary/cash-register-summary.component';
import { Shopping } from '../../models/shoppings';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../models/user';
import { lastValueFrom } from 'rxjs';
import { CashRegisterCustomerComponent } from '../cash-register-customer/cash-register-customer.component';
import { Customer } from '../../models/customer';

@Component({
    selector: 'app-cash-register',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CashRegisterSummaryComponent, CashRegisterCustomerComponent],
    templateUrl: './cash-register.component.html',
    styleUrl: './cash-register.component.css'
})

export class CashRegisterComponent {
  today: Date = new Date();
  purchaseSummary: Product[] = [];
  barcodeInput = new FormControl('');
  products: Product[] = [];
  isModalOpen = false;
  cashReceived: number = 0;
  change: number = 0;
  selectedCustomer!: Customer;

  shoppingData = {
        date: new Date(),
        userId: 1,
        customer: 1,
        payment_method: 'Efectivo',
        taxes: 0,
        subtotal: 0,
        total_sale: 0,
        detail_shoppings: [] as DetailShoppings[]
    };

    modalVisible: boolean = false;

    constructor(
        private shoppingService: ShoppingService,
        private productService: ProductService,
        private usersService: UsersService
    ) {}

    // autentificación de cajero
    async userId(): Promise<number> {
        try {
            const user = await lastValueFrom(this.usersService.getUserById(2));
            console.log("Usuario obtenido:", user);

            if (user.id_user === undefined) {
                throw new Error("Usuario no encontrado o sin ID válido");
            }
            return user.id_user;
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("Error en la petición del usuario");
            }
            throw error; // Esto permite que el error se propague si es necesario
        }
    }

    setCustomerData(customer: Customer) {
    console.log('Cliente recibido en el padre:', customer);
    this.selectedCustomer = customer;  // 🔴 Guardar los datos del cliente
    console.log('Cliente recibido en el padre:', this.selectedCustomer);
    }
    
    // 🔹 Agregado: Escanear productos por código de barras
        scanProduct() {
            const code = this.barcodeInput.value;
            if (!code) return;
        
            this.productService.getProductByCode(code).subscribe(product => {
                if (!product) {
                    alert("Producto no encontrado");
                    return;
                }
                console.log("Producto recibido:", product);

                // 📌 Validar si `product.id_product` existe realmente
                if (typeof product.id_products === "undefined" || product.id_products === null) {
                    alert("Error: El producto no tiene un ID válido");
                    return;
                }
        

                const productId = product.id_products ?? 0;
                console.log("Escaneado:", productId, product.code);
                const existingProductIndex = this.shoppingData.detail_shoppings.findIndex(p => p.id_products === productId);
                console.log("Índice encontrado:", existingProductIndex);

                if (existingProductIndex !== -1) {
                    // El producto ya está en la lista, actualizar cantidad y total
                    console.log("Producto existente, actualizando...");
                    this.shoppingData.detail_shoppings = this.shoppingData.detail_shoppings.map((item, index) => {
                        if (index === existingProductIndex) {
                            const updatedCount = item.count + 1;
                            const taxRate = item.value_taxes / 100;
                            return {
                                ...item,
                                count: updatedCount,
                                total: updatedCount * item.unit_price * (1 + taxRate)
                            };
                        }
                        return item;
                    });

                } else {
                    // Si no existe, agregar nuevo producto
                    const taxRate = (product.taxes_code ?? 0) / 100; // Convertir a porcentaje
                    const newItem: DetailShoppings = {
                        id_products: product.id_products ?? 0,
                        code: product.code,
                        name: product.name ?? 'Nombre no disponible',
                        count: 1, // Se inicializa en 1
                        unit_price: product.unit_price,
                        value_taxes: product.taxes_code ?? 0, // Guardar el porcentaje sin calcular
                        total: 1 * product.unit_price * (1 + taxRate) // Incluir cantidad (1) desde el inicio
                    };
        
                    this.shoppingData.detail_shoppings = [...this.shoppingData.detail_shoppings, newItem]; // Se reasigna el array
                }
        
                this.calculateTotals();
                this.barcodeInput.reset();
            }, error => {
                alert("Error al buscar el producto");
            });
        } 

    // 🔹 Agregado: Eliminar productos del carrito
    removeProduct(productId: number) {
        const index = this.shoppingData.detail_shoppings.findIndex(p => p.id_products === productId);

        if (index !== -1) {
            if (this.shoppingData.detail_shoppings[index].count > 1) {
                this.shoppingData.detail_shoppings[index].count -= 1;
                this.shoppingData.detail_shoppings[index].total = this.shoppingData.detail_shoppings[index].count * this.shoppingData.detail_shoppings[index].unit_price;
            } else {
                this.shoppingData.detail_shoppings.splice(index, 1);
            }

            this.calculateTotals();
        }
    }

    // 🔹 Manteniendo la nueva forma de calcular totales
    calculateTotals() {
        console.log("Calculando totales...");
        console.log(this.shoppingData.detail_shoppings);
        this.shoppingData.subtotal = this.shoppingData.detail_shoppings.reduce(
            (acc, item) => acc + (item.unit_price * item.count), 0
        );
        this.shoppingData.taxes = this.shoppingData.detail_shoppings.reduce((acc, item) => acc + (((item.count * item.unit_price)* item.value_taxes)/ 100), 0);
        this.shoppingData.total_sale = this.shoppingData.subtotal + this.shoppingData.taxes; // El backend sumará los impuestos

        console.log("Subtotal:", this.shoppingData.subtotal);
        console.log("Taxes:", this.shoppingData.taxes);
        console.log("Total sale:", this.shoppingData.total_sale);
    }

    // 🔹 Confirmación de compra
    openConfirmationModal() {
        this.modalVisible = true;
    }

    async confirmShopping() {
        if (this.shoppingData.detail_shoppings.length === 0) {
            alert("Debe agregar al menos un producto al carrito");
            return;
        }
    
        try {
            this.shoppingData.userId = await this.userId();
            this.calculateTotals();

            // 🔹 Eliminar `name` de los productos antes de enviarlos al backend
            const detail_shopping_sanitized = this.shoppingData.detail_shoppings.map(({ name, ...item }) => item);
            const dataToSend: Shopping = {
                ...this.shoppingData,
                detail_shoppings: detail_shopping_sanitized
            };

            console.log("Datos que se enviarán al backend:", JSON.stringify(dataToSend, null, 2));
    
            this.shoppingService.createShopping(dataToSend).subscribe({
                next: (response) => {
                    console.log("Respuesta del backend:", response);
                    alert(response.message);
                    this.resetShopping();
                },
                error: (error) => {
                    alert(error.message);
                }
            });
    
            this.modalVisible = false;
        } catch (error) {
            console.error("Error obteniendo el userId:", error);
        }

    }
    

    resetShopping() {
        this.shoppingData = {
            date: new Date(),
            userId: 1,
            customer: 123,
            payment_method: 'Efectivo',
            taxes: 0,
            subtotal: 0,
            total_sale: 0,
            detail_shoppings: []
        };
    }

    // 🔹 Agregado: Imprimir resumen de compra
    printSummary() {
        let summaryContent = `
            <h2>Factura de Compra</h2>
            <p>Fecha: ${this.shoppingData.date.toLocaleString()}</p>
            <p>Cliente ID: ${this.shoppingData.customer}</p>
            <p>Método de pago: ${this.shoppingData.payment_method}</p>
            <h3>Detalles de la compra:</h3>
            <table border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>Producto ID</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Total</th>
                </tr>
        `;

        this.shoppingData.detail_shoppings.forEach(item => {
            summaryContent += `
                <tr>
                    <td>${item.id_products}</td>
                    <td>${item.count}</td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                </tr>
            `;
        });

        summaryContent += `
            </table>
            <h3>Subtotal: ${this.shoppingData.subtotal.toFixed(2)}</h3>
            <h3>Total Venta: ${this.shoppingData.total_sale.toFixed(2)}</h3>
        `;

        const printWindow = window.open('', '', 'width=600,height=600');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Factura</title></head><body>');
            printWindow.document.write(summaryContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }

    // 🔹 Confirmación del atajo de teclado para abrir el modal de pago
    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === ' ') {
            this.openConfirmationModal();
        }
    }
  }