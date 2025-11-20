/**
 * Quick Register Module - Registro rápido de productos nuevos
 * Permite registrar productos al vuelo durante el escaneo
 */

class QuickRegister {
  constructor() {
    this.modal = null;
    this.barcodeInput = null;
    this.nameInput = null;
    this.descriptionInput = null;
    this.costPriceInput = null;
    this.salePriceInput = null;
    this.currentStockInput = null;
    this.minStockInput = null;
    this.isBulkInput = null;
    this.currentBarcode = null;
    this.onSuccessCallback = null;
  }

  /**
   * Inicializa el módulo
   */
  init() {
    this.modal = document.getElementById('quick-register-modal');
    this.barcodeInput = document.getElementById('qr-barcode');
    this.nameInput = document.getElementById('qr-name');
    this.descriptionInput = document.getElementById('qr-description');
    this.costPriceInput = document.getElementById('qr-cost-price');
    this.salePriceInput = document.getElementById('qr-sale-price');
    this.currentStockInput = document.getElementById('qr-current-stock');
    this.minStockInput = document.getElementById('qr-min-stock');
    this.isBulkInput = document.getElementById('qr-is-bulk');

    this.setupEventListeners();
    console.log('⚡ Quick Register inicializado');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón de guardar
    const saveBtn = document.getElementById('qr-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveProduct());
    }

    // Botón de cancelar
    const cancelBtn = document.getElementById('qr-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.close());
    }

    // Form submit
    const form = document.getElementById('quick-register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProduct();
      });
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Cerrar al hacer click fuera del modal
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
  }

  /**
   * Abre el modal para registrar un producto nuevo
   */
  open(barcode, onSuccess) {
    if (!this.modal) {
      console.error('Modal no encontrado');
      return;
    }

    this.currentBarcode = barcode;
    this.onSuccessCallback = onSuccess;

    // Pre-llenar el código de barras
    if (this.barcodeInput) {
      this.barcodeInput.value = barcode;
    }

    // Limpiar otros campos
    if (this.nameInput) this.nameInput.value = '';
    if (this.descriptionInput) this.descriptionInput.value = '';
    if (this.costPriceInput) this.costPriceInput.value = '';
    if (this.salePriceInput) this.salePriceInput.value = '';
    if (this.currentStockInput) this.currentStockInput.value = '0';
    if (this.minStockInput) this.minStockInput.value = '5';
    if (this.isBulkInput) this.isBulkInput.checked = false;

    // Mostrar modal
    this.modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus en el campo de nombre
    setTimeout(() => {
      if (this.nameInput) {
        this.nameInput.focus();
      }
    }, 100);

    console.log('📦 Modal de registro rápido abierto para:', barcode);
  }

  /**
   * Cierra el modal
   */
  close() {
    if (!this.modal) return;

    this.modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Limpiar datos
    this.currentBarcode = null;
    this.onSuccessCallback = null;

    console.log('❌ Modal de registro cerrado');
  }

  /**
   * Verifica si el modal está abierto
   */
  isOpen() {
    return this.modal && this.modal.classList.contains('show');
  }

  /**
   * Valida los datos del formulario
   */
  validateForm() {
    const barcode = this.barcodeInput?.value.trim();
    const name = this.nameInput?.value.trim();
    const costPrice = this.costPriceInput?.value.trim();
    const salePrice = this.salePriceInput?.value.trim();

    if (!barcode) {
      return { valid: false, message: 'El código de barras es requerido' };
    }

    if (!name || name.length < 2) {
      return { valid: false, message: 'El nombre debe tener al menos 2 caracteres' };
    }

    if (!costPrice || isNaN(parseFloat(costPrice)) || parseFloat(costPrice) < 0) {
      return { valid: false, message: 'El precio de costo debe ser un número válido' };
    }

    if (!salePrice || isNaN(parseFloat(salePrice)) || parseFloat(salePrice) <= 0) {
      return { valid: false, message: 'El precio de venta debe ser un número mayor a 0' };
    }

    // Validar que el precio de venta sea mayor al de costo
    if (parseFloat(salePrice) < parseFloat(costPrice)) {
      return { valid: false, message: 'El precio de venta debe ser mayor al precio de costo' };
    }

    return { valid: true };
  }

  /**
   * Guarda el producto nuevo
   */
  async saveProduct() {
    // Validar formulario
    const validation = this.validateForm();
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    // Obtener datos del formulario
    const productData = {
      barcode: this.barcodeInput.value.trim(),
      name: this.nameInput.value.trim(),
      description: this.descriptionInput.value.trim() || null,
      costPrice: parseFloat(this.costPriceInput.value),
      salePrice: parseFloat(this.salePriceInput.value),
      currentStock: parseInt(this.currentStockInput.value) || 0,
      minStock: parseInt(this.minStockInput.value) || 5,
      isBulk: this.isBulkInput.checked
    };

    console.log('💾 Guardando producto nuevo:', productData);

    try {
      // Mostrar loading
      this.setLoading(true);

      // Guardar en el backend
      const savedProduct = await apiClient.post('/products', productData);

      console.log('✅ Producto guardado:', savedProduct);

      // Transformar al formato interno
      const product = {
        id: savedProduct.id,
        name: savedProduct.name,
        barcode: savedProduct.barcode,
        price: parseFloat(savedProduct.salePrice),
        cost: parseFloat(savedProduct.costPrice || 0),
        stock: savedProduct.currentStock || 0
      };

      // Cerrar modal
      this.close();

      // Llamar callback de éxito
      if (this.onSuccessCallback && typeof this.onSuccessCallback === 'function') {
        this.onSuccessCallback(product);
      }

      // Mostrar mensaje de éxito
      if (typeof uiManager !== 'undefined') {
        uiManager.showMessage(`✓ ${product.name} registrado y agregado`, 'success', 3000);
      }

    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Muestra/oculta el estado de loading
   */
  setLoading(loading) {
    const saveBtn = document.getElementById('qr-save-btn');
    const cancelBtn = document.getElementById('qr-cancel-btn');

    if (saveBtn) {
      saveBtn.disabled = loading;
      saveBtn.textContent = loading ? '⏳ Guardando...' : '💾 GUARDAR Y AGREGAR';
    }

    if (cancelBtn) {
      cancelBtn.disabled = loading;
    }

    // Deshabilitar inputs
    if (this.nameInput) this.nameInput.disabled = loading;
    if (this.descriptionInput) this.descriptionInput.disabled = loading;
    if (this.costPriceInput) this.costPriceInput.disabled = loading;
    if (this.salePriceInput) this.salePriceInput.disabled = loading;
    if (this.currentStockInput) this.currentStockInput.disabled = loading;
    if (this.minStockInput) this.minStockInput.disabled = loading;
    if (this.isBulkInput) this.isBulkInput.disabled = loading;
  }
}

// Instancia singleton global
const quickRegister = new QuickRegister();
