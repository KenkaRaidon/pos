/**
 * Cart Module - Gestión del carrito de compras
 */

class CartManager {
  constructor() {
    this.items = [];
    this.listeners = [];
  }

  /**
   * Agrega un producto al carrito
   */
  addProduct(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        quantity: quantity
      });
    }

    this.notifyListeners();
    return this.items;
  }

  /**
   * Actualiza la cantidad de un producto
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeProduct(productId);
      } else {
        item.quantity = quantity;
        this.notifyListeners();
      }
    }
  }

  /**
   * Elimina un producto del carrito
   */
  removeProduct(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.notifyListeners();
  }

  /**
   * Calcula el subtotal de un item
   */
  getItemSubtotal(item) {
    return item.quantity * item.price;
  }

  /**
   * Calcula el total del carrito
   */
  getTotal() {
    return this.items.reduce((total, item) => {
      return total + this.getItemSubtotal(item);
    }, 0);
  }

  /**
   * Obtiene el número total de items
   */
  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Limpia el carrito
   */
  clear() {
    this.items = [];
    this.notifyListeners();
  }

  /**
   * Obtiene todos los items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Verifica si el carrito está vacío
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Suscribe un listener para cambios en el carrito
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica a todos los listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.items, this.getTotal());
    });
  }

  /**
   * Exporta los datos del carrito para guardar una venta
   */
  exportForSale() {
    return {
      items: this.items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: this.getItemSubtotal(item)
      })),
      total: this.getTotal(),
      itemsCount: this.getTotalItems()
    };
  }
}

// Instancia singleton global
const cartManager = new CartManager();
