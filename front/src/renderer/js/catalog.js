/**
 * Catalog App - Gestión completa del catálogo de productos
 */

class CatalogApp {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentProduct = null;
    this.catalogScanner = null;
    this.init();
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    console.log('📦 Iniciando Catálogo...');
    this.initScanner();
    this.setupEventListeners();
    this.loadProducts();
  }

  /**
   * Inicializa el scanner para el catálogo
   */
  initScanner() {
    this.catalogScanner = new BarcodeScanner();
    this.catalogScanner.init((barcode) => this.handleScannedBarcode(barcode));
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón nuevo producto
    const newProductBtn = document.getElementById('new-product-btn');
    if (newProductBtn) {
      newProductBtn.addEventListener('click', () => this.openNewProductModal());
    }

    // Botón toggle scanner
    const toggleScannerBtn = document.getElementById('toggle-catalog-scanner-btn');
    if (toggleScannerBtn) {
      toggleScannerBtn.addEventListener('click', () => this.toggleCatalogScanner());
    }

    // Botón verificar código de barras
    const verifyBarcodeBtn = document.getElementById('verify-barcode-btn');
    if (verifyBarcodeBtn) {
      verifyBarcodeBtn.addEventListener('click', () => this.verifyBarcode());
    }

    // Input de código de barras - verificar al salir del campo
    const barcodeInput = document.getElementById('product-barcode');
    if (barcodeInput) {
      barcodeInput.addEventListener('blur', () => {
        if (barcodeInput.value.trim() && !this.currentProduct) {
          this.verifyBarcode();
        }
      });
    }

    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    // Filtros
    const filterActive = document.getElementById('filter-active');
    if (filterActive) {
      filterActive.addEventListener('change', () => this.applyFilters());
    }

    const filterStock = document.getElementById('filter-stock');
    if (filterStock) {
      filterStock.addEventListener('change', () => this.applyFilters());
    }

    // Modal
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => this.closeModal());
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Formulario
    const productForm = document.getElementById('product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    // Event delegation para acciones en la tabla
    const tbody = document.getElementById('products-tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => this.handleTableAction(e));
    }
  }

  /**
   * Carga todos los productos
   */
  async loadProducts() {
    try {
      console.log('🔄 Cargando productos...');
      this.showLoading(true);

      const products = await apiClient.get('/products');
      this.products = products;
      this.applyFilters();

      console.log(`✅ ${products.length} productos cargados`);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      this.showError('Error al cargar productos: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Aplica filtros a los productos
   */
  applyFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const activeFilter = document.getElementById('filter-active')?.value || 'active';
    const stockFilter = document.getElementById('filter-stock')?.value || 'all';

    this.filteredProducts = this.products.filter(product => {
      // Filtro de búsqueda
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm) ||
        product.barcode.includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm));

      // Filtro de estado
      const matchesActive = 
        activeFilter === 'all' ||
        (activeFilter === 'active' && product.isActive) ||
        (activeFilter === 'inactive' && !product.isActive);

      // Filtro de stock
      const matchesStock = 
        stockFilter === 'all' ||
        (stockFilter === 'low' && product.currentStock <= product.minStock && product.currentStock > 0) ||
        (stockFilter === 'out' && product.currentStock === 0);

      return matchesSearch && matchesActive && matchesStock;
    });

    this.renderProducts();
  }

  /**
   * Maneja la búsqueda
   */
  handleSearch(searchTerm) {
    this.applyFilters();
  }

  /**
   * Renderiza la tabla de productos
   */
  renderProducts() {
    const tbody = document.getElementById('products-tbody');
    const countEl = document.getElementById('products-count');

    if (!tbody) return;

    // Actualizar contador
    if (countEl) {
      countEl.innerHTML = `Total de productos: <strong>${this.filteredProducts.length}</strong>`;
    }

    // Renderizar tabla
    if (this.filteredProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 60px; color: #95a5a6;">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <p style="font-size: 18px; font-weight: 600;">No hay productos</p>
            <p style="font-size: 14px; margin-top: 8px;">Intenta ajustar los filtros o agrega un nuevo producto</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredProducts.map(product => {
      const stockClass = this.getStockClass(product);
      const stockIcon = this.getStockIcon(product);
      
      return `
        <tr data-id="${product.id}" class="${!product.isActive ? 'inactive-row' : ''}">
          <td>${product.id}</td>
          <td><code>${product.barcode}</code></td>
          <td><strong>${product.name}</strong></td>
          <td>${product.description || '<span style="color: #bdc3c7;">Sin descripción</span>'}</td>
          <td>$${parseFloat(product.costPrice).toFixed(2)}</td>
          <td><strong>$${parseFloat(product.salePrice).toFixed(2)}</strong></td>
          <td class="${stockClass}">${stockIcon} ${product.currentStock}</td>
          <td>${product.minStock}</td>
          <td>
            <span class="badge ${product.isActive ? 'badge-success' : 'badge-danger'}">
              ${product.isActive ? '✓ Activo' : '✗ Inactivo'}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon btn-edit" data-action="edit" data-id="${product.id}" title="Editar">
                ✏️
              </button>
              <button class="btn-icon btn-delete" data-action="delete" data-id="${product.id}" title="Eliminar">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Obtiene la clase CSS según el nivel de stock
   */
  getStockClass(product) {
    if (product.currentStock === 0) return 'stock-out';
    if (product.currentStock <= product.minStock) return 'stock-low';
    return 'stock-ok';
  }

  /**
   * Obtiene el ícono según el nivel de stock
   */
  getStockIcon(product) {
    if (product.currentStock === 0) return '🔴';
    if (product.currentStock <= product.minStock) return '🟡';
    return '🟢';
  }

  /**
   * Maneja las acciones en la tabla
   */
  handleTableAction(e) {
    const target = e.target;
    const action = target.dataset.action;
    const productId = parseInt(target.dataset.id);

    if (action === 'edit') {
      this.openEditProductModal(productId);
    } else if (action === 'delete') {
      this.deleteProduct(productId);
    }
  }

  /**
   * Abre el modal para nuevo producto
   */
  openNewProductModal() {
    this.currentProduct = null;
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
      modalTitle.textContent = '➕ Nuevo Producto';
    }
    this.resetForm();
    this.clearValidationMessage();
    this.openModal();
  }

  /**
   * Maneja código escaneado desde la cámara
   */
  async handleScannedBarcode(barcode) {
    console.log('📷 Código escaneado:', barcode);
    const barcodeInput = document.getElementById('product-barcode');
    if (barcodeInput) {
      barcodeInput.value = barcode;
      await this.verifyBarcode();
      
      // Enfocar el siguiente campo si es nuevo producto
      if (!this.currentProduct) {
        const nameInput = document.getElementById('product-name');
        if (nameInput) nameInput.focus();
      }
    }
  }

  /**
   * Toggle del scanner de catálogo
   */
  async toggleCatalogScanner() {
    const btn = document.getElementById('toggle-catalog-scanner-btn');
    const reader = document.getElementById('catalog-qr-reader');
    
    if (!this.catalogScanner.isScanning) {
      // Configurar para usar el elemento correcto
      this.catalogScanner.html5QrCode = null; // Reset
      
      // Iniciar scanner
      try {
        const readerElement = document.getElementById('catalog-qr-reader');
        if (!readerElement) return;

        if (typeof Html5Qrcode === 'undefined') {
          throw new Error('Librería html5-qrcode no cargada');
        }

        this.catalogScanner.html5QrCode = new Html5Qrcode('catalog-qr-reader');

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 120 },
          aspectRatio: 1.7777778
        };

        if (this.catalogScanner.config.formatsToSupport) {
          config.formatsToSupport = this.catalogScanner.config.formatsToSupport;
        }

        await this.catalogScanner.html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => this.catalogScanner.onScanSuccess(decodedText),
          () => {} // onScanError
        );

        this.catalogScanner.isScanning = true;
        reader.style.display = 'block';
        btn.textContent = '⏸️ Pausar Cámara';
        btn.classList.add('active');

      } catch (error) {
        console.error('Error al iniciar scanner:', error);
        alert('No se pudo acceder a la cámara');
      }
    } else {
      // Detener scanner
      if (this.catalogScanner.html5QrCode) {
        await this.catalogScanner.html5QrCode.stop();
        this.catalogScanner.html5QrCode.clear();
      }
      this.catalogScanner.isScanning = false;
      this.catalogScanner.lastScannedCode = null;
      this.catalogScanner.lastScanTime = 0;
      reader.style.display = 'none';
      btn.textContent = '📷 Activar Cámara';
      btn.classList.remove('active');
    }
  }

  /**
   * Verifica si el código de barras ya existe
   */
  async verifyBarcode() {
    const barcodeInput = document.getElementById('product-barcode');
    const barcode = barcodeInput?.value.trim();

    if (!barcode) {
      this.showValidationMessage('Por favor ingresa un código de barras', 'warning');
      return;
    }

    try {
      // Buscar si el producto ya existe
      const existingProduct = this.products.find(p => p.barcode === barcode);

      if (this.currentProduct) {
        // Modo edición: verificar que no sea de otro producto
        if (existingProduct && existingProduct.id !== this.currentProduct.id) {
          this.showValidationMessage(`⚠️ Este código ya existe en: "${existingProduct.name}"`, 'error');
          barcodeInput.focus();
        } else {
          this.showValidationMessage('✓ Código válido', 'success');
        }
      } else {
        // Modo creación: el código no debe existir
        if (existingProduct) {
          this.showValidationMessage(
            `⚠️ Este código ya existe en: "${existingProduct.name}" (ID: ${existingProduct.id})`,
            'error'
          );
          barcodeInput.focus();
        } else {
          this.showValidationMessage('✓ Código disponible', 'success');
        }
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
    }
  }

  /**
   * Muestra mensaje de validación
   */
  showValidationMessage(message, type = 'info') {
    const msgEl = document.getElementById('barcode-validation-msg');
    if (!msgEl) return;

    msgEl.textContent = message;
    msgEl.className = `validation-msg ${type} show`;

    // Auto-ocultar después de 5 segundos si es éxito
    if (type === 'success') {
      setTimeout(() => {
        msgEl.classList.remove('show');
      }, 5000);
    }
  }

  /**
   * Limpia el mensaje de validación
   */
  clearValidationMessage() {
    const msgEl = document.getElementById('barcode-validation-msg');
    if (msgEl) {
      msgEl.className = 'validation-msg';
      msgEl.textContent = '';
    }
  }

  /**
   * Abre el modal para editar producto
   */
  openEditProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.currentProduct = product;
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
      modalTitle.textContent = '✏️ Editar Producto';
    }

    // Llenar formulario con datos del producto
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-barcode').value = product.barcode;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-cost-price').value = parseFloat(product.costPrice);
    document.getElementById('product-sale-price').value = parseFloat(product.salePrice);
    document.getElementById('product-current-stock').value = product.currentStock;
    document.getElementById('product-min-stock').value = product.minStock;
    document.getElementById('product-is-bulk').checked = product.isBulk;
    document.getElementById('product-is-active').checked = product.isActive;

    this.openModal();
  }

  /**
   * Abre el modal
   */
  openModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('show');
      
      // Solo bloquear scroll del body cuando el modal esté abierto
      document.body.style.overflow = 'hidden';
      
      // Focus en el primer campo
      setTimeout(() => {
        const firstInput = document.getElementById('product-barcode');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }

  /**
   * Cierra el modal
   */
  closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('show');
      
      // Detener scanner si está activo
      if (this.catalogScanner?.isScanning) {
        this.toggleCatalogScanner();
      }
      
      // Restaurar scroll del body
      document.body.style.overflow = '';
      
      this.resetForm();
      this.clearValidationMessage();
    }
  }

  /**
   * Resetea el formulario
   */
  resetForm() {
    const form = document.getElementById('product-form');
    if (form) {
      form.reset();
      document.getElementById('product-id').value = '';
      document.getElementById('product-is-active').checked = true;
    }
  }

  /**
   * Maneja el submit del formulario
   */
  async handleSubmit(e) {
    e.preventDefault();

    const barcode = document.getElementById('product-barcode').value.trim();
    
    // Validar código de barras duplicado antes de guardar
    const existingProduct = this.products.find(p => p.barcode === barcode);
    
    if (!this.currentProduct && existingProduct) {
      this.showValidationMessage(
        `⚠️ No se puede guardar: El código ya existe en "${existingProduct.name}"`,
        'error'
      );
      return;
    }

    if (this.currentProduct && existingProduct && existingProduct.id !== this.currentProduct.id) {
      this.showValidationMessage(
        `⚠️ No se puede guardar: El código ya existe en "${existingProduct.name}"`,
        'error'
      );
      return;
    }

    const productData = {
      barcode: barcode,
      name: document.getElementById('product-name').value.trim(),
      description: document.getElementById('product-description').value.trim() || null,
      costPrice: parseFloat(document.getElementById('product-cost-price').value),
      salePrice: parseFloat(document.getElementById('product-sale-price').value),
      currentStock: parseInt(document.getElementById('product-current-stock').value) || 0,
      minStock: parseInt(document.getElementById('product-min-stock').value) || 5,
      isBulk: document.getElementById('product-is-bulk').checked,
      isActive: document.getElementById('product-is-active').checked
    };

    // Validar precios
    if (productData.salePrice < productData.costPrice) {
      alert('El precio de venta debe ser mayor o igual al precio de costo');
      return;
    }

    try {
      this.setFormLoading(true);

      if (this.currentProduct) {
        // Actualizar producto existente
        const productId = parseInt(document.getElementById('product-id').value);
        await apiClient.patch(`/products/${productId}`, productData);
        console.log('✅ Producto actualizado');
      } else {
        // Crear nuevo producto
        await apiClient.post('/products', productData);
        console.log('✅ Producto creado');
      }

      this.closeModal();
      await this.loadProducts();
      this.showSuccess(this.currentProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');

    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      this.setFormLoading(false);
    }
  }

  /**
   * Elimina un producto
   */
  async deleteProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiClient.delete(`/products/${productId}`);
      console.log('✅ Producto eliminado (soft delete)');
      await this.loadProducts();
      this.showSuccess('Producto eliminado correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      alert('Error al eliminar: ' + error.message);
    }
  }

  /**
   * Muestra/oculta loading en la tabla
   */
  showLoading(loading) {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (loading) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="loading-row">
            <div class="loading-spinner">⏳ Cargando productos...</div>
          </td>
        </tr>
      `;
    }
  }

  /**
   * Muestra/oculta loading en el formulario
   */
  setFormLoading(loading) {
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const inputs = document.querySelectorAll('#product-form input, #product-form textarea');

    if (saveBtn) {
      saveBtn.disabled = loading;
      saveBtn.textContent = loading ? '⏳ Guardando...' : '💾 Guardar';
    }

    if (cancelBtn) {
      cancelBtn.disabled = loading;
    }

    inputs.forEach(input => {
      input.disabled = loading;
    });
  }

  /**
   * Muestra mensaje de error
   */
  showError(message) {
    // Podrías implementar un toast o notification
    alert(message);
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(message) {
    // Podrías implementar un toast o notification
    console.log('✅', message);
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM cargado, inicializando Catálogo...');
  new CatalogApp();
});
