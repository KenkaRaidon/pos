/**
 * Main App - Punto de entrada principal del renderer
 */

class POSApp {
  constructor() {
    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    console.log('🚀 Iniciando POS...');
    
    // Suscribir a cambios del carrito
    cartManager.subscribe((items, total) => {
      uiManager.renderCart(items, total);
    });

    // Configurar event listeners
    this.setupEventListeners();

    // Renderizar estado inicial
    uiManager.renderCart(cartManager.getItems(), cartManager.getTotal());
    uiManager.focusInput();

    console.log('✅ POS listo');
  }

  /**
   * Configura todos los event listeners
   */
  setupEventListeners() {
    // Input de código de barras
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeInput) {
      barcodeInput.addEventListener('keypress', (e) => this.handleBarcodeInput(e));
    }

    // Botón de cobrar
    const cobrarBtn = document.getElementById('cobrar-btn');
    if (cobrarBtn) {
      cobrarBtn.addEventListener('click', () => this.handleCobrar());
    }

    // Botón de limpiar carrito
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => this.handleClearCart());
    }

    // Event delegation para botones en la tabla
    const cartBody = document.getElementById('cart-body');
    if (cartBody) {
      cartBody.addEventListener('click', (e) => this.handleCartAction(e));
    }

    // Atajos de teclado
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  /**
   * Maneja el input del código de barras
   */
  async handleBarcodeInput(e) {
    if (e.key !== 'Enter') return;

    const input = e.target;
    const barcode = input.value.trim();

    if (!barcode) return;

    console.log('🔍 Buscando producto:', barcode);
    uiManager.showLoading(true);

    try {
      // Buscar producto
      const product = await productsManager.searchByBarcode(barcode);
      console.log('✅ Producto encontrado:', product);
      
      // Validar stock
      const stockValidation = productsManager.validateStock(product, 1);
      if (!stockValidation.valid) {
        uiManager.showMessage(stockValidation.message, 'warning');
        uiManager.playErrorSound();
        return;
      }

      // Agregar al carrito
      cartManager.addProduct(product);
      
      uiManager.showMessage(`✓ ${product.name} agregado`, 'success', 2000);
      uiManager.playSuccessSound();
      
    } catch (error) {
      console.error('❌ Error al buscar producto:', error);
      uiManager.showMessage(error.message, 'error');
      uiManager.playErrorSound();
    } finally {
      uiManager.showLoading(false);
      uiManager.clearInput();
    }
  }

  /**
   * Maneja acciones en el carrito (eliminar, cambiar cantidad)
   */
  handleCartAction(e) {
    const target = e.target;

    // Eliminar producto
    if (target.classList.contains('delete-btn')) {
      const productId = parseInt(target.dataset.id);
      if (uiManager.confirm('¿Eliminar este producto?')) {
        cartManager.removeProduct(productId);
        uiManager.showMessage('Producto eliminado', 'info', 2000);
      }
      return;
    }

    // Cambiar cantidad
    if (target.classList.contains('qty-btn')) {
      const productId = parseInt(target.dataset.id);
      const action = target.dataset.action;
      const item = cartManager.getItems().find(i => i.id === productId);
      
      if (item) {
        const newQuantity = action === 'increase' 
          ? item.quantity + 1 
          : item.quantity - 1;
        
        if (newQuantity > 0) {
          cartManager.updateQuantity(productId, newQuantity);
        } else {
          if (uiManager.confirm('¿Eliminar este producto?')) {
            cartManager.removeProduct(productId);
          }
        }
      }
    }
  }

  /**
   * Maneja el proceso de cobro
   */
  async handleCobrar() {
    if (cartManager.isEmpty()) {
      uiManager.alert('El carrito está vacío');
      return;
    }

    const total = cartManager.getTotal();
    
    // Mostrar modal de pago
    const paymentMethod = await uiManager.showPaymentModal(total);

    try {
      uiManager.showLoading(true);
      
      // Guardar venta
      const cartData = cartManager.exportForSale();
      const sale = await salesManager.saveSale(cartData, paymentMethod);

      // Imprimir ticket
      await salesManager.printTicket(sale);

      // Limpiar carrito
      cartManager.clear();

      uiManager.showMessage(`✓ Venta completada: $${total.toFixed(2)}`, 'success', 3000);
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      uiManager.showMessage(`Error: ${error.message}`, 'error');
    } finally {
      uiManager.showLoading(false);
      uiManager.focusInput();
    }
  }

  /**
   * Limpia el carrito
   */
  handleClearCart() {
    if (cartManager.isEmpty()) return;

    if (uiManager.confirm('¿Deseas vaciar el carrito?')) {
      cartManager.clear();
      uiManager.showMessage('Carrito limpiado', 'info', 2000);
    }
  }

  /**
   * Maneja atajos de teclado
   */
  handleKeyboardShortcuts(e) {
    // F12 - Cobrar
    if (e.key === 'F12') {
      e.preventDefault();
      this.handleCobrar();
    }

    // ESC - Limpiar carrito
    if (e.key === 'Escape') {
      this.handleClearCart();
    }

    // F1 - Focus en input
    if (e.key === 'F1') {
      e.preventDefault();
      uiManager.focusInput();
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, inicializando POS...');
  new POSApp();
});
