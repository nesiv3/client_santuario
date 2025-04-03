import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, lastValueFrom, switchMap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../services/product/product.service';
import { ShoppingService } from '../../services/shopping/shopping.service';
import { UsersService } from '../../services/users/users.service';
import { DetailShoppings } from '../../models/detailShoppings';
import { Product } from '../../models/product';
import { Shopping } from '../../models/shoppings';
import { Customer } from '../../models/customer';
import { User } from '../../models/user';
import { CashRegisterSummaryComponent } from '../cash-register-summary/cash-register-summary.component';
import { CashRegisterCustomerComponent } from '../cash-register-customer/cash-register-customer.component';

;
@Component({
    selector: 'app-cash-register',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CashRegisterSummaryComponent, CashRegisterCustomerComponent],
    templateUrl: './cash-register.component.html',
    styleUrl: './cash-register.component.css'
})

export class CashRegisterComponent implements OnInit {
    
  today: Date = new Date();
  purchaseSummary: Product[] = [];
  barcodeInput = new FormControl('');
  barNameInput = new FormControl('');
  products: Product[] = [];
  selectedProduct: Product | null = null;
  setProduct: Product[] = [];
  isModalOpen = false;
  cashReceived: number = 0;
  change: number = 0;
  selectedCustomer!: Customer;
  paymentOption: string = '';
  modalVisible: boolean = false;
  userItem: User | any = null

  shoppingData = {
        date: new Date(),
        userId: 1,
        customer: 1,
        payment_method: 'Efectivo',
        taxes: 0,
        subtotal: 0,
        total_sale: 0,
        detailShoppingBody: [] as DetailShoppings[]
    };

    constructor(
        private shoppingService: ShoppingService,
        private productService: ProductService,
        private usersService: UsersService
    ) {}

    ngOnInit(): void {
        this.searchProduct();
        this.userItem = JSON.parse(sessionStorage.getItem('user') || '{}');
    }

    // autentificación de cajero
    async userId(): Promise<void> {
        try {
            console.log("Usuario obtenido:", this.userItem);

            if (this.userItem.id_user === undefined) {
                throw new Error("Usuario no encontrado o sin ID válido");
            }
            this.shoppingData.userId = this.userItem.id_user
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
    this.selectedCustomer = customer;  // 🔴 Guardar los datos del cliente
    console.log('Cliente recibido en el padre:', this.selectedCustomer);
    }

    // 🔹 Buscar producto de forma sensitiva
        searchProduct(){
            this.barNameInput.valueChanges
            .pipe(
                debounceTime(500), // ⏳ Espera 500ms después de la última pulsación
                distinctUntilChanged(), // ⚡ Solo busca si el valor cambia
                switchMap(value => {
            if (!value || value.trim() === '') {
                this.setProduct = []; // Limpia la lista si no hay valor
                return []; // Evita la llamada si el input está vacío
            }
            return this.productService.getProductByName(value);
            }))
            .subscribe({
                next: (products) => {
                    this.setProduct = products ?? []; // Asegura que siempre haya un array
                },
                error: (error) => {
                    console.error("Error en la búsqueda de productos:", error);
                    this.setProduct = []; // Limpia la lista en caso de error
                }
             });
        }

       selectProduct() {
        const inputValue = this.barNameInput.value; // Obtener el valor del input
            
        if (!inputValue || inputValue.trim() === '') {
            alert("Debe seleccionar un producto válido.");
            return;
        }       
       
        const productName = this.setProduct.find(p => p.name === inputValue);       
            if (productName) {
                this.selectedProduct = productName; // Guardar el producto seleccionado
                console.log("Producto seleccionado:", this.selectedProduct);
            } else {
                alert("Producto no encontrado en la lista. Asegúrese de seleccionarlo correctamente.");
            }
        }

        addToCart() {
            if (!this.selectedProduct) {
                alert("No hay un producto seleccionado para agregar.");
                return;
            }
        
            const product = this.selectedProduct;
        
            const existingProductIndex = this.shoppingData.detailShoppingBody.findIndex(p => p.id_products === product.id_products);
            console.log("Índice encontrado:", existingProductIndex);
        
            if (existingProductIndex !== -1) {
                // El producto ya está en la lista, actualizar cantidad y total
                console.log("Producto existente, actualizando...");
                this.shoppingData.detailShoppingBody = this.shoppingData.detailShoppingBody.map((item, index) => {
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
                const earnRate = (product.code_earn ?? 0) / 100;
            
                const newItem: DetailShoppings = {
                    id_products: product.id_products ?? 0,
                    code: product.code,
                    name: product.name ?? 'Nombre no disponible',
                    count: 1, // Se inicializa en 1
                    unit_price: product.buy_price * (1 + earnRate),
                    buy_price: product.buy_price,
                    code_earn: product.code_earn,
                    value_taxes: product.taxes_code ?? 0, // Guardar el porcentaje sin calcular
                    total: 1 * product.buy_price * (1 + earnRate) * (1 + taxRate) // Incluir cantidad (1) desde el inicio
                };
            
                this.shoppingData.detailShoppingBody = [...this.shoppingData.detailShoppingBody, newItem]; // Se reasigna el array
            }
        
            this.calculateTotals();
            this.barNameInput.setValue(''); // Limpiar el input después de agregar
            this.selectedProduct = null; // Resetear la selección
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
                const existingProductIndex = this.shoppingData.detailShoppingBody.findIndex(p => p.id_products === productId);
                console.log("Índice encontrado:", existingProductIndex);

                if (existingProductIndex !== -1) {
                    // El producto ya está en la lista, actualizar cantidad y total
                    console.log("Producto existente, actualizando...");
                    this.shoppingData.detailShoppingBody = this.shoppingData.detailShoppingBody.map((item, index) => {
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
                    const earnRate = (product.code_earn ?? 0) / 100
                    const newItem: DetailShoppings = {
                        id_products: product.id_products ?? 0,
                        code: product.code,
                        name: product.name ?? 'Nombre no disponible',
                        count: 1, // Se inicializa en 1
                        unit_price: product.buy_price * (1 + earnRate),
                        buy_price: product.buy_price,
                        code_earn: product.code_earn,
                        value_taxes: product.taxes_code ?? 0, // Guardar el porcentaje sin calcular
                        total: 1 * product.unit_price * (1 + taxRate) // Incluir cantidad (1) desde el inicio
                    };
        
                    this.shoppingData.detailShoppingBody = [...this.shoppingData.detailShoppingBody, newItem]; // Se reasigna el array
                }
        
                this.calculateTotals();
                this.barcodeInput.reset();
            }, error => {
                alert("Error al buscar el producto");
            });
        } 

    // 🔹 Agregado: Eliminar productos del carrito
    removeProduct(productId: number) {
        const index = this.shoppingData.detailShoppingBody.findIndex(p => p.id_products === productId);

        if (index !== -1) {
            if (this.shoppingData.detailShoppingBody[index].count > 1) {
                this.shoppingData.detailShoppingBody[index].count -= 1;
                this.shoppingData.detailShoppingBody[index].total = this.shoppingData.detailShoppingBody[index].count * this.shoppingData.detailShoppingBody[index].unit_price;
            } else {
                this.shoppingData.detailShoppingBody.splice(index, 1);
            }

            this.calculateTotals();
        }
    }

    // 🔹 Manteniendo la nueva forma de calcular totales
    calculateTotals() {
        console.log("Calculando totales...");
        console.log(this.shoppingData.detailShoppingBody);
        this.shoppingData.subtotal = this.shoppingData.detailShoppingBody.reduce(
            (acc, item) => acc + (item.unit_price * item.count), 0
        );
        this.shoppingData.taxes = this.shoppingData.detailShoppingBody.reduce((acc, item) => acc + (((item.count * item.unit_price)* item.value_taxes)/ 100), 0);
        this.shoppingData.total_sale = this.shoppingData.subtotal + this.shoppingData.taxes; // El backend sumará los impuestos

        console.log("Subtotal:", this.shoppingData.subtotal);
        console.log("Taxes:", this.shoppingData.taxes);
        console.log("Total sale:", this.shoppingData.total_sale);
    }

    // 🔹 Confirmación de compra
    openConfirmationModal() {
        this.modalVisible = true;
    }

    paymentMethod(){
        if (this.paymentOption) {
        this.shoppingData.payment_method = this.paymentOption;
        console.log('Método de pago actualizado:', this.shoppingData.payment_method);
        } else {
        console.log('Por favor, seleccione un método de pago válido.');
        }
    }

    async confirmShopping() {
    if (this.shoppingData.detailShoppingBody.length === 0) {
        alert("Debe agregar al menos un producto al carrito");
        return;
    }

    try {
        await this.userId(); // Si falla, ya muestra su error interno
        this.calculateTotals();

        if (!this.selectedCustomer?.id_customers) {
            alert("Debe seleccionar un cliente antes de continuar.");
            return;
        }

        this.shoppingData.customer = this.selectedCustomer.id_customers; 

        // 🔹 Eliminar `name` de los productos antes de enviarlos al backend
        const detail_shopping_sanitized = this.shoppingData.detailShoppingBody.map(({ name, ...item }) => item);
        const dataToSend: Shopping = {
            ...this.shoppingData,
            detailShoppingBody: detail_shopping_sanitized
        };

        console.log("Datos que se enviarán al backend:", JSON.stringify(dataToSend, null, 2));

        this.shoppingService.createShopping(dataToSend).subscribe({
            next: (response) => {
                console.log("Respuesta del backend:", response);
                alert(response.message);
                this.resetShopping();
            },
            error: (error) => {
                console.error("Error en la petición:", error);
                alert(error.message || "Ocurrió un error al procesar la compra.");
            }
        });

        this.modalVisible = false;
    } catch (error) {
        console.error("Error al confirmar la compra:", error);
        alert(error instanceof Error ? error.message : "Error inesperado al confirmar la compra.");
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
            detailShoppingBody: []
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

        this.shoppingData.detailShoppingBody.forEach(item => {
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