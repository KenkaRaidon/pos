/**
 * UI Module - Gestión de la interfaz de usuario
 */

class UIManager {
  constructor() {
    this.elements = {};
    this.initElements();
  }

  /**
   * Inicializa referencias a elementos del DOM
   */
  initElements() {
    this.elements = {
      barcodeInput: document.getElementById('barcode-input'),
      cartBody: document.getElementById('cart-body'),
      totalAmount: document.getElementById('total-amount'),
      totalItems: document.getElementById('total-items'),
      statusMsg: document.getElementById('status-msg'),
      cobrarBtn: document.getElementById('cobrar-btn'),
      clearCartBtn: document.getElementById('clear-cart-btn')
    };
  }

  /**
   * Renderiza el carrito en la tabla
   */
  renderCart(items, total) {
    if (!this.elements.cartBody) return;

    // Limpiar tabla
    this.elements.cartBody.innerHTML = '';

    // Si está vacío
    if (items.length === 0) {
      this.elements.cartBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: #95a5a6; padding: 40px;">
            <i class="icon-cart" style="font-size: 48px;">🛒</i>
            <p>El carrito está vacío</p>
            <p style="font-size: 12px;">Escanea un producto para comenzar</p>
          </td>
        </tr>
      `;
      this.updateTotal(0);
      this.updateTotalItems(0);
      return;
    }

    // Renderizar items
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.price;
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <div class="quantity-controls">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>
          <div class="product-name">${item.name}</div>
          <div class="product-barcode">${item.barcode || ''}</div>
        </td>
        <td class="price">$${item.price.toFixed(2)}</td>
        <td class="subtotal">
          $${subtotal.toFixed(2)}
          <button class="delete-btn" data-id="${item.id}" title="Eliminar">🗑️</button>
        </td>
      `;
      this.elements.cartBody.appendChild(row);
    });

    // Actualizar total
    this.updateTotal(total);
    this.updateTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
  }

  /**
   * Actualiza el total mostrado
   */
  updateTotal(total) {
    if (this.elements.totalAmount) {
      this.elements.totalAmount.textContent = total.toFixed(2);
    }
  }

  /**
   * Actualiza el contador de items
   */
  updateTotalItems(count) {
    if (this.elements.totalItems) {
      this.elements.totalItems.textContent = count;
    }
  }

  /**
   * Muestra un mensaje de estado (error, éxito, info)
   */
  showMessage(message, type = 'error', duration = 3000) {
    if (!this.elements.statusMsg) return;

    const icon = {
      error: '❌',
      success: '✅',
      info: 'ℹ️',
      warning: '⚠️'
    }[type] || '';

    this.elements.statusMsg.textContent = `${icon} ${message}`;
    this.elements.statusMsg.className = `status-msg ${type}`;

    if (duration > 0) {
      setTimeout(() => {
        this.elements.statusMsg.textContent = '';
        this.elements.statusMsg.className = 'status-msg';
      }, duration);
    }
  }

  /**
   * Limpia el input de búsqueda
   */
  clearInput() {
    if (this.elements.barcodeInput) {
      this.elements.barcodeInput.value = '';
      this.elements.barcodeInput.focus();
    }
  }

  /**
   * Enfoca el input de búsqueda
   */
  focusInput() {
    if (this.elements.barcodeInput) {
      this.elements.barcodeInput.focus();
    }
  }

  /**
   * Muestra modal de pago y retorna método seleccionado
   */
  showPaymentModal(total) {
    return new Promise((resolve) => {
      const modal = document.getElementById('payment-modal');
      const totalText = document.getElementById('payment-total-text');
      const cancelBtn = document.getElementById('payment-cancel-btn');
      const methodButtons = document.querySelectorAll('.payment-method-btn');

      // Actualizar total
      totalText.textContent = `Total: $${total.toFixed(2)}`;

      // Mostrar modal
      modal.style.display = 'flex';

      // Manejador para los botones de método de pago
      const handleMethodClick = (e) => {
        const method = e.currentTarget.dataset.method;
        cleanup();
        modal.style.display = 'none';
        resolve(method);
      };

      // Manejador para cancelar
      const handleCancel = () => {
        cleanup();
        modal.style.display = 'none';
        resolve(null);
      };

      // Agregar event listeners
      methodButtons.forEach(btn => {
        btn.addEventListener('click', handleMethodClick);
      });
      cancelBtn.addEventListener('click', handleCancel);

      // Cleanup function
      const cleanup = () => {
        methodButtons.forEach(btn => {
          btn.removeEventListener('click', handleMethodClick);
        });
        cancelBtn.removeEventListener('click', handleCancel);
      };
    });
  }

  /**
   * Muestra confirmación
   */
  confirm(message) {
    return window.confirm(message);
  }

  /**
   * Muestra alerta
   */
  alert(message) {
    window.alert(message);
  }

  /**
   * Reproduce sonido de éxito
   */
  playSuccessSound() {
    // TODO: Implementar sonidos
    console.log('🔊 Beep - Producto agregado');
  }

  /**
   * Reproduce sonido de error
   */
  playErrorSound() {
    // TODO: Implementar sonidos
    console.log('🔊 Error sound');
  }

  /**
   * Muestra un loading
   */
  showLoading(show = true) {
    if (this.elements.statusMsg) {
      if (show) {
        this.elements.statusMsg.textContent = '⏳ Buscando...';
        this.elements.statusMsg.className = 'status-msg info';
      } else {
        this.elements.statusMsg.textContent = '';
        this.elements.statusMsg.className = 'status-msg';
      }
    }
  }
}

// Instancia singleton global
const uiManager = new UIManager();
