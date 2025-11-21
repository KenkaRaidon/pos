/**
 * Main App - Punto de entrada principal del renderer
 */

class POSApp {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    console.log('🚀 Iniciando POS...');
    
    // Verificar autenticación
    this.checkAuth();

    // Suscribir a cambios del carrito
    cartManager.subscribe((items, total) => {
      uiManager.renderCart(items, total);
    });

    // Inicializar el escáner de códigos de barras
    barcodeScanner.init((barcode) => this.handleScannedBarcode(barcode));

    // Inicializar el registro rápido
    quickRegister.init();

    // Configurar event listeners
    this.setupEventListeners();

    // Renderizar estado inicial
    uiManager.renderCart(cartManager.getItems(), cartManager.getTotal());

    console.log('✅ POS iniciado correctamente');
  }

  /**
   * Verifica la autenticación del usuario
   */
  checkAuth() {
    const userJson = sessionStorage.getItem('currentUser');
    
    if (!userJson) {
      window.location.href = 'login.html';
      return;
    }

    try {
      this.currentUser = JSON.parse(userJson);
      console.log('👤 Usuario logueado:', this.currentUser.name);
      
      // Actualizar UI con nombre de usuario
      this.updateUserInfo();
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      window.location.href = 'login.html';
    }
  }

  /**
   * Actualiza información del usuario en la UI
   */
  updateUserInfo() {
    const header = document.querySelector('.page-header');
    if (header && this.currentUser) {
      const userBadge = document.createElement('div');
      userBadge.style.cssText = 'position: absolute; top: 20px; right: 20px; background: #3498db; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; display: flex; align-items: center; gap: 8px;';
      userBadge.innerHTML = `
        <span>👤 ${this.currentUser.name}</span>
        <button id="logout-btn" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 16px; padding: 0; margin-left: 8px;" title="Cerrar sesión">🚪</button>
      `;
      header.style.position = 'relative';
      header.appendChild(userBadge);

      // Evento para cerrar sesión
      document.getElementById('logout-btn').addEventListener('click', () => {
        this.logout();
      });
    }
  }

  /**
   * Cierra sesión
   */
  logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
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

    await this.processBarcode(barcode);
  }

  /**
   * Maneja códigos de barras escaneados desde la cámara
   */
  async handleScannedBarcode(barcode) {
    console.log('📷 Código escaneado desde cámara:', barcode);
    await this.processBarcode(barcode);
  }

  /**
   * Procesa un código de barras (desde input o cámara)
   */
  async processBarcode(barcode) {
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
      
      // FLUJO DE INTERRUPCIÓN POSITIVA
      // Si el producto no existe, abrir modal de registro rápido
      if (error.message.includes('no encontrado') || error.message.includes('not found')) {
        console.log('⚡ Producto no encontrado, abriendo registro rápido...');
        uiManager.showMessage('🔍 Producto no encontrado', 'warning', 2000);
        
        // Abrir modal de registro rápido
        quickRegister.open(barcode, (newProduct) => {
          // Callback: cuando se registre el producto, agregarlo al carrito
          console.log('✅ Producto registrado, agregando al carrito:', newProduct);
          cartManager.addProduct(newProduct);
          uiManager.playSuccessSound();
        });
      } else {
        // Otro tipo de error
        uiManager.showMessage(error.message, 'error');
        uiManager.playErrorSound();
      }
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

    // Si se canceló, no hacer nada
    if (!paymentMethod) {
      return;
    }

    try {
      uiManager.showLoading(true);
      
      // Guardar venta
      const cartData = cartManager.exportForSale();
      const sale = await salesManager.saveSale(cartData, paymentMethod);

      // Generar ticket PDF
      try {
        await salesManager.printTicket(sale);
        uiManager.showMessage(`✓ Venta completada: $${total.toFixed(2)}\n📄 Ticket descargado`, 'success', 4000);
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError);
        uiManager.showMessage(`✓ Venta guardada pero el ticket no se pudo generar`, 'warning', 4000);
      }

      // Limpiar carrito
      cartManager.clear();
      
    } catch (error) {
      console.error('Error al procesar venta:', error);
      uiManager.showMessage(`❌ Error al procesar venta:\n${error.message}`, 'error', 5000);
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
